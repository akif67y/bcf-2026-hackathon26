// MCP Client for Wikipedia - Calls the wikipedia-mcp server
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

interface WikipediaMCPResult {
    title: string;
    extract: string;
    fullContent?: string;
    url: string;
    source: 'wikipedia-mcp';
}

let mcpClient: Client | null = null;
let mcpTransport: StdioClientTransport | null = null;

// Initialize MCP connection to wikipedia-mcp server
async function initMCPClient(): Promise<Client> {
    if (mcpClient) return mcpClient;

    console.log('[MCP] Initializing Wikipedia MCP client...');

    mcpTransport = new StdioClientTransport({
        command: 'npx',
        args: ['-y', 'wikipedia-mcp'],
    });

    mcpClient = new Client({
        name: 'trinity-validation-client',
        version: '1.0.0',
    }, {
        capabilities: {}
    });

    await mcpClient.connect(mcpTransport);
    console.log('[MCP] Connected to Wikipedia MCP server');

    return mcpClient;
}

// List available tools from the MCP server
export async function listMCPTools(): Promise<string[]> {
    try {
        const client = await initMCPClient();
        const tools = await client.listTools();
        return tools.tools.map(t => t.name);
    } catch (e) {
        console.error('[MCP] Failed to list tools:', e);
        return [];
    }
}

// Call Wikipedia MCP to search for articles
export async function mcpWikipediaSearch(query: string): Promise<WikipediaMCPResult | null> {
    try {
        const client = await initMCPClient();

        // Call the search tool (wikipedia-mcp typically has 'search' or 'searchWikipedia')
        const result = await client.callTool({
            name: 'search',
            arguments: { query }
        });

        // Type assertion for MCP SDK content array
        const content = result.content as Array<{ type: string; text?: string }>;

        if (!content || content.length === 0) {
            console.log('[MCP] No search results');
            return null;
        }

        // Parse the result (MCP returns content array)
        const textContent = content.find(c => c.type === 'text');
        if (!textContent || !textContent.text) return null;

        const data = JSON.parse(textContent.text);

        return {
            title: data.title || query,
            extract: data.extract || data.summary || '',
            fullContent: data.content || data.extract,
            url: data.url || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
            source: 'wikipedia-mcp'
        };
    } catch (e) {
        console.error('[MCP] Wikipedia search failed:', e);
        return null;
    }
}

// Call Wikipedia MCP to get full article content
export async function mcpWikipediaGetArticle(title: string): Promise<WikipediaMCPResult | null> {
    try {
        const client = await initMCPClient();

        // Call the getArticle or getPage tool
        const result = await client.callTool({
            name: 'getArticle',
            arguments: { title }
        });

        // Type assertion for MCP SDK content array
        const content = result.content as Array<{ type: string; text?: string }>;

        if (!content || content.length === 0) {
            // Fallback to 'getPage' if 'getArticle' doesn't exist
            try {
                const fallbackResult = await client.callTool({
                    name: 'getPage',
                    arguments: { title }
                });
                const fallbackContent = fallbackResult.content as Array<{ type: string; text?: string }>;
                if (fallbackContent && fallbackContent.length > 0) {
                    const textContent = fallbackContent.find(c => c.type === 'text');
                    if (textContent && textContent.text) {
                        const data = JSON.parse(textContent.text);
                        return {
                            title: data.title || title,
                            extract: data.extract || '',
                            fullContent: data.content || data.text || '',
                            url: data.url || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
                            source: 'wikipedia-mcp'
                        };
                    }
                }
            } catch {
                // Ignore fallback error
            }
            return null;
        }

        const textContent = content.find(c => c.type === 'text');
        if (!textContent || !textContent.text) return null;

        const data = JSON.parse(textContent.text);

        return {
            title: data.title || title,
            extract: data.extract || '',
            fullContent: data.content || data.text || '',
            url: data.url || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
            source: 'wikipedia-mcp'
        };
    } catch (e) {
        console.error('[MCP] Wikipedia getArticle failed:', e);
        return null;
    }
}

// Cleanup MCP connection
export async function closeMCPClient(): Promise<void> {
    if (mcpClient) {
        await mcpClient.close();
        mcpClient = null;
    }
    if (mcpTransport) {
        await mcpTransport.close();
        mcpTransport = null;
    }
}

// Higher-level function: Get Wikipedia content via MCP with fallback to direct API
export async function getWikipediaViaMCP(topic: string): Promise<WikipediaMCPResult | null> {
    try {
        // Try MCP first
        console.log(`[MCP] Fetching "${topic}" via Wikipedia MCP server...`);

        // Try search first
        let result = await mcpWikipediaSearch(topic);
        if (result && result.fullContent) {
            return result;
        }

        // Try direct article fetch
        result = await mcpWikipediaGetArticle(topic);
        if (result) {
            return result;
        }

        console.log('[MCP] MCP fetch failed, falling back to direct API');
        return null;
    } catch (e) {
        console.error('[MCP] MCP client error:', e);
        return null;
    }
}
