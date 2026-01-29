'use server';

import { searchMaterials } from '@/lib/ai/retrieve';

export async function search(query: string) {
    try {
        const results = await searchMaterials(query);
        return { success: true, data: results };
    } catch (error: any) {
        console.error(error);
        return { success: false, error: 'Search failed' };
    }
}
