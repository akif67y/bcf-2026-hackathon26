// Wikipedia External Context Fetcher - Enhanced for MCP-style validation

interface WikipediaResult {
    title: string;
    extract: string;
    fullContent?: string;
    url: string;
    source: 'wikipedia';
}

// Get summary (fast, for quick context)
export async function getExternalContext(topic: string): Promise<string | null> {
    try {
        console.log(`[Wikipedia] Fetching summary for: ${topic}`);
        const res = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
        );
        if (!res.ok) {
            // Fallback: search Wikipedia
            return await searchWikipedia(topic);
        }
        const data = await res.json();
        return `EXTERNAL CONTEXT (Wikipedia - ${data.title}): ${data.extract}`;
    } catch (e) {
        console.error("Wikipedia Fetch Error:", e);
        return null;
    }
}

// Get FULL article content (for thorough validation)
export async function getWikipediaFullContent(topic: string): Promise<WikipediaResult | null> {
    try {
        console.log(`[Wikipedia] Fetching full content for: ${topic}`);

        // First get the summary to confirm the page exists
        const summaryRes = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
        );

        let pageTitle = topic;
        if (summaryRes.ok) {
            const summaryData = await summaryRes.json();
            pageTitle = summaryData.title;
        }

        // Fetch the full HTML content
        const contentRes = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(pageTitle)}`
        );

        if (!contentRes.ok) {
            // Fallback to summary if full content fails
            if (summaryRes.ok) {
                const summaryData = await summaryRes.json();
                return {
                    title: summaryData.title,
                    extract: summaryData.extract,
                    url: summaryData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
                    source: 'wikipedia'
                };
            }
            return null;
        }

        const htmlContent = await contentRes.text();
        // Strip HTML tags for plain text (simple approach)
        const plainText = htmlContent
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 20000); // Limit to ~20k chars

        const summaryData = summaryRes.ok ? await summaryRes.clone().json() : null;

        return {
            title: pageTitle,
            extract: summaryData?.extract || plainText.slice(0, 500),
            fullContent: plainText,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
            source: 'wikipedia'
        };
    } catch (e) {
        console.error("Wikipedia Full Content Error:", e);
        return null;
    }
}

// Search Wikipedia when direct page lookup fails
async function searchWikipedia(query: string): Promise<string | null> {
    try {
        console.log(`[Wikipedia] Searching for: ${query}`);
        const searchRes = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
        );

        if (!searchRes.ok) return null;

        const searchData = await searchRes.json();
        const firstResult = searchData.query?.search?.[0];

        if (!firstResult) return null;

        // Fetch the summary of the first search result
        const summaryRes = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstResult.title)}`
        );

        if (!summaryRes.ok) return null;

        const summaryData = await summaryRes.json();
        return `EXTERNAL CONTEXT (Wikipedia - ${summaryData.title}): ${summaryData.extract}`;
    } catch (e) {
        console.error("Wikipedia Search Error:", e);
        return null;
    }
}

// MCP-style tool: Get related Wikipedia topics for comprehensive validation
export async function getWikipediaRelatedTopics(topic: string): Promise<string[]> {
    try {
        console.log(`[Wikipedia MCP] Getting related topics for: ${topic}`);

        // Use Wikipedia's "See also" links via the API
        const res = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(topic)}&prop=links&pllimit=10&format=json&origin=*`
        );

        if (!res.ok) return [];

        const data = await res.json();
        const pages = data.query?.pages;
        if (!pages) return [];

        const pageId = Object.keys(pages)[0];
        const links = pages[pageId]?.links || [];

        return links
            .map((link: any) => link.title)
            .filter((title: string) => !title.includes(':')) // Filter out special pages
            .slice(0, 5);
    } catch (e) {
        console.error("Wikipedia Related Topics Error:", e);
        return [];
    }
}

// MCP-style tool: Get "On This Day" historical facts (bonus feature)
export async function getWikipediaOnThisDay(): Promise<{ text: string; year: number }[]> {
    try {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const res = await fetch(
            `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`
        );

        if (!res.ok) return [];

        const data = await res.json();
        return (data.events || []).slice(0, 5).map((e: any) => ({
            text: e.text,
            year: e.year
        }));
    } catch (e) {
        console.error("Wikipedia OnThisDay Error:", e);
        return [];
    }
}
