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
            setResults(data);
            setSearched(true);
        });
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">

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
            <div className="space-y-4">
                {searched && results.length === 0 && !isPending && (
                    <div className="text-center p-8 border rounded-lg bg-muted/20 text-muted-foreground">
                        No high-confidence answers found. Try a more specific question or check the source material.
                    </div>
                )}

                {results.map((result, idx) => (
                    <Card key={result.id} className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
                        <CardHeader className="pb-2 bg-muted/10 border-b">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-primary font-semibold mb-1">
                                        <Sparkles className="w-4 h-4 fill-primary/20" />
                                        <span>Best Answer</span>
                                    </div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-muted-foreground" />
                                        Source: {result.material_title}
                                    </CardTitle>
                                </div>
                                <Badge variant={result.similarity > 0.5 ? "default" : "secondary"}>
                                    {Math.round(result.similarity * 100)}% Confidence
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-lg leading-relaxed text-foreground/90 font-medium">
                                "{result.content_chunk}"
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}