
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testGenerate() {
    const prompt = "Binary Search Trees";
    const mode = "Theory";

    console.log(`Testing API with prompt: "${prompt}"...`);

    try {
        const response = await fetch('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, mode }),
        });

        console.log(`Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const text = await response.text();
            console.error("Error Body:", text);
            return;
        }

        if (!response.body) {
            console.error("No response body!");
            return;
        }

        // Read stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            console.log("Chunk:", chunk);
        }
        console.log("Done reading stream.");

    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testGenerate();
