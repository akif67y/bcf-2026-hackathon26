import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages, UIMessage } from 'ai';

export const maxDuration = 120;

export async function POST(req: Request) {
    try {
        const { messages }: { messages: UIMessage[] } = await req.json();

        const result = await streamText({
            model: google('gemini-3-flash'),
            messages: await convertToModelMessages(messages),
            system: `You are Trinity, an intelligent academic assistant.

You have access to current information through Google's Gemini model with grounding.
Answer questions directly and concisely. Be helpful for students learning programming and computer science.

RESPONSE RULES:
- Be concise. Max 3-4 sentences per point.
- Use markdown formatting for code, lists, and structure.
- For programming questions, include brief code examples.
- For theory, explain simply with examples.`,
        });

        return result.toUIMessageStreamResponse();
    } catch (error: unknown) {
        console.error('Chat API Error:', error);
        const message = error instanceof Error ? error.message : 'Chat failed';
        return new Response(`Error: ${message}`, { status: 500 });
    }
}
