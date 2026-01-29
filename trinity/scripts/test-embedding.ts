import { generateEmbedding } from '../utils/ai';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        console.error('❌ Error: GOOGLE_GENERATIVE_AI_API_KEY is missing in .env.local');
        console.log('Please add your API key to .env.local and try again.');
        process.exit(1);
    }

    console.log('Found API Key. Testing embedding generation...');

    try {
        const text = 'This is a test sentence to verify embedding dimensions.';
        const vector = await generateEmbedding(text);

        console.log(`✅ Embedding generated successfully.`);
        console.log(`Vector Dimension: ${vector.length}`);

        if (vector.length === 768) {
            console.log('✅ PASS: Dimension matches Gemini text-embedding-004 (768).');
        } else {
            console.error(`❌ FAIL: Expected 768 dimensions, but got ${vector.length}.`);
            console.log('Check if you are using the correct model (text-embedding-004).');
        }
    } catch (error) {
        console.error('❌ Error generating embedding:', error);
        if (error instanceof Error) {
            console.error('Message:', error.message);
        }
    }
}

main();
