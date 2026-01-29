import { UploadMaterial as UploadForm } from '@/components/upload-material';
import SemanticSearch from '@/components/semantic-search'; // <--- NEW COMPONENT
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="container py-10 space-y-12">

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">University Learning Platform</h1>
        <p className="text-muted-foreground">Upload course PDFs and search them instantly.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-8">

        {/* LEFT COLUMN: Admin Upload (CMS) */}
        <div className="md:col-span-4 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
            Upload Material
          </h2>
          <UploadForm />
        </div>

        {/* RIGHT COLUMN: Semantic Search (The Interaction) */}
        <div className="md:col-span-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
            Explore Content (RAG Search)
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Test the "Intelligent Search" requirement. This retrieves excerpts directly from your DB.
          </p>

          {/* THE NEW UI HERE */}
          <SemanticSearch />
        </div>

        {/* STEP 3: Content Generator */}
        <div className="border-t pt-8">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
            AI Learning Generator (New Feature)
          </h2>
          <p className="text-muted-foreground mb-4">
            Generate grounded Reading Notes, Slides, and Labs based on your uploaded content.
          </p>
          <Link href="/generate">
            <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg transition-all">
              Open Content Studio
            </Button>
          </Link>
        </div>

      </div>
    </main>
  );
}
