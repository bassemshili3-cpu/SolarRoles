#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import tls from "node:tls";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function argValue(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}

const indexArg = argValue("--index");
if (!indexArg || !/^\d+$/.test(indexArg)) {
  console.error("Usage: node send-scheduled-email.mjs --index <1-based message index>");
  process.exit(2);
}
const index = Number(indexArg);

const campaignPath = path.join(__dirname, "campaign.json");
const campaign = JSON.parse(fs.readFileSync(campaignPath, "utf8"));
const message = campaign.messages?.find((m) => Number(m.id) === index);
if (!message) {
  console.error(`No message with id ${index} in campaign.json`);
  process.exit(2);
}

const smtpUser = process.env.SOLARROLES_SMTP_USER;
const smtpPass = process.env.SOLARROLES_SMTP_PASS;
if (!smtpUser || !smtpPass) {
  console.error("SMTP credentials are missing. Run through launch.ps1 / register.ps1.");
  process.exit(2);
}

const host = campaign.smtpHost || "smtp.ionos.fr";
const port = Number(campaign.smtpPort || 587);
const fromMatch = String(campaign.from || "").match(/<([^>]+)>/);
const envelopeFrom = fromMatch ? fromMatch[1] : smtpUser;
const replyTo = campaign.replyTo || envelopeFrom;
const logPath = path.join(__dirname, "error-log.jsonl");

function logEvent(obj) {
  fs.appendFileSync(
    logPath,
    JSON.stringify({ ts: new Date().toISOString(), campaignId: campaign.campaignId, messageId: index, ...obj }) + "\n",
    "utf8"
  );
}

function encodeHeader(value) {
  const s = String(value);
  if (/^[\x20-\x7E]*$/.test(s)) return s;
  return `=?UTF-8?B?${Buffer.from(s, "utf8").toString("base64")}?=`;
}

function wrapBase64(buf) {
  return buf.toString("base64").match(/.{1,76}/g)?.join("\r\n") ?? "";
}

function dotStuff(text) {
  return text.replace(/^\./gm, "..");
}

function readReply(socket, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    let buf = "";
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("SMTP response timeout"));
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timer);
      socket.off("data", onData);
      socket.off("error", onError);
      socket.off("close", onClose);
    }
    function onError(err) {
      cleanup();
      reject(err);
    }
    function onClose() {
      cleanup();
      reject(new Error("SMTP socket closed unexpectedly"));
    }
    function onData(chunk) {
      buf += chunk.toString("utf8");
      const lines = buf.split(/\r?\n/).filter(Boolean);
      const final = [...lines].reverse().find((line) => /^\d{3} /.test(line));
      if (final) {
        cleanup();
        resolve({ code: Number(final.slice(0, 3)), text: buf.trim() });
      }
    }

    socket.on("data", onData);
    socket.on("error", onError);
    socket.on("close", onClose);
  });
}

async function sendCommand(socket, command, expectedCodes) {
  const replyPromise = readReply(socket);
  socket.write(command + "\r\n", "utf8");
  const reply = await replyPromise;
  if (!expectedCodes.includes(reply.code)) {
    throw new Error(`SMTP command failed (${command.split(" ")[0]}): ${reply.text}`);
  }
  return reply;
}

async function connectPlain() {
  return await new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error("SMTP connect timeout"));
    }, 20000);
    socket.once("connect", () => {
      clearTimeout(timer);
      resolve(socket);
    });
    socket.once("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

async function upgradeTls(socket) {
  return await new Promise((resolve, reject) => {
    const secure = tls.connect({ socket, servername: host, minVersion: "TLSv1.2" });
    const timer = setTimeout(() => {
      secure.destroy();
      reject(new Error("SMTP TLS handshake timeout"));
    }, 20000);
    secure.once("secureConnect", () => {
      clearTimeout(timer);
      resolve(secure);
    });
    secure.once("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

async function sendMail() {
  if (fs.existsSync(logPath)) {
    const prior = fs.readFileSync(logPath, "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => { try { return JSON.parse(line); } catch { return null; } })
      .filter(Boolean);
    if (prior.some((x) => x.status === "sent" && Number(x.messageId) === index && x.campaignId === campaign.campaignId)) {
      console.log(`[SKIP] #${index} was already recorded as sent.`);
      return;
    }
  }

  let socket = await connectPlain();
  try {
    let r = await readReply(socket);
    if (r.code !== 220) throw new Error(`SMTP greeting failed: ${r.text}`);

    await sendCommand(socket, "EHLO solarroles.com", [250]);
    await sendCommand(socket, "STARTTLS", [220]);
    socket = await upgradeTls(socket);
    await sendCommand(socket, "EHLO solarroles.com", [250]);

    await sendCommand(socket, "AUTH LOGIN", [334]);
    await sendCommand(socket, Buffer.from(smtpUser, "utf8").toString("base64"), [334]);
    await sendCommand(socket, Buffer.from(smtpPass, "utf8").toString("base64"), [235]);

    await sendCommand(socket, `MAIL FROM:<${envelopeFrom}>`, [250]);
    await sendCommand(socket, `RCPT TO:<${message.to}>`, [250, 251]);
    await sendCommand(socket, "DATA", [354]);

    const fullBody = `${message.body}\n\n${campaign.footer}`.replace(/\r?\n/g, "\r\n");
    const bodyEncoded = wrapBase64(Buffer.from(fullBody, "utf8"));
    const domain = envelopeFrom.includes("@") ? envelopeFrom.split("@")[1] : "solarroles.com";
    const msgId = `<${campaign.campaignId}.${String(index).padStart(2, "0")}.${crypto.randomUUID()}@${domain}>`;

    const headers = [
      `From: ${campaign.from}`,
      `To: ${message.to}`,
      `Reply-To: ${replyTo}`,
      `Subject: ${encodeHeader(message.subject)}`,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: ${msgId}`,
      "MIME-Version: 1.0",
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: base64",
      `X-SolarRoles-Campaign: ${campaign.campaignId}`,
      `X-SolarRoles-Contact-ID: ${message.contactId}`,
      "",
      bodyEncoded,
    ].join("\r\n");

    const acceptedPromise = readReply(socket);
    socket.write(dotStuff(headers) + "\r\n.\r\n", "utf8");
    const accepted = await acceptedPromise;
    if (accepted.code !== 250) throw new Error(`SMTP DATA was not accepted: ${accepted.text}`);

    try { await sendCommand(socket, "QUIT", [221]); } catch {}
    logEvent({ status: "sent", to: message.to, subject: message.subject, resourceUrl: message.resourceUrl });
    console.log(`[SENT] #${index} ${message.to} — ${message.subject}`);
  } finally {
    if (socket && !socket.destroyed) socket.end();
  }
}

sendMail().catch((err) => {
  const error = err?.stack || String(err);
  try { logEvent({ status: "error", to: message.to, subject: message.subject, error }); } catch {}
  console.error(error);
  process.exit(1);
});
