import { google } from '@ai-sdk/google';
import { embed } from 'ai';

export const generateEmbedding = async (value: string): Promise<number[]> => {
    const input = value.replace(/\n/g, ' ');
    const { embedding } = await embed({
        model: google.textEmbeddingModel('text-embedding-004'),
        value: input,
    });
    return embedding;
};
