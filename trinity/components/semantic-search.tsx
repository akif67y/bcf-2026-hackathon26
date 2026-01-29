'use client';

import { useState, useEffect, useTransition } from 'react';
import { searchMaterialsAction, getMaterials } from '@/actions/search';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Code, Loader2, Filter, Sparkles } from 'lucide-react';

export default function SemanticSearch() {
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [files, setFiles] = useState<any[]>([]); // List of PDFs
    const [selectedFile, setSelectedFile] = useState<string>('all'); // The Filter

    const [isPending, startTransition] = useTransition();
    const [searched, setSearched] = useState(false);

    // Load the list of files when page opens
    useEffect(() => {
        getMaterials().then(setFiles);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        startTransition(async () => {
            // Pass the selectedFile ID (or undefined if 'all')
            const fileId = selectedFile === 'all' ? undefined : selectedFile;
            const data = await searchMaterialsAction(query, fileId);

            setAnswer(data.answer);
            setResults(data.sources);
            setSearched(true);
        });
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">

            {/* SEARCH BAR + FILTER */}
            <form onSubmit={handleSearch} className="flex gap-2 items-end">
                <div className="space-y-2 w-1/3">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Filter size={12} /> Filter by Source
                    </label>
                    <Select value={selectedFile} onValueChange={setSelectedFile}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Materials" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Materials</SelectItem>
                            {files.map(f => (
                                <SelectItem key={f.id} value={f.id}>{f.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2 flex-1">
                    <label className="text-xs font-semibold text-muted-foreground">Ask a Question</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="e.g. What is the definition of momentum?"
                            className="pl-10"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Button type="submit" disabled={isPending || !query} className="min-w-[100px]">
                    {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : 'Ask'}
                </Button>
            </form>

            {/* RESULTS DISPLAY */}
            <div className="space-y-8">
                {searched && !isPending && (
                    <div className="space-y-6">
                        {/* 1. THE AI ANSWER */}
                        <div className="space-y-2">
                            <h3 className="flex items-center gap-2 font-semibold text-lg text-primary">
                                <Sparkles className="w-5 h-5" />
                                AI Answer
                            </h3>
                            <Card className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border-indigo-100">
                                <CardContent className="pt-6">
                                    <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
                                        {answer || "No answer generated."}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 2. THE SOURCES */}
                        {results.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-semibold text-muted-foreground flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Sources Used
                                </h3>
                                <div className="grid gap-4">
                                    {results.map((result) => (
                                        <Card key={result.id} className="border-muted bg-muted/5 shadow-sm hover:border-primary/20 transition-colors">
                                            <CardHeader className="pb-2 py-3">
                                                <div className="flex justify-between items-center">
                                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Source</span>
                                                        {result.filename}
                                                    </CardTitle>
                                                    <Badge variant="outline" className="text-xs">
                                                        {Math.round(result.similarity * 100)}% Match
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-0 pb-3">
                                                <p className="text-xs text-muted-foreground line-clamp-2 italic">
                                                    "{result.content}"
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}