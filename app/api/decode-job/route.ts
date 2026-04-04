import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

const SYSTEM_PROMPT = `You are a brutally honest job posting decoder for Gen Z job seekers. Analyze job descriptions and expose corporate BS with wit and precision.

Return ONLY a valid JSON object (no markdown, no backticks) with this exact structure:
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

Extract 4-7 of the most telling phrases. Focus on buzzwords, vague language, salary opacity, culture claims, and workload hints. Be sharp, funny but fair. Never fabricate — only analyze what's in the text.`;

export async function POST(req: NextRequest) {
  try {
    const { jobDescription } = await req.json();

    if (!jobDescription || typeof jobDescription !== "string") {
      return NextResponse.json({ error: "Missing job description" }, { status: 400 });
    }

    if (jobDescription.length > 5000) {
      return NextResponse.json({ error: "Job description too long (max 5000 characters)" }, { status: 400 });
    }

    const completion = await client.chat.completions.create({
      model: "grok-3",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Decode this job posting:\n\n${jobDescription}` },
      ],
      temperature: 0.7,
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    let parsed;
    try {
      const clean = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    if (!parsed.flags || !Array.isArray(parsed.flags) || !parsed.verdict || !parsed.score) {
      return NextResponse.json({ error: "Invalid AI response shape" }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[decode-job] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}