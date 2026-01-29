import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 300;

export async function POST(req: Request) {
    const { prompt, mode } = await req.json();
    
    if (!prompt) {
        return new Response('Prompt is required', { status: 400 });
    }

    const systemPrompt = `You are an expert academic content generator. Generate COMPREHENSIVE learning materials in Markdown.

For ${mode || 'Theory'} mode:
${mode === 'Lab' ? `- Start with "## Problem Description"
- Include "## Instructions" (numbered list)
- Provide "## Starter Code" (code block)
- Provide "## Solution Walkthrough"` : `- Start with "## Summary"
- Include "## Key Points"
- Create detailed sections with "## [Topic Name]"
- End with "## Review Questions"`}

Output only valid Markdown. Be thorough and educational.`;

    try {
        const result = await streamText({
            model: google('gemini-3-flash-preview'),
            system: systemPrompt,
            prompt: `Generate comprehensive ${mode || 'Theory'} materials for: "${prompt}"`,
        });

        return result.toTextStreamResponse();
    } catch (error: any) {
        console.error("Generation Error:", error?.message);
        return new Response(`Error: ${error?.message || 'Generation failed'}`, { status: 500 });
    }
}
