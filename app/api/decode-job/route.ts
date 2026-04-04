// app/api/decode-job/route.ts
import { createXai } from '@ai-sdk/xai';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

const xaiProvider = createXai({
  apiKey: process.env.XAI_API_KEY!,
});

const SYSTEM_PROMPT = `You are a helpful career advisor that analyzes job postings to help young gen Z candidates to make informed decisions. Your tone is honest, direct, and professional — like a senior recruiter giving candid advice to a friend. Do not use unecessary dash.

Return ONLY a valid JSON object (no markdown, no backticks, no explanation) with this exact structure:
{
  "flags": [
    {
      "category": "short category label (e.g. Culture, Salary, Workload, Management, Growth)",
      "original": "exact phrase or sentence from the job posting",
      "translation": "what it REALLY means, sarcastic but accurate, max 1 sentence",
      "severity": "green" | "yellow" | "red"
    }
  ],
  "verdict": "1-2 sentence honest overall verdict on this job posting",
  "score": "green" | "yellow" | "red"
}

Severity rules:
- green: neutral or genuinely positive signal
- yellow: mild red flag, proceed with caution
- red: major red flag, serious concern

Extract 4-7 of the most telling phrases. Focus on buzzwords, vague language, salary opacity, culture claims, and workload hints. Be helpful and factual — never mock the employer. Never fabricate — only analyze what is actually in the text.`;

export async function POST(req: NextRequest) {
  try {
    const { jobDescription } = await req.json();

    if (!jobDescription || typeof jobDescription !== 'string') {
      return NextResponse.json({ error: 'Missing job description' }, { status: 400 });
    }

    if (jobDescription.length > 5000) {
      return NextResponse.json({ error: 'Job description too long (max 5000 characters)' }, { status: 400 });
    }

    const { text } = await generateText({
      model: xaiProvider('grok-4-1-fast-reasoning'),
      system: SYSTEM_PROMPT,
      prompt: `Decode this job posting:\n\n${jobDescription}`,
      temperature: 0.7,
      maxOutputTokens: 1024,
    });

    let parsed;
    try {
      const clean = text.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      console.error('[decode-job] JSON parse failed:', text);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    if (!parsed.flags || !Array.isArray(parsed.flags) || !parsed.verdict || !parsed.score) {
      return NextResponse.json({ error: 'Invalid AI response shape' }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error('[decode-job] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}