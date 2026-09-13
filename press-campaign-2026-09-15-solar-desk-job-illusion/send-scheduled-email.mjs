import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const dir = path.dirname(fileURLToPath(import.meta.url))
const campaign = JSON.parse(fs.readFileSync(path.join(dir, 'campaign.json'), 'utf8'))

function environment() {
  const source = fs.readFileSync('C:/Users/basse/.codex/config.toml', 'utf8')
  const section = source.match(/\[mcp_servers\.solarroles-mail\.env\]([\s\S]*?)(?=\r?\n\[|$)/)
  if (!section) throw new Error('Missing Solar Roles mail configuration')

  const env = {}
  for (const line of section[1].split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*("(?:[^"\\]|\\.)*"|'[^']*')\s*$/)
    if (match) env[match[1]] = match[2].startsWith('"') ? JSON.parse(match[2]) : match[2].slice(1, -1)
  }

  if (env.EMAIL_USER !== 'pr@solarroles.com') throw new Error('Unexpected sender account')
  env.EMAIL_ADDRESS = campaign.from
  return env
}

function log(file, data) {
  fs.appendFileSync(path.join(dir, file), `${JSON.stringify({ ...data, loggedAt: new Date().toISOString() })}\n`)
}

function renderText(message) {
  return campaign.bodyTemplate.replace('{{GREETING}}', message.greeting)
}

function windowFor(message) {
  return campaign.windows.find((window) => message.scheduledAt.startsWith(window.date))
}

function assertTime(message, now = Date.now()) {
  const window = windowFor(message)
  if (!window) throw new Error('No send window for message')
  const scheduled = Date.parse(message.scheduledAt)
  if (now < Date.parse(window.start) || now < scheduled) throw new Error('Before scheduled time')
  if (now >= Date.parse(window.end) || now > scheduled + 120000) {
    throw new Error('Outside send window or more than two minutes late')
  }
}

function validateCampaign() {
  if (campaign.messages.length !== 31) throw new Error('Expected 31 messages')
  if (new Set(campaign.messages.map((message) => message.to.toLowerCase())).size !== 31) {
    throw new Error('Recipient addresses are not unique')
  }
  if (new Set(campaign.messages.map((message) => message.outlet.toLowerCase())).size !== 31) {
    throw new Error('Outlets are not unique')
  }

  const excluded = new Set(campaign.excludedAlternatives.map((item) => item.address.toLowerCase()))
  for (const [index, message] of campaign.messages.entries()) {
    if (message.index !== index) throw new Error(`Invalid message index ${message.index}`)
    if (excluded.has(message.to.toLowerCase())) throw new Error(`Excluded recipient at index ${index}`)
    const window = windowFor(message)
    if (!window) throw new Error(`Missing window at index ${index}`)
    const scheduled = Date.parse(message.scheduledAt)
    if (scheduled <= Date.parse(window.start) || scheduled >= Date.parse(window.end)) {
      throw new Error(`Message outside its window at index ${index}`)
    }
    const text = renderText(message)
    if (!text.startsWith(`Hi ${message.greeting},`) ||
        !text.includes('404 deduplicated US solar employer-role combinations') ||
        !text.includes('58.6%') ||
        !text.includes('25.8%') ||
        !text.includes(campaign.reportUrl)) {
      throw new Error(`Invalid body at index ${index}`)
    }
  }

  for (const window of campaign.windows) {
    const count = campaign.messages.filter((message) => message.scheduledAt.startsWith(window.date)).length
    if (count !== window.messageCount) throw new Error(`Unexpected count for ${window.date}`)
  }
}

