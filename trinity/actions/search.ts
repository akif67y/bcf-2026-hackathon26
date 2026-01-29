'use server';

import { createClient } from '@/utils/supabase/server';
import { getEmbeddings } from '@/lib/ai/embedding';
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function searchMaterialsAction(query: string, fileId?: string) {
    if (!query) return { answer: '', sources: [] };

    try {
        const supabase = await createClient();

        // 1. EMBED QUERY
        // Must use the same model (Xenova) that created the DB embeddings
        const vectors = await getEmbeddings([query]);
        const queryVector = vectors[0];

        // 2. SEARCH (Loosened Constraints)
        // We grab the top 10 chunks to ensure we don't miss context
        const { data: chunks, error } = await supabase.rpc('match_documents', {
            query_embedding: queryVector,
            match_threshold: 0.5, // Changed from 0.25 (Strict) to 0.5 (Broad)
            match_count: 10,      // Changed from 1 to 10
            filter_material_id: fileId || null,
        });

        if (error) {
            console.error("RPC Error:", error);
            return { answer: "Error searching database.", sources: [] };
        }

        if (!chunks || chunks.length === 0) {
            return { answer: "I couldn't find any relevant information in the uploaded materials.", sources: [] };
        }

        // 3. SYNTHESIS (The "NotebookLM" Step)
        // We feed all 10 chunks to Gemini and ask it to write a final answer.
        const contextBlock = chunks
            .map((c: any) => `[Source: ${c.material_title || "Unknown"}]\n${c.content_chunk}`)
            .join("\n\n");

        const { text } = await generateText({
            model: google("gemini-2.5-flash"), // User requested 2.5-flash
            system: "You are a helpful academic tutor. Answer the question using ONLY the provided context. Cite your sources.",
            prompt: `
              USER QUESTION: ${query}

              CONTEXT:
              ${contextBlock}
            `,
        });

        // 4. RETURN FORMAT
        // We return both the answer and the raw sources for the UI to display citations
        return {
            answer: text,
            sources: chunks.map((c: any) => ({
                id: c.id,
                content: c.content_chunk,
                filename: c.material_title,
                similarity: c.similarity
            }))
        };
    } catch (error) {
        console.error("Search Error:", error);
        return { answer: "An unexpected error occurred.", sources: [] };
    }
}

export async function getMaterials() {
    const supabase = await createClient();
    const { data } = await supabase.from('materials').select('id, title');
    return data || [];
}