// Temporary MCP smoke-test client for wiki.superfamicom.org.
// Run with Node 26.3 from inside uttori-wiki so the optional SDK resolves.
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const url = new URL(process.env.MCP_URL || 'http://127.0.0.1:8000/mcp');

/**
 * Truncate a value to a short JSON preview string.
 * @param {unknown} value The value to preview.
 * @param {number} [length] Max characters.
 * @returns {string} The truncated JSON string.
 */
const preview = (value, length = 600) => {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return text.length > length ? `${text.slice(0, length)}...` : text;
};

const transport = new StreamableHTTPClientTransport(url);
const client = new Client({ name: 'sfc-smoke', version: '1.0.0' }, { capabilities: {} });

await client.connect(transport);
console.log('CONNECTED to', url.href);

const tools = await client.listTools();
console.log('\nTOOLS:', tools.tools.map(t => t.name).join(', '));

const prompts = await client.listPrompts();
console.log('PROMPTS:', prompts.prompts.map(p => p.name).join(', '));

const resources = await client.listResources();
console.log('RESOURCES:', resources.resources.length, '➜ e.g.', resources.resources.slice(0, 3).map(r => r.uri).join(', '));

const query = process.env.MCP_QUERY || 'How does DMA work on the SNES?';
console.log('\n--- callTool vectorSearch:', JSON.stringify(query), '---');
const vs = await client.callTool({ name: 'vectorSearch', arguments: { query, limit: 4 } });
console.log(preview(vs.content?.[0]?.text, 1200));

console.log('\n--- callTool searchDocuments: "dma" ---');
const sd = await client.callTool({ name: 'searchDocuments', arguments: { query: 'dma' } });
console.log(preview(sd.content?.[0]?.text, 600));

await client.close();
console.log('\nDONE');
