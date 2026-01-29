'use server';

import { createClient } from '@/utils/supabase/server';

export interface Material {
    id: string;
    title: string;
    category: 'Theory' | 'Lab';
    type: string;
    file_url: string | null;
    created_at: string;
    metadata: {
        week?: number;
        tags?: string[];
        content_type?: string;
    };
}

/**
 * Get all materials with full metadata for admin/student views
 */
export async function getMaterialsWithMetadata(category?: 'Theory' | 'Lab'): Promise<Material[]> {
    const supabase = await createClient();

    let query = supabase
        .from('materials')
        .select('id, title, category, type, file_url, created_at, metadata')
        .order('created_at', { ascending: false });

    if (category) {
        query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
        console.error('getMaterialsWithMetadata error:', error);
        return [];
    }

    return (data || []) as Material[];
}

/**
 * Delete a material and its embeddings (cascade handled by DB)
 */
export async function deleteMaterial(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // First get the file_url to delete from storage
    const { data: material } = await supabase
        .from('materials')
        .select('file_url')
        .eq('id', id)
        .single();

    if (material?.file_url) {
        // Delete from storage
        await supabase.storage
            .from('Course-content')
            .remove([material.file_url]);
    }

    // Delete from database (embeddings cascade automatically)
    const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Generate a signed download URL for a material
 */
export async function getMaterialDownloadUrl(fileUrl: string): Promise<string | null> {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
        .from('Course-content')
        .createSignedUrl(fileUrl, 3600); // 1 hour expiry

    if (error) {
        console.error('Download URL error:', error);
        return null;
    }

    return data.signedUrl;
}
