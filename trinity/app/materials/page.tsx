import { MaterialsBrowser } from '@/components/materials/materials-browser';
import SemanticSearch from '@/components/semantic-search';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, GraduationCap, Search, BookOpen } from 'lucide-react';

export default function MaterialsPage() {
    return (
        <main className="container py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <GraduationCap className="w-6 h-6 text-primary" />
                            Course Materials
                        </h1>
                        <p className="text-muted-foreground">
                            Browse and download lecture slides, PDFs, and code samples
                        </p>
                    </div>
                </div>
                <Link href="/cms">
                    <Button variant="outline" size="sm">Admin Panel</Button>
                </Link>
            </div>

            {/* Two-Column Layout */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Materials Browser (2/3) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold">Browse Materials</h2>
                    </div>
                    <MaterialsBrowser />
                </div>

                {/* Right: Ask Questions (1/3) */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Search className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold">Ask Questions</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Use AI-powered search to find answers from your course materials.
                    </p>
                    <SemanticSearch />
                </div>
            </div>
        </main>
    );
}
