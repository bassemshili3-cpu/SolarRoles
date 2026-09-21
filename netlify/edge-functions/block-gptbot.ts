export default function blockGptBot(request: Request): Response | undefined {
  const userAgent = request.headers.get('user-agent') ?? ''

  if (!/\bGPTBot\b/i.test(userAgent)) {
    return undefined
  }

  return new Response('Forbidden', {
    status: 403,
    headers: {
      'cache-control': 'no-store',
      'content-type': 'text/plain; charset=utf-8',
    },
  })
}

export const config = {
  path: '/*',
  header: {
    'user-agent': '[Gg][Pp][Tt][Bb][Oo][Tt]',
  },
}
