import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { getEmbeddings } from '@/lib/ai/embedding';

export const maxDuration = 60;

export async function POST(req: Request) {
    const { messages } = await req.json();
    const supabase = await createClient();

    const result = streamText({
        model: google('gemini-2.5-flash'),
        messages,
        system: `You are an intelligent academic tutor for the course.
    
    CAPABILITIES:
    1. SEARCH: You MUST use the 'searchMaterials' tool if the user asks a question about course content.
    2. EXPLAIN: Synthesize answers based strictly on the search results.
    3. CITE: When you use information from a search result, cite it as [Source: filename].
    
    If the user asks for something not in the course, acknowledge it and use general knowledge but warn them it's external.`,

        tools: {
            searchMaterials: {
                description: 'Search the course knowledge base (PDFs, docs) for information.',
                parameters: z.object({
                    query: z.string().describe('The search query to find relevant information'),
                }),
                execute: async ({ query }) => {
                    try {
                        const vectors = await getEmbeddings([query]);
                        if (!vectors || vectors.length === 0) {
                            return "Error: Could not generate embeddings for search.";
                        }

                        const { data, error } = await supabase.rpc('match_documents', {
                            query_embedding: vectors[0],
                            match_threshold: 0.4,
                            match_count: 5,
                        });

                        if (error || !data || data.length === 0) {
                            return "No relevant documents found in the course materials.";
                        }

                        return data.map((d: { material_title?: string; content_chunk: string }) =>
                            `[Source: ${d.material_title || 'Unknown'}]\n${d.content_chunk}`
                        ).join('\n\n---\n\n');
                    } catch (e) {
                        console.error('Search error:', e);
                        return "Error searching the database.";
                    }
                },
            },
        },
    });

    return result.toDataStreamResponse();
}
