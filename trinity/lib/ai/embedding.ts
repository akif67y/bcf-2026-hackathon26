import { pipeline } from '@xenova/transformers';

// Singleton to prevent reloading model on every request
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let extractor: any = null;

export async function getEmbeddings(textChunks: string[]) {
    if (!extractor) {
        // Downloads model locally (first run only)
        extractor = await pipeline('feature-extraction', 'Xenova/all-mpnet-base-v2', {
            quantized: false, // Better accuracy for search
        });
    }

    const embeddings = [];

    for (const text of textChunks) {
        // Generate vector
        const output = await extractor(text, { pooling: 'mean', normalize: true });
        // Convert Float32Array to standard array
        embeddings.push(Array.from(output.data));
    }

    return embeddings;
}
