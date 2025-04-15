import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { NextResponse } from 'next/server';
import { z } from "zod";

// Создаем MCP сервер
const server = new McpServer({
  name: "Vercel Integration",
  version: "1.0.0",
  description: "MCP сервер для интеграции с Vercel API"
});

// Простой инструмент для тестирования
server.tool(
  "vercel-test",
  { message: z.string() },
  async ({ message }) => ({
    content: [{ type: "text", text: `Тестовый ответ: ${message}` }]
  })
);

// Инструмент для получения списка проектов
server.tool(
  "vercel-list-projects",
  { limit: z.number().optional() },
  async ({ limit = 20 }) => {
    try {
      const token = process.env.VERCEL_API_TOKEN;
      if (!token) {
        return {
          content: [{ type: "text", text: "Ошибка: отсутствует токен Vercel API" }],
          isError: true
        };
      }

      const response = await fetch(`https://api.vercel.com/v9/projects?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return {
          content: [{ type: "text", text: `Ошибка API: ${response.status} ${response.statusText}` }],
          isError: true
        };
      }

      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Ошибка: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true
      };
    }
  }
);

// Обрабатываем SSE запросы
export async function GET(request: Request) {
  const response = new NextResponse();
  
  // Настройка заголовков для SSE
  response.headers.set('Content-Type', 'text/event-stream');
  response.headers.set('Cache-Control', 'no-cache');
  response.headers.set('Connection', 'keep-alive');
  
  const transport = new SSEServerTransport('/api/mcp/message', response);
  
  // Подключаем сервер к транспорту
  await server.connect(transport);
  
  return response;
}

// Эндпоинт для получения сообщений от клиента
export async function POST(request: Request) {
  // Здесь нужно обработать входящие сообщения от клиента
  // Но базовая реализация возвращает ошибку, так как требуется более сложная логика
  return new NextResponse(JSON.stringify({ error: "Not implemented" }), {
    status: 501,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export const runtime = 'edge'; 