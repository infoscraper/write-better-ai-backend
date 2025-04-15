import { NextRequest, NextResponse } from 'next/server';

// Определение инструментов
const tools = [
  {
    name: "vercel-test",
    description: "Тестовый инструмент Vercel API",
    parameters: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "Сообщение для эхо-ответа"
        }
      },
      required: ["message"]
    }
  }
];

// Простой ответ для проверки работоспособности
export async function GET() {
  return new NextResponse(
    JSON.stringify({ status: "MCP server is running" }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}

// Обработчик вызовов инструментов
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Простой эхо-ответ для тестирования
    return NextResponse.json({
      type: 'response',
      id: Math.random().toString(36).substring(2, 15),
      request_id: body.id || 'unknown',
      response: {
        tools: tools,
        message: "Echo response from Vercel"
      }
    });
  } catch (error) {
    console.error('Ошибка обработки запроса:', error);
    return NextResponse.json({
      type: 'error',
      message: `Error processing request: ${error instanceof Error ? error.message : String(error)}`
    }, { status: 500 });
  }
}

// Удаляем Edge Runtime
// export const runtime = 'edge'; 