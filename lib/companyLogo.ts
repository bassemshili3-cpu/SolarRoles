// lib/companyLogo.ts
// Même logique que JobCard.tsx : approxime le domaine de l'entreprise
// pour interroger l'API logo.dev. Centralisé ici pour être réutilisé
// partout où un logo d'entreprise doit s'afficher (JobCard, Similar positions, etc.)

const LOGO_DEV_TOKEN = 'pk_d6CIF_WHQoevYfXGUe1nSQ'

export function getCompanyDomain(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    + '.com'
}

export function getCompanyLogoUrl(companyName: string): string {
  return `https://img.logo.dev/${getCompanyDomain(companyName)}?token=${LOGO_DEV_TOKEN}`
}