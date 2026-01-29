
import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { getEmbeddings } from '@/lib/ai/embedding';

export const maxDuration = 60; // Allow 60s for generation

// Schemas
const TheorySchema = z.object({
    type: z.literal('Theory'),
    title: z.string(),
    readingNotes: z.object({
        summary: z.string(),
        keyPoints: z.array(z.string()),
        detailedSections: z.array(z.object({
            heading: z.string(),
            content: z.string(),
        })),
    }),
    slides: z.array(z.object({
        slideTitle: z.string(),
        bulletPoints: z.array(z.string()),
        speakerNotes: z.string().optional(),
    })),
});

const LabSchema = z.object({
    type: z.literal('Lab'),
    title: z.string(),
    language: z.string(),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    description: z.string(),
    code: z.string(),
    instructions: z.array(z.string()),
    solution: z.string().optional(),
});

const LearningMaterialSchema = z.discriminatedUnion('type', [TheorySchema, LabSchema]);

// Mock External Knowledge
async function searchExternalKnowledge(query: string) {
    console.log(`[Method: MCP] Searching external knowledge for: ${query}`);
    // Mock response
    return `External Context: Basic academic knowledge about "${query}".`;
}

// Internal RAG
async function searchInternalContext(query: string, supabase: any) {
    try {
        const vectors = await getEmbeddings([query]);
        const { data, error } = await supabase.rpc('match_documents', {
            query_embedding: vectors[0],
            match_threshold: 0.25,
            match_count: 5,
        });

        if (error) {
            console.error("RPC Error:", error);
            return "";
        }
        return data?.map((d: any) => d.content_chunk).join("\n\n") || "";
    } catch (e) {
        console.error("Embedding Error:", e);
        return "";
    }
}

export async function POST(req: Request) {
    const { prompt, mode } = await req.json();
    const supabase = await createClient();

    console.log(`🚀 [API] Generating ${mode} for: "${prompt}"`);

    // 1. Context Retrieval
    const [internalContext, externalContext] = await Promise.all([
        searchInternalContext(prompt, supabase),
        searchExternalKnowledge(prompt),
    ]);

    const fullContext = `
    INTERNAL CONTEXT (User Uploaded Materials):
    ${internalContext}

    EXTERNAL CONTEXT (General Knowledge):
    ${externalContext}

    AI INTERNAL KNOWLEDGE:
    Use your training data to supplement the above contexts.
  `;

    // 2. Stream Object
    try {
        const result = streamObject({
            model: google('gemini-2.5-flash'), // Switched to 2.5-flash as requested
            schema: LearningMaterialSchema,
            system: `
        You are an expert educational content generator.
        Goal: Create high-quality ${mode} materials for the topic: "${prompt}".

        Context:
        ${fullContext}

        Instructions:
        - Internal Context is PRIORITY.
        - Mode "${mode}" requires a specific structure.
        Instructions:
        - Internal Context is PRIORITY.
        - Mode "${mode}" requires a specific structure.
        - IMPORTANT: Output MUST be valid JSON matching the schema.
        - Keep content concise where possible.
        - For "Theory", use nested objects: { readingNotes: { summary: "...", keyPoints: [...] }, slides: [...] }.
        - For "Lab", use: { title: "...", description: "...", code: "..." }.
        `,
            prompt: `Generate ${mode} materials for "${prompt}".`,
            onFinish: async ({ object }) => {
                if (!object) return;
                // Save to DB
                try {
                    await supabase.from('generated_content').insert({
                        title: object.title,
                        type: object.type,
                        content_json: object,
                    });
                    console.log("✅ Saved to DB");
                } catch (e) {
                    console.error("❌ DB Save Error:", e);
                }
            }
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error("❌ Generation Error:", error);
        return new Response(JSON.stringify({ error: 'Generation failed' }), { status: 500 });
    }
}
