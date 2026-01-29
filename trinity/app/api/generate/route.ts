import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 300;

export async function POST(req: Request) {
    const { prompt, mode } = await req.json();
    
    if (!prompt) {
        return new Response('Prompt is required', { status: 400 });
    }

    const systemPrompt = mode === 'Lab' 
        ? `You are a concise coding instructor. Generate SHORT, practical lab materials.

FORMAT (strictly follow):
## Problem Description
[2-3 sentences max]

## Instructions
1. [Step]
2. [Step]
(max 5 steps)

## Starter Code
\`\`\`[language]
[minimal skeleton code]
\`\`\`

## Solution
\`\`\`[language]
[working solution with brief inline comments]
\`\`\`

RULES:
- Be brief. No fluff.
- Code comments only where essential.
- Max 300 words total.`
        : `You are a concise academic writer. Generate SHORT, focused theory notes.

FORMAT (strictly follow):
## Summary
[2-3 sentences max]

## Key Points
- [Point 1]
- [Point 2]
- [Point 3]
(max 5 points)

## Core Concepts
### [Concept Name]
[1-2 sentences explanation]

## Quick Review
1. [Question]?
2. [Question]?

RULES:
- Be brief. No fluff.
- Use bullet points over paragraphs.
- Max 250 words total.`;

    try {
        const result = await streamText({
            model: google('gemini-3-flash-preview'),
            system: systemPrompt,
            prompt: `Topic: "${prompt}". Be concise.`,
        });

        return result.toTextStreamResponse();
    } catch (error: any) {
        console.error("Generation Error:", error?.message);
        return new Response(`Error: ${error?.message || 'Generation failed'}`, { status: 500 });
    }
}
