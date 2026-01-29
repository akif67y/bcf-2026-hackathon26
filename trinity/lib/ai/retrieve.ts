import { createClient } from '@/utils/supabase/server';
import { getEmbeddings } from '@/lib/ai/embedding';

export async function searchMaterials(query: string) {
    const supabase = await createClient();

    // 1. Convert user query to vector using the SAME local model
    const vectors = await getEmbeddings([query]);
    const queryEmbedding = vectors[0]; // We only requested one

    // 2. Call Supabase RPC
    const { data: documents } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding, // 768-dim vector
        match_threshold: 0.5, // Lower threshold slightly for local models
        match_count: 5,
    });

    return documents;
}
