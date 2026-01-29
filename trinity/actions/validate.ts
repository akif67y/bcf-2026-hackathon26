'use server';

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const ValidationResultSchema = z.object({
    // 1. Syntax & Reliability (Rubric)
    syntaxValid: z.boolean().describe("Is the code syntactically correct?"),
    academicTone: z.boolean().describe("Is the language formal and objective?"),

    // 2. Reference Grounding (The most important part)
    hallucinations: z.array(z.string()).describe("List of claims not supported by the provided context."),
    citationAccuracy: z.number().min(0).max(100).describe("Percentage of facts that are correctly cited."),

    // 3. Validation Source Tracking
    validationSource: z.object({
        type: z.enum(['internal_rag', 'wikipedia', 'general_knowledge']).describe("Source used for validation"),
        name: z.string().optional().describe("Name of the source (e.g., Wikipedia article title)"),
        url: z.string().optional().describe("URL to the source if available"),
    }),

    // 4. Automated Test (AI Simulation)
    testCase: z.object({
        input: z.string().describe("A sample input for the generated code"),
        expectedOutput: z.string().describe("What the code SHOULD return"),
        predictedOutput: z.string().describe("What the code ACTUALLY returns based on logic analysis"),
        passed: z.boolean()
    }).optional().describe("Only for Lab/Code content"),

    finalScore: z.number().min(0).max(100),
    feedback: z.string().describe("Brief feedback for the student"),
});

import { createClient } from '@/utils/supabase/server';
import { getEmbeddings } from '@/lib/ai/embedding';

// ... other imports ...

export async function validateContentAction(
    generatedContent: any,
    prompt: string,
    type: 'Theory' | 'Lab'
) {
    try {
        // 1. Re-fetch Context Verification (Grounding)
        // We re-run the RAG search here to get the "Source Truth" to compare against.
        const supabase = await createClient();
        const vectors = await getEmbeddings([prompt]);

        const { data: chunks, error } = await supabase.rpc('match_documents', {
            query_embedding: vectors[0],
            match_threshold: 0.5, // Broad search to capture all potential context
            match_count: 5,
        });

        const originalContext = chunks?.map((c: any) => c.content_chunk).join("\n\n") || "";

        // Source metadata for tracking
        let sourceMetadata: {
            type: 'internal_rag' | 'wikipedia' | 'general_knowledge';
            name: string;
            url?: string;
        } = {
            type: 'internal_rag',
            name: chunks?.[0]?.material_title || 'Uploaded Materials',
            url: undefined
        };

        // Fallback to Wikipedia if no internal context
        // Try MCP first, then fallback to direct API
        const { getWikipediaViaMCP } = await import('@/lib/mcp-client');
        const { getWikipediaFullContent } = await import('@/lib/external');
        let trustedContext = originalContext;
        let contextType = "Internal RAG";

        if (!originalContext || originalContext.length < 50) {
            console.log('[Validation] No internal context, trying Wikipedia MCP...');

            // Try MCP server first
            let wikiResult = await getWikipediaViaMCP(prompt);

            // Fallback to direct API if MCP fails
            if (!wikiResult) {
                console.log('[Validation] MCP failed, using direct Wikipedia API...');
                const directResult = await getWikipediaFullContent(prompt);
                if (directResult) {
                    wikiResult = {
                        ...directResult,
                        source: 'wikipedia-mcp' as const // Keep type consistent
                    };
                }
            }

            if (wikiResult) {
                trustedContext = wikiResult.fullContent || wikiResult.extract;
                contextType = `External (Wikipedia MCP - ${wikiResult.title})`;
                sourceMetadata = {
                    type: 'wikipedia',
                    name: `${wikiResult.title} (via MCP)`,
                    url: wikiResult.url
                };
            } else {
                trustedContext = "No specific context found. Use General Academic Knowledge.";
                contextType = "General Knowledge";
                sourceMetadata = {
                    type: 'general_knowledge',
                    name: 'Academic Consensus',
                    url: undefined
                };
            }
        }

        const { object } = await generateObject({
            model: google("gemini-2.5-flash"),
            schema: ValidationResultSchema,
            prompt: `
      Act as a Strict Academic Reviewer. Validate the following AI-generated content.

      INPUT DATA:
      - User Prompt: "${prompt}"
      - Type: ${type}
      - Generated Content: ${JSON.stringify(generatedContent)}
      - Source Material (${contextType}): ${trustedContext.slice(0, 15000)}
      
      VALIDATION SOURCE (use this for validationSource field):
      - type: "${sourceMetadata.type}"
      - name: "${sourceMetadata.name}"
      - url: ${sourceMetadata.url ? `"${sourceMetadata.url}"` : 'null'}

      TASKS:
      1. SYNTAX CHECK: If code exists, mentally compile it. Are there errors?
      2. GROUNDING CHECK: Verify that every claim in the "Generated Content" is supported by the "Source Material". 
         - NOTE: The Source Material provided is ${contextType}.
         - If Source is "Internal RAG", be STRICT. Flag deviations.
         - If Source is "External (Wikipedia)" or "General Knowledge", validate based on factual accuracy of that source/standard consensus.
         - Do NOT flag "unsupported by source" if the source is General Knowledge/Wikipedia and the content is factually correct. Only flag if it CONTRADICTS.
      3. TEST CASE (Lab Only): If this is a Lab, generate a simple input, trace the code execution step-by-step.
      4. VALIDATION SOURCE: Set the validationSource field using the VALIDATION SOURCE data provided above.

      SCORING GUIDE:
      - If "No internal context found" and content is factually correct (General Knowledge), score it HIGH (90-100) and mark as "Valid".
      - Only give 0/100 if it is WRONG or contradicts the provided source.
      
      Be strictly accurate but fair regarding source availability.
    `,
        });

        return object;
    } catch (e) {
        console.error("Validation Error:", e);
        return null;
    }
}
