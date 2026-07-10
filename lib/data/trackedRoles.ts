// lib/data/trackedRoles.ts
// Dérivé directement de ROLE_CATEGORIES — une seule source de vérité pour les
// rôles suivis, aucune liste à maintenir en double. Le cron pré-calcule la
// demande par état pour chaque entrée de ce tableau.

import { ROLE_CATEGORIES, getRoleKeywords } from '@/lib/roleCategories'

export type TrackedRole = { slug: string; keywords: string[] }

export const TRACKED_ROLES: TrackedRole[] = ROLE_CATEGORIES.map((category) => ({
  slug: category.slug,
  keywords: getRoleKeywords(category),
}))