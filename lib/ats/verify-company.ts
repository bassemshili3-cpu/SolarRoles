// lib/ats/verify-company.ts
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function nameLooksLike(expected: string, candidate: string): boolean {
  const e = normalize(expected);
  const c = normalize(candidate);
  return c.includes(e) || e.includes(c);
}

// Le endpoint JSON de Lever ne renvoie pas le nom de l'employeur.
// La page publique du board, si — on la fetch une fois pour cross-check
// avant de faire confiance à un slug non vérifié.
export async function verifyLeverCompany(
  slug: string,
  expectedName: string,
  userAgent: string
): Promise<{ ok: boolean; foundTitle?: string }> {
  try {
    const res = await fetch(`https://jobs.lever.co/${slug}`, {
      headers: { 'User-Agent': userAgent },
    });
    if (!res.ok) return { ok: false };

    const html = await res.text();
    const match = html.match(/<title>(.*?)<\/title>/i);
    if (!match) return { ok: false };

    return { ok: nameLooksLike(expectedName, match[1]), foundTitle: match[1] };
  } catch {
    return { ok: false };
  }
}