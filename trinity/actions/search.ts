'use server';

import { createClient } from '@/utils/supabase/server';
import { getEmbeddings } from '@/lib/ai/embedding';

export async function searchMaterialsAction(query: string, fileId?: string) {
    if (!query) return [];

    try {
        const supabase = await createClient();
        const vectors = await getEmbeddings([query]);

        const { data, error } = await supabase.rpc('match_documents', {
            query_embedding: vectors[0],
            match_threshold: 0.25, // Strict threshold to reduce noise
            match_count: 1,        // Only return the best match
            filter_material_id: fileId || null,
        });

        if (error) {
            console.error("RPC Error:", error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error("Search Error:", error);
        return [];
    }
}

export async function getMaterials() {
    const supabase = await createClient();
    const { data } = await supabase.from('materials').select('id, title');
    return data || [];
}