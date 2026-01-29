'use client';

import { useCompletion } from '@ai-sdk/react';
import { GeneratorForm } from '@/components/features/generator/generator-form';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { toast } from 'sonner';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function GeneratePage() {
    const [lastPrompt, setLastPrompt] = useState("");
    const [lastMode, setLastMode] = useState<'Theory' | 'Lab'>('Theory');

    const { completion, complete, isLoading, error } = useCompletion({
        api: '/api/generate',
        streamProtocol: 'text',
        onError: (err) => {
            toast.error('Generation Failed', { description: err.message });
        },
    });

    const handleGenerate = (prompt: string, mode: 'Theory' | 'Lab') => {
        setLastPrompt(prompt);
        setLastMode(mode);
        complete(prompt, { body: { prompt, mode } });
    };

    const handleDownload = () => {
        if (!completion) return;
        const blob = new Blob([completion], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${lastPrompt.slice(0, 30).replace(/\s+/g, '_').toLowerCase() || 'generated_content'}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="container mx-auto max-w-7xl py-10 px-4 md:px-8">
            <div className="mb-10 text-center space-y-2">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                    Content Studio
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Transform concepts into comprehensive learning materials instantly.
                </p>
            </div>

            <GeneratorForm onGenerate={handleGenerate} isLoading={isLoading} />

            <div className="mt-8">
                {error && (
                    <div className="p-4 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 mb-4">
                        Error: {error.message}
                    </div>
                )}

                {(completion || isLoading) && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        {completion && (
                            <div className="flex justify-end">
                                <Button variant="outline" size="sm" onClick={handleDownload}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Markdown
                                </Button>
                            </div>
                        )}

                        <div className="bg-card border rounded-xl p-6 md:p-10 shadow-sm min-h-[200px]">
                            {/* Loading Indicator inside the card if starting but no text yet */}
                            {isLoading && !completion && (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                                    <p className="text-muted-foreground animate-pulse">Generating content...</p>
                                </div>
                            )}

                            <div className="prose dark:prose-invert max-w-none">
                                <MarkdownRenderer>{completion}</MarkdownRenderer>
                            </div>
                        </div>
                    </div>
                )}

                {!isLoading && !completion && !error && (
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
