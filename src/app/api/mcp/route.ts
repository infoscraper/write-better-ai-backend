import { createMCPHandler } from '@modelcontextprotocol/server-vercel';

export const GET = createMCPHandler({
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  },
});

export const runtime = 'edge'; 