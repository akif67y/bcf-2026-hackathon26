'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { GeneratorForm } from '@/components/features/generator/generator-form';
import { LivePreview } from '@/components/features/generator/live-preview';
import { z } from 'zod';
import { toast } from 'sonner';
import { useState } from 'react';
// Define Schema again here or import if possible. Sharing schemas between server/client is best practice but for speed I'll redefine or keep loose typing.
// To make useObject work, strict schema matching is usually required on the client side validation? actually no, useObject handles it.

// Relaxed schema for client-side streaming (allows partials)
const learningMaterialSchema = z.object({
    type: z.enum(['Theory', 'Lab']).optional(),
    title: z.string().optional(),
    // Allow any structure for nested objects during streaming to prevent validation blocking
    readingNotes: z.any().optional(),
    slides: z.array(z.any()).optional(),
    language: z.string().optional(),
    difficulty: z.string().optional(),
    description: z.string().optional(),
    code: z.string().optional(),
    instructions: z.array(z.string()).optional(),
    solution: z.string().optional(),
});

export default function GeneratePage() {
    const [validationReport, setValidationReport] = useState<any>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [lastPrompt, setLastPrompt] = useState("");

    const { object, submit, isLoading, error } = useObject({
        api: '/api/generate',
        schema: learningMaterialSchema,
        onError: (err) => {
            toast.error('Generation Failed', { description: err.message });
        },
        onFinish: async ({ object }) => {
            if (object && lastPrompt) {
                // Post-Generation Validation
                setIsValidating(true);
                // Ideally we should pass the context used, but for now we'll rely on the prompt or fetch context again if needed
                // Or simplified: Just validate against the prompt + intrinsic knowledge if context isn't easily available here
                // Note: The prompt instructed to pass "originalContext". The API route has it, but doesn't return it in the stream easily without wrapping.
                // For hackathon speed, I will pass the PROMPT and let validation check for internal consistency + plausibility, 
                // OR better: Have the API return the context in the stream?
                // Actually, the API returns the stream of the OBJECT. 
                // Getting the context back to the client cleanly is tricky with `streamObject`.
                // I will make `validateContentAction` fetch the context again or just validate loosely.
                // Re-fetching context in validateAction is safer and keeps logic clean.
                // Wait, I can't easily re-fetch the EXACT same RAG chunks without re-running the vector search.
                // Let's assume re-running vector search in validate action is fine (it's fast).

                // BUT: `validateContentAction` is server-side.
                // So I will call `validateContentAction(object, prompt, type)`.
                // And inside `validateContentAction`, I will do a quick RAG lookup for the context to check against.

                try {
                    const { validateContentAction } = await import('@/actions/validate');
                    const { searchMaterialsAction } = await import('@/actions/search');
                    // Reuse search action to get context? Or just duplicate retrieval logic in validate?
                    // Let's modify validate.ts to do retrieval if context is missing.
                    // For now, I'll pass the prompt.

                    // Actually, I need to call the server action from here.
                    // We now pass the prompt so validation can re-fetch context server-side
                    const report = await validateContentAction(object, lastPrompt, object.type as 'Theory' | 'Lab');
                    setValidationReport(report);
                } catch (e) {
                    console.error("Validation failed", e);
                } finally {
                    setIsValidating(false);
                }
            }
        }
    });

    const handleGenerate = (prompt: string, mode: 'Theory' | 'Lab') => {
        setLastPrompt(prompt);
        setValidationReport(null); // Reset
        submit({ prompt, mode });
    };

    const handleManualValidate = async () => {
        if (!object || !lastPrompt) return;
        setIsValidating(true);
        try {
            const { validateContentAction } = await import('@/actions/validate');
            // Re-importing dynamically to ensure server action is handled correctly in client boundary? 
            // Actually standard import is fine, but sticking to existing pattern if any.
            // Wait, import inside function is for lazy loading, that's fine.
            const report = await validateContentAction(object, lastPrompt, object.type as 'Theory' | 'Lab');
            setValidationReport(report);
        } catch (e) {
            console.error("Validation failed", e);
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <div className="container mx-auto max-w-7xl py-10 px-4 md:px-8">
            <div className="mb-10 text-center space-y-2">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                    Content Studio
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Transform concepts into comprehensive learning materials instantly.
                    Powered by RAG and Gemini 2.0.
                </p>
            </div>

            <GeneratorForm onGenerate={handleGenerate} isLoading={isLoading} />

            <div className="mt-8">
                {error && (
                    <div className="p-4 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 mb-4">
                        Error: {error.message}
                    </div>
                )}

                {isLoading && !object && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                        <p className="text-muted-foreground animate-pulse">Initializing generator...</p>
                    </div>
                )}

                {object && (
                    <LivePreview
                        object={object}
                        mode={object.type as 'Theory' | 'Lab' || 'Theory'}
                        validationReport={validationReport}
                        isValidating={isValidating}
                        onValidate={handleManualValidate}
                    />
                )}

                {!isLoading && !object && !error && (
                    <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-xl bg-muted/20">
                        <div className="text-muted-foreground">
                            Ready to generate. Enter a topic above to start.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