async function main() {
  validateCampaign()
  const check = process.argv.includes('--check')
  const validate = process.argv.includes('--validate')
  if (validate) {
    console.log(JSON.stringify({ valid: true, count: 31, from: campaign.from, windows: campaign.windows }))
    return
  }

  let message
  let index
  if (!check) {
    const argument = process.argv.indexOf('--index')
    index = Number(process.argv[argument + 1])
    if (argument < 0 || !Number.isInteger(index) || !campaign.messages[index]) throw new Error('Invalid index')
    message = campaign.messages[index]
    const untilScheduled = Date.parse(message.scheduledAt) - Date.now()
    if (untilScheduled > 0 && untilScheduled <= 60000) {
      await new Promise((resolve) => setTimeout(resolve, untilScheduled + 100))
    }
    assertTime(message)
  }

  const runtime = 'C:/Users/basse/AppData/Local/SolarRoles/PressCampaigns/2026-09-09/runtime/node_modules'
  const [{ Client }, { StdioClientTransport }] = await Promise.all([
    import(pathToFileURL(path.join(runtime, '@modelcontextprotocol/sdk/dist/esm/client/index.js'))),
    import(pathToFileURL(path.join(runtime, '@modelcontextprotocol/sdk/dist/esm/client/stdio.js'))),
  ])
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.join(runtime, 'mcp-mail-server/dist/index.js')],
    env: { ...process.env, ...environment() },
    stderr: 'pipe',
  })
  transport.stderr?.on('data', () => {})
  const client = new Client({ name: 'solarroles-desk-report-press', version: '1.0.0' })

  try {
    await client.connect(transport)
    if (check) {
      const result = await client.callTool({ name: 'check_connection', arguments: {} })
      const data = JSON.parse(result.content.find((content) => content.type === 'text').text)
      if (result.isError || !data.connections?.smtp?.connected) throw new Error('SMTP connection verification failed')
      console.log(JSON.stringify({
        ok: true,
        smtpConnected: true,
        imapConnected: Boolean(data.connections?.imap?.connected),
        sender: campaign.from,
      }))
      return
    }

    assertTime(message)
    const lock = path.join(dir, 'send.lock')
    const lockFd = fs.openSync(lock, 'wx')
    try {
      const attemptPath = path.join(dir, 'attempt-log.jsonl')
      const attempts = fs.existsSync(attemptPath)
        ? fs.readFileSync(attemptPath, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse)
        : []
      const prior = attempts.filter((attempt) => attempt.index === index)
      if (prior.length) {
        const errorPath = path.join(dir, 'error-log.jsonl')
        const errors = fs.existsSync(errorPath)
          ? fs.readFileSync(errorPath, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse)
          : []
        const verifiedConnectionFailure = errors.some((error) =>
          Number(error.index) === index && error.error.includes('SMTP connection failed:'))
        if (!(message.recoverConnectionFailure === true && prior.length === 1 && verifiedConnectionFailure)) {
          throw new Error('Message already attempted; no automatic duplicate')
        }
      }
      if (attempts.some((attempt) => Date.now() - Date.parse(attempt.attemptedAt) < 180000)) {
        throw new Error('Previous attempt less than three minutes ago')
      }

      assertTime(message)
      log('attempt-log.jsonl', { index, to: message.to, attemptedAt: new Date().toISOString() })
      let result
      for (let connectionAttempt = 0; connectionAttempt < 3; connectionAttempt += 1) {
        assertTime(message)
        result = await client.callTool({
          name: 'send_email',
          arguments: { to: message.to, subject: campaign.subject, text: renderText(message) },
        }, undefined, { timeout: 150000 })
        const detail = result.content.filter((content) => content.type === 'text').map((content) => content.text).join(' ')
        if (!result.isError || !detail.includes('SMTP connection failed:') || connectionAttempt === 2) break
        log('connection-retry-log.jsonl', {
          index,
          connectionAttempt: connectionAttempt + 1,
          reason: 'SMTP verification failed before send',
        })
        await new Promise((resolve) => setTimeout(resolve, 5000))
      }

      if (result.isError) {
        const detail = result.content.filter((content) => content.type === 'text').map((content) => content.text).join(' ')
        throw new Error(`SMTP tool error: ${detail}`)
      }
      const payload = JSON.parse(result.content.find((content) => content.type === 'text').text)
      log('send-log.jsonl', {
        index,
        to: message.to,
        outlet: message.outlet,
        scheduledAt: message.scheduledAt,
        result: payload,
      })
      if (!payload.accepted?.some((address) => String(address).toLowerCase() === message.to.toLowerCase())) {
        throw new Error('SMTP acceptance not confirmed; inspect send log')
      }
      console.log(JSON.stringify({ ok: true, to: message.to, messageId: payload.messageId }))
    } finally {
      fs.closeSync(lockFd)
      fs.unlinkSync(lock)
    }
  } finally {
    await Promise.race([transport.close(), new Promise((resolve) => setTimeout(resolve, 2000))])
  }
}

main().then(() => process.exit(0)).catch((error) => {
  let detail = String(error.message)
  try {
    for (const [key, value] of Object.entries(environment())) {
      if (/PASS|SECRET|TOKEN/.test(key) && value) detail = detail.split(value).join('[REDACTED]')
    }
  } catch {}
  log('error-log.jsonl', {
    index: process.argv.includes('--index') ? process.argv[process.argv.indexOf('--index') + 1] : null,
    error: detail,
  })
  console.error(detail)
  process.exit(1)
})
