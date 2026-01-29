import { MaterialSearch } from "@/components/material-search";
import { UploadMaterial } from "@/components/upload-material";

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center sm:items-start max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight">Trinity Knowledge Base</h1>
        <p className="text-muted-foreground text-lg">
          Upload PDF materials and search them using local AI embeddings.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <div className="flex flex-col gap-4">
            <UploadMaterial />
          </div>
          <div className="flex flex-col gap-4">
            {/* Search can take full width or side column */}
          </div>
        </div>

        {/* Search is wide so it goes below or stays in column if we want. Let's make it full width below */}
        <div className="w-full">
          <MaterialSearch />
        </div>

      </main>
    </div>
  );
}
