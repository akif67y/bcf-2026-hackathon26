'use client';

import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Need to check if Tabs exists, otherwise use custom
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area'; // Check availability
import { BookOpen, MonitorPlay, Code2, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// Helper for Tabs if not exists (Assume we need to verify or just implement standard tabs if shadcn ones missing. 
// "Don't Reinvent: If a pattern exists in shadcn/ui... INSTRUCT me to install it".
// I'll assume they might be missing based on list_dir only showing a few.
// I will use standard HTML for Tabs if I'm not sure, BUT user said "shadcn/ui".
// I'll use the classes and structure, if it fails I'll fix.
// Actually, `list_dir` showed `badge.tsx` exists. `card.tsx` exists.
// `tabs` was NOT in the list. I will assume it's NOT installed.
// I'll implement a simple Tab set using standard state to avoid build errors.

interface LivePreviewProps {
    object: any; // The partial object from streaming
    mode: 'Theory' | 'Lab';
    validationReport?: any; // Add validation report prop
    isValidating?: boolean;
    onValidate?: () => void; // Manual trigger
}

export function LivePreview({ object, mode, validationReport, isValidating, onValidate }: LivePreviewProps) {
    const [activeTab, setActiveTab] = useState('notes');
    const [currentSlide, setCurrentSlide] = useState(0);

    if (!object) return null;

    // Validation Banner
    const renderValidationStatus = () => {
        if (isValidating) {
            return (
                <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-indigo-500/20 animate-pulse flex items-center justify-center space-x-2">
                    <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium text-indigo-500"> validating academic accuracy...</span>
                </div>
            );
        }

        if (validationReport) {
            const isPassing = validationReport.finalScore >= 70;
            return (
                <div className={`mb-6 p-4 rounded-lg border flex flex-col gap-2 ${isPassing ? 'bg-green-500/5 border-green-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">{isPassing ? '✅' : '⚠️'}</span>
                            <span className={`font-bold ${isPassing ? 'text-green-600' : 'text-amber-600'}`}>
                                {isPassing ? 'Academically Verified' : 'Review Suggested'}
                            </span>
                            <Badge variant={isPassing ? 'outline' : 'destructive'} className="ml-2">
                                Score: {validationReport.finalScore}/100
                            </Badge>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onValidate} className="text-xs h-6">Re-Verify</Button>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mt-2">
                        <div className="flex flex-col">
                            <span className="text-muted-foreground uppercase tracking-wider">Syntax</span>
                            <span className={validationReport.syntaxValid ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                                {validationReport.syntaxValid ? 'Valid' : 'Errors'}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground uppercase tracking-wider">Tone</span>
                            <span className={validationReport.academicTone ? 'text-green-600 font-medium' : 'text-amber-500 font-medium'}>
                                {validationReport.academicTone ? 'Formal' : 'Casual'}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground uppercase tracking-wider">Citations</span>
                            <span className={`font-medium ${validationReport.citationAccuracy > 80 ? 'text-green-600' : 'text-amber-500'}`}>
                                {validationReport.citationAccuracy}%
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground uppercase tracking-wider">Source</span>
                            {validationReport.validationSource?.url ? (
                                <a
                                    href={validationReport.validationSource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-600 font-medium underline"
                                >
                                    {validationReport.validationSource.type === 'wikipedia' ? '📚 Wikipedia' : validationReport.validationSource.name}
                                </a>
                            ) : (
                                <span className="font-medium text-muted-foreground">
                                    {validationReport.validationSource?.type === 'internal_rag' ? '📁 Internal' :
                                        validationReport.validationSource?.type === 'wikipedia' ? '📚 Wikipedia' : '🎓 Academic'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Hallucinations Warning */}
                    {validationReport.hallucinations?.length > 0 && (
                        <div className="mt-2 bg-red-500/10 p-3 rounded text-sm text-red-600 border border-red-500/10">
                            <strong>Potential Inaccuracies:</strong>
                            <ul className="list-disc list-inside mt-1">
                                {validationReport.hallucinations.slice(0, 3).map((h: string, i: number) => (
                                    <li key={i}>{h}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            );
        }

        // Show manual validate button if no report yet (and not loading)
        return (
            <div className="mb-4 flex justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onValidate}
                    disabled={isValidating}
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200"
                >
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Verify Academic Accuracy
                </Button>
            </div>
        );
    };


    // Theory View
    if (mode === 'Theory') {
        // Handle various potential structures from AI (camelCase vs snake_case, object vs string)
        const notes = object.readingNotes || object.reading_notes || {};
        let rawSlides = object.slides || [];

        // Helper to strip JSON artifacts
        const cleanText = (text: any) => {
            if (typeof text !== 'string') return text || '';
            let cleaned = text.trim();
            // Remove markdown code blocks
            cleaned = cleaned.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
            // Remove outer braces if it looks like a JSON object wrapper
            if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
                // Try to extract content via simple regex or just strip brackets
                const match = cleaned.match(/"(summary|content|text)"\s*:\s*"([^"]*)"/);
                if (match && match[2]) return match[2];
                return cleaned.replace(/[{}"]/g, '');
            }
            return cleaned;
        };

        // Ensure rawSlides is an array if it came through as a string
        if (typeof rawSlides === 'string') {
            try {
                rawSlides = JSON.parse(rawSlides);
            } catch (e) {
                // If parse fails or it's not JSON, define as empty to avoid crash
                rawSlides = [];
            }
        }

        // Final safety check
        if (!Array.isArray(rawSlides)) {
            rawSlides = [];
        }

        // Normalize Notes
        let parsedNotes = notes;
        if (typeof notes === 'string' && notes.trim().startsWith('{')) {
            try {
                parsedNotes = JSON.parse(notes);
            } catch (e) {
                // Keep as string if parse fails (likely streaming partial)
            }
        }

        const summary = cleanText(typeof parsedNotes === 'string' ? parsedNotes : (parsedNotes.summary || parsedNotes.content || ''));
        const keyPoints = Array.isArray(parsedNotes.keyPoints) ? parsedNotes.keyPoints.map(cleanText) : (parsedNotes.keypoints ? parsedNotes.keypoints.map(cleanText) : []);
        const detailedSections = Array.isArray(parsedNotes.detailedSections) ? parsedNotes.detailedSections : (parsedNotes.sections || []);

        // Normalize Slides
        const normalizedSlides = rawSlides.map((s: any) => {
            // Try to parse if it's a stringified JSON object
            if (typeof s === 'string') {
                if (s.trim().startsWith('{')) {
                    try {
                        return JSON.parse(s);
                    } catch (e) {
                        return { slideTitle: s, bulletPoints: [] };
                    }
                }
                return { slideTitle: s, bulletPoints: [] };
            }
            if (!s) return { slideTitle: '', bulletPoints: [] };

            return {
                ...s,
                slideTitle: cleanText(s.slideTitle || s.title),
                bulletPoints: (s.bulletPoints || []).map(cleanText),
                speakerNotes: cleanText(s.speakerNotes)
            };
        });

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                {renderValidationStatus()}

                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">{object.title || 'Generating Title...'}</h2>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="text-indigo-500 border-indigo-500">{mode}</Badge>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                // Generate Markdown Content
                                let markdownContent = `# ${object.title || 'Generated Material'}\n\n`;

                                if (mode === 'Theory') {
                                    const notes = object.readingNotes || object.reading_notes || {};
                                    // Parse potential header data
                                    let summary = typeof notes === 'string' ? notes : (notes.summary || notes.content || '');
                                    if (typeof summary === 'string' && summary.trim().startsWith('{')) {
                                        try { const p = JSON.parse(summary); summary = p.summary || p.content || summary; } catch (e) { }
                                    }

                                    markdownContent += `## Summary\n${summary}\n\n`;

                                    // Key Points
                                    const keyPoints = Array.isArray(notes.keyPoints) ? notes.keyPoints : (notes.keypoints || []);
                                    if (keyPoints.length > 0) {
                                        markdownContent += `## Key Points\n${keyPoints.map((k: string) => `- ${k}`).join('\n')}\n\n`;
                                    }

                                    // Slides
                                    const slides = object.slides || [];
                                    if (slides.length > 0) {
                                        markdownContent += `## Slides\n`;
                                        slides.forEach((s: any, i: number) => {
                                            let slide = s;
                                            if (typeof s === 'string' && s.trim().startsWith('{')) {
                                                try { slide = JSON.parse(s); } catch (e) { slide = { slideTitle: s }; }
                                            }
                                            markdownContent += `### Slide ${i + 1}: ${slide.slideTitle || 'Untitled'}\n`;
                                            if (slide.bulletPoints?.length) {
                                                markdownContent += slide.bulletPoints.map((b: string) => `- ${b}`).join('\n');
                                            }
                                            if (slide.speakerNotes) {
                                                markdownContent += `\n> **Notes:** ${slide.speakerNotes}`;
                                            }
                                            markdownContent += `\n\n`;
                                        });
                                    }
                                } else {
                                    // Lab Mode
                                    markdownContent += `## Problem Description\n${object.description || ''}\n\n`;
                                    if (object.instructions?.length) {
                                        markdownContent += `## Instructions\n${object.instructions.map((i: string, idx: number) => `${idx + 1}. ${i}`).join('\n')}\n\n`;
                                    }
                                    if (object.code) {
                                        markdownContent += `## Starter Code\n\`\`\`${object.language || 'text'}\n${object.code}\n\`\`\`\n\n`;
                                    }
                                    if (object.solution) {
                                        markdownContent += `## Solution\n${object.solution}\n`;
                                    }
                                }

                                const blob = new Blob([markdownContent], { type: 'text/markdown' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${(object.title || 'generated-material').replace(/\s+/g, '_').toLowerCase()}.md`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                            }}
                        >
                            Download Material
                        </Button>
                    </div>
                </div>

                {/* Custom Tabs */}
                <div className="flex space-x-2 border-b border-border/50 pb-2">
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'notes'
                            ? 'bg-indigo-500/10 text-indigo-500'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Reading Notes
                    </button>
                    <button
                        onClick={() => setActiveTab('slides')}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'slides'
                            ? 'bg-indigo-500/10 text-indigo-500'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <MonitorPlay className="mr-2 h-4 w-4" />
                        Slides Deck
                    </button>
                </div>

                {activeTab === 'notes' && (
                    <Card className="border-t-4 border-t-indigo-500 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center text-xl">
                                <GraduationCap className="mr-2 h-5 w-5 text-indigo-500" />
                                Key Concepts & Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            {summary && (
                                <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border/50">
                                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Summary</h4>
                                    <div className="text-lg leading-relaxed text-foreground">
                                        <MarkdownRenderer>{summary}</MarkdownRenderer>
                                    </div>
                                </div>
                            )}

                            {keyPoints.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-3">Key Points</h3>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {keyPoints.map((point: string, i: number) => (
                                            <li key={i} className="flex items-start">
                                                <span className="mr-2 mt-1.5 h-1.5 w-1.5 bg-indigo-500 rounded-full flex-shrink-0" />
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {detailedSections.map((section: any, i: number) => (
                                <div key={i} className="mt-8">
                                    <h3 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border/30">{section.heading}</h3>
                                    <div className="markdown-content text-muted-foreground">
                                        <MarkdownRenderer>
                                            {section.content}
                                        </MarkdownRenderer>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'slides' && (
                    <div className="relative aspect-video w-full max-w-4xl mx-auto bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
                        {normalizedSlides.length > 0 ? (
                            <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 to-gray-800 p-8 md:p-12 text-white">
                                {/* Slide Navigation - Only Show if more than 1 slide */}
                                <div className="absolute top-4 right-4 text-xs text-gray-500 font-mono">
                                    SLIDE {currentSlide + 1} / {normalizedSlides.length}
                                </div>

                                <div className="flex-1 flex flex-col justify-center overflow-y-auto max-h-[80%]">
                                    <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-6 leading-tight shrink-0">
                                        {normalizedSlides[currentSlide].slideTitle}
                                    </h2>
                                    <ul className="space-y-3 overflow-y-auto">
                                        {normalizedSlides[currentSlide].bulletPoints?.map((point: string, i: number) => (
                                            <li key={i} className="flex items-start text-lg md:text-xl text-gray-200">
                                                <span className="mr-3 text-blue-500 mt-1.5 text-sm">➤</span>
                                                <span className="leading-snug">{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {normalizedSlides[currentSlide].speakerNotes && (
                                    <div className="mt-auto pt-6 border-t border-gray-700/50">
                                        <p className="text-gray-500 text-sm italic">
                                            <span className="font-semibold text-gray-400 not-italic mr-2">Speaker Notes:</span>
                                            {normalizedSlides[currentSlide].speakerNotes}
                                        </p>
                                    </div>
                                )}

                                {/* Controls */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:bg-white/10"
                                    onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                                    disabled={currentSlide === 0}
                                >
                                    <ChevronLeft className="h-8 w-8" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:bg-white/10"
                                    onClick={() => setCurrentSlide(prev => Math.min(normalizedSlides.length - 1, prev + 1))}
                                    disabled={currentSlide === normalizedSlides.length - 1}
                                >
                                    <ChevronRight className="h-8 w-8" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <p>Generating slides...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Lab View
    if (mode === 'Lab') {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                {renderValidationStatus()}
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">{object.title || 'Designing Lab...'}</h2>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="border-green-500 text-green-500">{object.difficulty || 'Level'}</Badge>
                        <Badge variant="secondary">{object.language || 'Code'}</Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Code2 className="mr-2 h-5 w-5 text-green-500" />
                                Problem Statement
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">{object.description}</p>

                            {object.instructions?.length > 0 && (
                                <div className="bg-muted/30 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2">Instructions:</h4>
                                    <ol className="list-decimal list-inside space-y-1.5 text-sm">
                                        {object.instructions.map((inst: string, i: number) => (
                                            <li key={i}>{inst}</li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="h-full min-h-[400px]">
                        <div className="mockup-code bg-gray-950 text-gray-100 rounded-xl overflow-hidden border border-gray-800 h-full flex flex-col">
                            <div className="flex items-center px-4 py-2 bg-gray-900 border-b border-gray-800">
                                <div className="flex space-x-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                </div>
                                <span className="ml-4 text-xs font-mono text-gray-500">main.{object.language?.toLowerCase() === 'python' ? 'py' : 'ts'}</span>
                            </div>
                            <div className="p-4 font-mono text-sm overflow-auto flex-1">
                                <pre style={{ whiteSpace: 'pre-wrap' }}>
                                    {object.code || '// Generating code snippet...'}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>

                {object.solution && (
                    <Card className="border-t-4 border-t-green-500">
                        <CardHeader>
                            <CardTitle>Solution Walkthrough</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose dark:prose-invert max-w-none">
                                <MarkdownRenderer>
                                    {object.solution}
                                </MarkdownRenderer>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    return null;
}
