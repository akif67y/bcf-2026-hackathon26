import { getEmbeddings } from '../lib/ai/embedding';

async function main() {
    console.log('Testing Local Embeddings (Transformers.js)...');
    try {
        const text = 'This is a test sentence for local embeddings.';
        console.log('Generating embedding (this may take a while to download model)...');
        const vectors = await getEmbeddings([text]);
        const embedding = vectors[0];

        console.log(`✅ Embedding generated successfully.`);
        console.log(`Vector Dimension: ${embedding.length}`);

        if (embedding.length === 768) {
            console.log('✅ PASS: Dimension matches 768.');
        } else {
            console.error(`❌ FAIL: Expected 768 dimensions, but got ${embedding.length}.`);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

main();
