// Wikipedia External Context Fetcher
export async function getExternalContext(topic: string) {
    try {
        console.log(`[lib] Fetching external context for: ${topic}`);
        const res = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
        );
        if (!res.ok) return null;
        const data = await res.json();
        return `EXTERNAL CONTEXT (Wikipedia): ${data.extract}`;
    } catch (e) {
        console.error("Wikipedia Fetch Error:", e);
        return null;
    }
}
