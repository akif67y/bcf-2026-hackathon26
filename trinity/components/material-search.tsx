'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { search } from '@/actions/search';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';

export function MaterialSearch() {
    const [query, setQuery] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setHasSearched(true);
        setResults([]);

        try {
            const result = await search(query);
            if (result.success && result.data) {
                setResults(result.data);
            } else {
                toast.error('Failed to search materials');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Search Knowledge Base</CardTitle>
                <CardDescription>Semantic search using local embeddings.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                    <Input
                        placeholder="Ask a question (e.g. 'What is the theory of relativity?')"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4" />}
                    </Button>
                </form>

                <div className="space-y-4">
                    {results.map((result) => (
                        <div key={result.id} className="p-4 border rounded-lg bg-muted/50">
                            <div className="font-semibold text-sm mb-1">{result.material_title}</div>
                            <div className="text-sm text-foreground/80 line-clamp-3">
                                {result.content_chunk}
                            </div>
                            <div className="text-xs text-secondary-foreground mt-2">
                                Similarity: {(result.similarity * 100).toFixed(1)}%
                            </div>
                        </div>
                    ))}
                    {hasSearched && results.length === 0 && !isLoading && (
                        <div className="text-center text-muted-foreground py-8">
                            No matching materials found.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
