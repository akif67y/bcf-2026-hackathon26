import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { getEmbeddings } from '@/lib/ai/embedding';

export const maxDuration = 60; // Allow 60s for generation

// Unified Schema (discriminated unions can cause streaming parse issues)
const LearningMaterialSchema = z.object({
    type: z.enum(['Theory', 'Lab']),
    title: z.string(),
    // Theory fields
    readingNotes: z.object({
        summary: z.string(),
        keyPoints: z.array(z.string()),
        detailedSections: z.array(z.object({
            heading: z.string(),
            content: z.string(),
        })),
    }).optional(),
    slides: z.array(z.object({
        slideTitle: z.string(),
        bulletPoints: z.array(z.string()),
        speakerNotes: z.string().optional(),
    })).optional(),
    // Lab fields
    language: z.string().optional(),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
    description: z.string().optional(),
    code: z.string().optional(),
    instructions: z.array(z.string()).optional(),
    solution: z.string().optional(),
});

// External Knowledge (Wikipedia)
import { getExternalContext } from '@/lib/external';

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
        return data?.map((d: any) => `[Source: ${d.material_title || 'Unknown'}]\n${d.content_chunk}`).join("\n\n") || "";
    } catch (e) {
        console.error("Embedding Error:", e);
        return "";
    }
}

export async function POST(req: Request) {
    const { prompt, mode } = await req.json();
    const supabase = await createClient();

    console.log(`🚀 [API] Generating ${mode} for: "${prompt}"`);

    // 1. Context Retrieval (Parallel)
    const [internalContext, externalContext] = await Promise.all([
        searchInternalContext(prompt, supabase),
        getExternalContext(prompt),
    ]);

    const fullContext = `
    PRIORITY INTERNAL CONTEXT (User Uploaded Materials):
    ${internalContext}

    SUPPLEMENTARY EXTERNAL CONTEXT (Wikipedia):
    ${externalContext || "No external context available."}
  `;

    // 2. Stream Object
    try {
        const result = streamObject({
            model: google('gemini-2.5-flash'),
            schema: LearningMaterialSchema,
            system: `You are an expert academic content generator. You generate COMPREHENSIVE, DETAILED learning materials.

CRITICAL REQUIREMENTS:
- Generate THOROUGH content. Never produce short or minimal responses.
- For Theory mode:
  * Summary: Write 3-5 detailed paragraphs (at least 200 words)
  * Key Points: Generate AT LEAST 6-8 key points, each being a full sentence
  * Detailed Sections: Create AT LEAST 3 sections with 2-3 paragraphs each
  * Slides: Generate 6-10 slides, each with 4-5 bullet points AND speaker notes
- For Lab mode:
  * Description: Write a detailed problem statement (at least 100 words)
  * Instructions: Provide at least 5-7 step-by-step instructions
  * Code: Write complete, working code (not just snippets)
  * Solution: Provide a comprehensive solution walkthrough

CONTENT GUIDELINES:
1. VISUALS: Include Mermaid.js diagrams where helpful (graph TD, flowchart, etc.)
2. CITATIONS: Use [Source: filename] when referencing internal materials
3. ACCURACY: Prioritize Internal Context over External Context
4. DEPTH: Explain concepts thoroughly as if teaching a university student`,
            prompt: `Generate comprehensive ${mode} materials for the topic: "${prompt}".

CONTEXT TO USE (ground your response in this information):
${fullContext}

Remember: Generate DETAILED, THOROUGH content. Include all required sections with substantial content. For Theory mode, you MUST generate slides with multiple bullet points each.`,
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

        // Use toDataStreamResponse for proper streaming with useObject hook
        return result.toTextStreamResponse({ headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    } catch (error) {
        console.error("❌ Generation Error:", error);
        return new Response(JSON.stringify({ error: 'Generation failed' }), { status: 500 });
    }
}
