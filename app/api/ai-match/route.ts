// app/api/ai-match/route.ts
import { createXai } from '@ai-sdk/xai';   // ← provider officiel xAI
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const xaiProvider = createXai({
  apiKey: process.env.XAI_API_KEY!,
  // baseURL: 'https://api.x.ai/v1'   ← optionnel, c'est déjà le default
});

const schema = z.object({
  title: z.string().optional().describe('Métier principal ou titre de poste recherché'),
  location: z.string().optional().describe('Ville, région, état ou "remote" / "télétravail"'),
  remote: z.boolean().optional().describe('Préférence pour remote ou hybrid'),
  minSalary: z.number().optional().describe('Salaire minimum annuel en USD'),
  keywords: z.array(z.string()).optional().describe('Compétences, mots-clés ou spécialités importantes'),
});

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    if (!description || typeof description !== 'string' || description.length < 5) {
      return NextResponse.json({ error: 'Description trop courte' }, { status: 400 });
    }

    const { object } = await generateObject({
      model: xaiProvider('grok-4-1-fast-reasoning'),   // ou 'grok-4-latest', 'grok-4-0709', etc.
      schema,
      prompt: `
Tu es un extracteur ultra-précis de filtres d'emploi. 
Réponds UNIQUEMENT avec du JSON valide, sans aucun texte avant/après, sans markdown, sans explication.

Exemples :
Input: "Occupational Therapist remote min 110k"
Output: {"title":"Occupational Therapist","remote":true,"minSalary":110000}

Input: "Physical Therapist à Lakeland salaire autour 100k"
Output: {"title":"Physical Therapist","location":"Lakeland","minSalary":100000}

Description utilisateur :
"${description}"
      `.trim(),
      temperature: 0.0,
      maxOutputTokens: 300,
    });

    return NextResponse.json({ filters: object });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Erreur lors de la génération des filtres' }, { status: 500 });
  }
}