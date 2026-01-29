import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages, UIMessage, tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { getEmbeddings } from '@/lib/ai/embedding';

export const maxDuration = 120;

export async function POST(req: Request) {
    try {
        const { messages }: { messages: UIMessage[] } = await req.json();
        const supabase = await createClient();

        const result = await streamText({
            model: google('gemini-3-flash-preview'),
            messages: await convertToModelMessages(messages),
            system: `You are Trinity, an intelligent academic assistant for course materials.

CAPABILITIES & TOOLS:
1. **searchMaterials** - Search uploaded course PDFs/docs. USE THIS for any course-related question.
2. **listMaterials** - List all available materials. Use when user asks "what's available" or "show files".
3. **generateContent** - Generate new theory notes or lab exercises on a topic.

RESPONSE RULES:
- Be concise. Max 3-4 sentences per point.
- Always cite sources as [Source: filename] when using search results.
- If no course materials found, say so and offer to generate content or use general knowledge.
- For file searches, show results in a clean list format.
- For generation requests, confirm what you're generating then use the tool.

DETECT USER INTENT:
- "explain X", "what is X", "help with X" → searchMaterials first
- "show files", "list materials", "what's uploaded" → listMaterials
- "generate notes on X", "create lab for X", "make content about X" → generateContent
- Follow-up questions → use context from previous messages`,

            tools: {
                searchMaterials: tool({
                    description: 'Search course knowledge base for relevant information',
                    inputSchema: z.object({
                        query: z.string().describe('Search query'),
                    }),
                    execute: async ({ query }) => {
                        try {
                            const vectors = await getEmbeddings([query]);
                            if (!vectors?.length) return "Could not process search query.";

                            const { data, error } = await supabase.rpc('match_documents', {
                                query_embedding: vectors[0],
                                match_threshold: 0.3,
                                match_count: 5,
                            });

                            if (error || !data?.length) {
                                return "No matching course materials found. I can generate content on this topic if you'd like.";
                            }

                            return data.map((d: { material_title?: string; content_chunk: string }) =>
                                `[Source: ${d.material_title || 'Unknown'}]\n${d.content_chunk}`
                            ).join('\n\n---\n\n');
                        } catch {
                            return "Search failed. Please try again.";
                        }
                    },
                }),

                listMaterials: tool({
                    description: 'List all uploaded course materials',
                    inputSchema: z.object({}),
                    execute: async () => {
                        try {
                            const { data, error } = await supabase
                                .from('materials')
                                .select('id, title, category, week_number, created_at')
                                .order('week_number', { ascending: true });

                            if (error || !data?.length) {
                                return "No materials uploaded yet. Visit /cms to upload course content.";
                            }

                            const list = data.map((m: { title: string; category: string; week_number: number }) =>
                                `- **${m.title}** (${m.category}, Week ${m.week_number})`
                            ).join('\n');

                            return `**Available Materials (${data.length} files):**\n${list}`;
                        } catch {
                            return "Could not fetch materials list.";
                        }
                    },
                }),

                generateContent: tool({
                    description: 'Generate theory notes or lab exercises on a topic',
                    inputSchema: z.object({
                        topic: z.string().describe('Topic to generate content for'),
                        mode: z.enum(['Theory', 'Lab']).describe('Type of content'),
                    }),
                    execute: async ({ topic, mode }) => {
                        const prompt = mode === 'Lab'
                            ? `Create a brief ${mode} exercise:\n## Problem\n[2 sentences]\n## Steps\n1-4 steps\n## Code\n\`\`\`\n[starter + solution]\n\`\`\`\nTopic: ${topic}`
                            : `Create brief ${mode} notes:\n## Summary\n[2 sentences]\n## Key Points\n- 3-4 bullets\n## Quick Review\n1-2 questions\nTopic: ${topic}`;

                        return `**Generated ${mode} Content for "${topic}":**\n\n${prompt}\n\n_Use /generate page for full-featured generation._`;
                    },
                }),
            },
        });

        return result.toUIMessageStreamResponse();
    } catch (error: unknown) {
        console.error('Chat API Error:', error);
        const message = error instanceof Error ? error.message : 'Chat failed';
        return new Response(`Error: ${message}`, { status: 500 });
    }
}
