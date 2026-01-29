'use server';

import { createClient } from '@/utils/supabase/server';
import { extractTextFromPDF } from '@/lib/pdf-loader';
import { getEmbeddings } from '@/lib/ai/embedding';
import { revalidatePath } from 'next/cache';

function chunkText(text: string, chunkSize = 800, overlap = 100) {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
        const end = start + chunkSize;
        chunks.push(text.slice(start, end));
        start += chunkSize - overlap;
    }
    return chunks;
}

export async function uploadMaterial(formData: FormData) {
    const supabase = await createClient();

    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const type = formData.get('type') as string;

    if (!file || !title) return { error: 'Missing required fields' };

    try {
        // 1. Upload File
        const fileExt = file.name.split('.').pop();
        const filePath = `${Date.now()}_${title.replace(/\s/g, '_')}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('course-content')
            .upload(filePath, file);

        if (uploadError) throw new Error(`Upload Failed: ${uploadError.message}`);

        const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/course-content/${filePath}`;

        // 2. Parse Text (Local)
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const textContent = await extractTextFromPDF(buffer);

        // 3. Save to DB
        const { data: material, error: dbError } = await supabase
            .from('materials')
            .insert({ title, file_url: fileUrl, content_text: textContent, category, type })
            .select()
            .single();

        if (dbError) throw new Error(`DB Insert Failed: ${dbError.message}`);

        // 4. Generate Embeddings (Local & Free)
        const chunks = chunkText(textContent);
        const vectors = await getEmbeddings(chunks); // <--- FREE LOCAL INFERENCE

        // 5. Save Vectors
        const embeddingRows = chunks.map((chunk, index) => ({
            material_id: material.id,
            content_chunk: chunk,
            embedding: vectors[index], // Matches vector(768)
        }));

        const { error: vectorError } = await supabase.from('embeddings').insert(embeddingRows);

        if (vectorError) throw new Error(`Vector Save Failed: ${vectorError.message}`);

        revalidatePath('/dashboard');
        return { success: true, message: 'Material processed locally!' };

    } catch (error: any) {
        console.error(error);
        return { error: error.message || 'Something went wrong' };
    }
}
