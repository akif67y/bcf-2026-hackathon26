'use server';

import { createClient } from '@/utils/supabase/server';
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getEmbeddings } from '@/lib/ai/embedding';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

// Initialize Google AI
const fileManager = new GoogleAIFileManager(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function uploadMaterial(formData: FormData) {
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;

    if (!file || !title) return { error: 'Missing file or title' };

    const supabase = await createClient();
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;

    // 1. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from('Course-content')
        .upload(fileName, file);

    if (uploadError) return { error: 'Upload failed: ' + uploadError.message };

    // 2. HYBRID PARSING LOGIC
    let cleanText = '';
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

    try {
        if (isPdf) {
            console.log("📄 Detected PDF. Using Gemini 2.0 Flash...");

            // A. Write temp file
            const bytes = await file.arrayBuffer();
            const tempPath = join(tmpdir(), fileName);
            await writeFile(tempPath, Buffer.from(bytes));

            // B. Upload to Google AI
            const uploadResponse = await fileManager.uploadFile(tempPath, {
                mimeType: "application/pdf",
                displayName: title,
            });

            // C. Ask Gemini to clean it (USING VERCEL AI SDK + GEMINI 2.5)
            // Using 'gemini-2.5-flash' as requested
            const { text } = await generateText({
                model: google('gemini-2.5-flash'),
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'file', mediaType: uploadResponse.file.mimeType, data: new URL(uploadResponse.file.uri) },
                            { type: 'text', text: "Extract all text. Output clear, plain text. Fix formatting/spacing issues. Do not summarize." }
                        ]
                    }
                ]
            });
            cleanText = text;

            // Cleanup
            await unlink(tempPath);
            await fileManager.deleteFile(uploadResponse.file.name).catch(console.error);
        } else {
            console.log("📝 Detected Text/Code. Reading directly...");
            cleanText = await file.text();
        }
    } catch (err: any) {
        console.error('❌ Parse Error:', err);
        return { error: 'Failed to parse file: ' + err.message };
    }

    // 3. Save Metadata
    const { data: material, error: dbError } = await supabase
        .from('materials')
        .insert({
            title,
            category,
            file_url: fileName,
            type: isPdf ? 'pdf' : 'text',
        })
        .select()
        .single();

    if (dbError) return { error: 'Database error: ' + dbError.message };

    // 4. Vectorize locally (Xenova)
    const chunks = cleanText.match(/[\s\S]{1,1000}/g) || [];
    const chunksToProcess = chunks.slice(0, 50);

    const embeddings = await getEmbeddings(chunksToProcess);

    for (let i = 0; i < chunksToProcess.length; i++) {
        await supabase.from('embeddings').insert({
            material_id: material.id,
            content_chunk: chunksToProcess[i],
            embedding: embeddings[i],
        });
    }

    return { success: true };
}