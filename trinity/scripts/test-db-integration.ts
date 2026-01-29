import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '../utils/ai';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testIntegration() {
    console.log('🔌 Testing Database Integration...');

    try {
        // 1. Create a dummy material
        console.log('1. Inserting test material...');
        const { data: material, error: matError } = await supabase
            .from('materials')
            .insert({
                title: 'Integration Test Material',
                content_text: 'This is a test material for checking vector embeddings.',
                category: 'Theory', // Matches check constraint
                type: 'text',
                metadata: { test: true }
            })
            .select()
            .single();

        if (matError) throw new Error(`Material insert failed: ${matError.message}`);
        console.log(`   ✅ Material created: ${material.id}`);

        // 2. Generate Embedding
        console.log('2. Generating embedding...');
        const textChunk = 'Integration test search query';
        const embedding = await generateEmbedding(textChunk);
        if (embedding.length !== 768) throw new Error(`Wrong dimensions: ${embedding.length}`);
        console.log(`   ✅ Embedding generated (Scale: ${embedding.length})`);

        // 3. Insert Embedding
        console.log('3. Inserting embedding...');
        const { error: embError } = await supabase
            .from('embeddings')
            .insert({
                material_id: material.id,
                content_chunk: textChunk,
                embedding: embedding
            });

        if (embError) throw new Error(`Embedding insert failed: ${embError.message}`);
        console.log('   ✅ Embedding inserted.');

        // 4. Test Similarity Search (RPC)
        console.log('4. Testing similarity search...');
        const { data: searchResults, error: searchError } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.5,
            match_count: 1
        });

        if (searchError) throw new Error(`Search RPC failed: ${searchError.message}`);

        if (searchResults && searchResults.length > 0) {
            console.log(`   ✅ Search successful. Found ${searchResults.length} match(es).`);
            console.log(`   Top match: ${searchResults[0].content_chunk} (Similarity: ${searchResults[0].similarity})`);
        } else {
            console.warn('   ⚠️ Search returned no results. Check threshold or indexing.');
        }

        // 5. Cleanup
        console.log('5. Cleaning up...');
        const { error: delError } = await supabase
            .from('materials')
            .delete()
            .eq('id', material.id);

        if (delError) console.error(`   ⚠️ Cleanup failed: ${delError.message}`);
        else console.log('   ✅ Cleanup successful.');

        console.log('\n🎉 INTEGRATION TEST PASSED');

    } catch (error) {
        console.error('\n❌ INTEGRATION TEST FAILED');
        if (error instanceof Error) console.error(error.message);
        else console.error(error);
        process.exit(1);
    }
}

testIntegration();
