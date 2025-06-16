import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = 'AIzaSyBJw25dxb5pBL-NR_6DKcYILCwmkciD1l8';

export async function POST(req: NextRequest) {
  const { transcript } = await req.json();

  const prompt = `
You are a professional sales trainer.
Analyze the following mock sales call and return:
1. A score out of 100 based on clarity, persuasion, objection handling, and tone.
2. Three strengths.
3. Three weaknesses.
4. Three coaching suggestions.

Transcript:
---
${transcript}
---
Return your answer in JSON.
`;

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      }),
    }
  );

  const data = await geminiRes.json();
  let feedback = {};
  let score = null;
  try {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    feedback = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
    score = feedback.score;
  } catch (e) {
    feedback = { error: 'Could not parse feedback.' };
  }

  return NextResponse.json({ score, feedback });
} 