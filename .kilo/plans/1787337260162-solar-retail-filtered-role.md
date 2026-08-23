# Plan: "Retail Associate - Solar Sales" / "Retail Sales Representative" encore en `filtered_role`

## Contexte & diagnostic (déjà investigué)
Les deux titres sont déjà couverts par `lib/ats/solar-taxonomy.ts` :

- `Retail Associate - Solar Sales` → contient **"Solar Sales"** → match du pattern INCLUDE existant
  `/solar\s*sales\s*(representative|rep|specialist|consultant|manager|engineer)?/i` (Tier 1, titre seul).
- `Retail Sales Representative` → pas de token "solar" → Tier 2 : `GENERIC_TITLE_PATTERNS`
  contient `/\bsales\s*(representative|rep)\b/i`, et `lib/ats/custom-scrape/index.ts:199` ajoute
  **toujours** `Company context: <company> is a solar installation company.` à la description,
  ce qui satisfait le strong signal `/solar\s*(installation|construction)\s*(company|crew|team)/i`.

 => Avec le code courant (après la modif de la taxonomy sur les titres corporate Venture Solar),
    ces deux titres NE PEUVENT PAS être `filtered_role`.

## Hypothèse racine la plus probable
Le dry-run affiché est **stale** (output précédent, ou cache de transpilation tsx), pas un défaut
des patterns. Les diagnostics collés plus tôt (`filtered_role: 38`) dataient d'avant l'extension
corporate-solar d'août 2026 ; après ma modif, Venture Solar ne devrait plus avoir que ~2
`filtered_role` (Roofing Sales Manager, Permitting Department Intern — exclus volontairement).

## Étapes d'implémentation

1. **Verrouiller le comportement avec un test de non-régression**
   Dans `tests/custom-scrape.test.ts` (après la ligne 37), ajouter :
   ```ts
   assert.equal(isSolarInstallerRole('Retail Associate - Solar Sales', 'Company context: Venture Solar is a solar installation company.'), true);
   assert.equal(isSolarInstallerRole('Retail Sales Representative', 'Company context: Venture Solar is a solar installation company.'), true);
   ```
   (Le test existant utilise déjà exactement ce format de description « company context ».)

2. **Renfort déterministe (optionnel mais recommandé)** dans `INCLUDE_PATTERNS` de
   `lib/ats/solar-taxonomy.ts`, ajouter explicitement (belt-and-suspenders, ne dépend pas du
   fallback description) :
   ```ts
   /retail\s*associate\s*[\s-]*solar/i, // "Retail Associate - Solar Sales"
   ```
   (`Retail Sales Representative` reste volontairement en Tier 2 via le contexte solar de la description.)

3. **Validation (à exécuter, pas en plan mode)**
   - Lancer `npx tsx scripts/dry-run-custom-scrape.ts venturesolar.applytojob.com`.
   - Attendu : `filtered_role` ≈ 2 (Roofing Sales Manager, Permitting Department Intern).
   - Lancer `npx tsx tests/custom-scrape.test.ts` → doit afficher `custom-scrape tests passed`.

4. **Si les deux titres réapparaissent STILL en `filtered_role` après re-run**
   (contrairement à l'attendu) → diagnostiquer la cause réelle, PAS retoucher les patterns à l'aveugle :
   - Vider le cache tsx (`npx tsx --clear-cache` ou supprimer `node_modules/.cache`) et rejouer l'étape 3.
   - Si toujours filtrés, sonder une URL réelle (ex. `…/apply/2zfJJk7FPP/Retail-Sales-Representative`)
     en loggant `detail.title` + `description.length` + présence de `solar installation company`
     dans la description, pour vérifier si `extractJobDetail` (`detail.ts:101`) renvoie un titre
     JSON-LD sans le token "Solar Sales" (variance de titre). Si oui, élargir l'INCLUDE pour matcher
     la forme réelle du titre JSON-LD.

## Risques
- Ajouter `Retail Sales Representative` en INCLUDE (au lieu de Tier 2) serait trop générique
  (faux positifs hors employeur solar curated) → on le garde en Tier 2.
- Ne pas toucher à l'exclusion volontaire de roofing/permitting sauf demande explicite.

## Open question
Veux-tu aussi inclure `Roofing Sales Manager` et `Permitting Department Intern` (actuellement
exclus volontairement pour limiter les faux positifs) ? Sinon, ils resteront les seuls `filtered_role`.
