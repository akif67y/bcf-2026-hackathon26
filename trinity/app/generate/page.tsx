'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { GeneratorForm } from '@/components/features/generator/generator-form';
import { LivePreview } from '@/components/features/generator/live-preview';
import { z } from 'zod';
import { toast } from 'sonner';
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
    const { object, submit, isLoading, error } = useObject({
        api: '/api/generate',
        schema: learningMaterialSchema,
        onError: (err) => {
            toast.error('Generation Failed', { description: err.message });
        }
    });

    const handleGenerate = (prompt: string, mode: 'Theory' | 'Lab') => {
        submit({ prompt, mode });
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
                    <LivePreview object={object} mode={object.type as 'Theory' | 'Lab' || 'Theory'} />
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
