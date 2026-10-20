const routes = { seed: 'sync-ats', rewrite: 'rewrite-seed-descriptions' };
export async function dispatch(kind, time, env, fetcher = fetch) {
  if (!routes[kind]) throw Error('Invalid cron kind');
  if (env.CRONS_ENABLED !== 'true') return { decision: 'disabled', kind };
  const response = await fetcher(new URL('/.netlify/functions/' + routes[kind], env.APP_ORIGIN), {
    method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(90_000),
    headers: { authorization: `Bearer ${env.CRON_SECRET}`, 'x-scheduled-time': String(time), 'user-agent': 'SolarRoles-Cron/1.0 (+https://solarroles.com)'  },
  });
  if (!response.ok) { await response.body?.cancel(); throw Error(`${kind} dispatch HTTP ${response.status}`); }
  const result = await response.json();
  console.log(JSON.stringify({ kind, scheduledAt: new Date(time).toISOString(), ...result }));
  return result;
}
export default {
  async scheduled(event, env) {
    const kind = event.cron === '17 * * * *' ? 'seed' : event.cron === '* * * * *' ? 'rewrite' : null;
    if (!kind) throw Error('Unknown cron');
    await dispatch(kind, event.scheduledTime, env);
  },
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/health' && request.method === 'GET') return Response.json({ service: 'solarroles-crons', scheduler: 'cloudflare', cronsEnabled: env.CRONS_ENABLED === 'true', execution: 'netlify', rewriteProvider: 'groq' });
    if (!env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${env.CRON_SECRET}`) return new Response('Unauthorized', { status: 401 });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    if (url.pathname === '/internal/groq') {
      if (Number(request.headers.get('content-length') || 0) > 500_000) return new Response('Too large', { status: 413 });
      const raw = await request.text();
      if (raw.length > 500_000) return new Response('Too large', { status: 413 });
      let body; try { body = JSON.parse(raw); } catch { return new Response('Invalid JSON', { status: 400 }); }
      if (body.model !== env.GROQ_MODEL || body.max_completion_tokens !== 2000 || body.stream || !Array.isArray(body.messages) || body.messages.length !== 2 || body.messages[0].role !== 'system' || body.messages[1].role !== 'user') return new Response('Invalid rewrite request', { status: 400 });
      const key = await env.GROQ_API_KEY.get();
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(110_000),
        headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify({ model: env.GROQ_MODEL, messages: body.messages, max_completion_tokens: 2000, temperature: 0.2, reasoning_effort: 'low' }),
      });
      // Provider failures contain neither the submitted posting nor credentials.
      const headers = new Headers({ 'content-type': 'application/json', 'cache-control': 'no-store' });
      if (response.headers.has('retry-after')) headers.set('retry-after', response.headers.get('retry-after'));
      if (!response.ok) { await response.body?.cancel(); return Response.json({ error: 'Groq request rejected' }, { status: response.status, headers }); }
      return new Response(response.body, { status: response.status, headers });
    }
    if (url.pathname === '/run/seed' || url.pathname === '/run/rewrite') return Response.json(await dispatch(url.pathname.split('/').at(-1), Date.now(), env));
    return new Response('Not found', { status: 404 });
  },
};
