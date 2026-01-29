'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';

interface GeneratorFormProps {
    onGenerate: (prompt: string, mode: 'Theory' | 'Lab') => void;
    isLoading: boolean;
}

export function GeneratorForm({ onGenerate, isLoading }: GeneratorFormProps) {
    const [prompt, setPrompt] = useState('');
    const [mode, setMode] = useState<'Theory' | 'Lab'>('Theory');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;
        onGenerate(prompt, mode);
    };

    return (
        <Card className="w-full mb-8 border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <Sparkles className="h-6 w-6 text-indigo-500" />
                    AI Learning Generator
                </CardTitle>
                <CardDescription>
                    Generate custom reading notes, slides, or lab exercises grounded in your course material.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-3 space-y-2">
                            <Label htmlFor="prompt">Topic or Concept</Label>
                            <Input
                                id="prompt"
                                placeholder="e.g. Binary Search Trees, React Hooks, Quantum Mechanics..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={isLoading}
                                className="bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mode">Material Type</Label>
                            <Select
                                value={mode}
                                onValueChange={(val: 'Theory' | 'Lab') => setMode(val)}
                                disabled={isLoading}
                            >
                                <SelectTrigger id="mode" className="bg-background/50">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Theory">Theory (Notes & Slides)</SelectItem>
                                    <SelectItem value="Lab">Lab (Code & Practice)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-500/20"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            'Generate Materials'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
