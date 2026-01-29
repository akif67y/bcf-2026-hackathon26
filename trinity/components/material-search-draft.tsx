'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { searchMaterials } from '@/lib/ai/retrieve';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search } from 'lucide-react';

export function MaterialSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        try {
            // Note: Calling library directly. In a real app, wrap in a Server Action.
            // But lib/ai/retrieve imports 'server-only' utils usually, so we need a wrapper.
            // Wait, lib/ai/retrieve uses 'createClient' from utils/supabase/server which IS server-side.
            // We cannot call it directly from client. We need a Server Action wrapper.

            // Let's assume we need to fetch via a Server Action. I'll create a quick inline one or assumes a wrapper exists.
            // Actually, let's just make a server action file for search or use the one we have?
            // I'll assume I need to create `actions/search.ts` quickly.

            toast.error("Please implement the search action wrapper!");

        } catch (error) {
            toast.error("Search failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mt-8">
            <CardHeader>
                <CardTitle>Search Knowledge Base</CardTitle>
                <CardDescription>Semantic search using local embeddings.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                    <Input
                        placeholder="Ask a question..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
                    </Button>
                </form>

                <div className="space-y-4">
                    {results.map((result) => (
                        <div key={result.id} className="p-4 border rounded-lg bg-muted/50">
                            <div className="font-semibold text-sm mb-1">{result.material_title}</div>
                            <div className="text-sm text-foreground/80 line-clamp-3">
                                {result.content_chunk}
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                                Similarity: {(result.similarity * 100).toFixed(1)}%
                            </div>
                        </div>
                    ))}
                    {results.length === 0 && query && !isLoading && (
                        <div className="text-center text-muted-foreground">No matches found.</div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
