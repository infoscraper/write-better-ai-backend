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

// SSE обработчик
export async function GET() {
  const encoder = new TextEncoder();
  const customUUID = Math.random().toString(36).substring(2, 15);
  
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  
  // Функция для отправки SSE сообщений
  const writeToStream = async (data: unknown) => {
    await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };
  
  // Отправляем начальное сообщение
  const initialMessage = {
    type: "init",
    id: customUUID,
    capabilities: {
      tools: {}
    },
    meta: {
      name: "Vercel Integration",
      version: "1.0.0",
      description: "MCP сервер для интеграции с Vercel API"
    }
  };
  
  // Отправляем init сообщение
  writeToStream(initialMessage);
  
  // Отправляем список инструментов
  setTimeout(async () => {
    await writeToStream({
      type: "response",
      id: Math.random().toString(36).substring(2, 15),
      request_id: customUUID,
      response: {
        tools: tools
      }
    });
  }, 100);
  
  return new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

// Обработчик вызовов инструментов
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Обработка вызова инструмента vercel-test
    if (body.type === 'request' && body.params && body.params.name === 'vercel-test') {
      const args = body.params.arguments || {};
      
      return NextResponse.json({
        type: 'response',
        id: Math.random().toString(36).substring(2, 15),
        request_id: body.id,
        response: {
          content: [{ type: "text", text: `Тестовый ответ: ${args.message || 'не указано сообщение'}` }]
        }
      });
    }
    
    // Если инструмент не найден
    return NextResponse.json({
      type: 'response',
      id: Math.random().toString(36).substring(2, 15),
      request_id: body.id || 'unknown',
      response: {
        content: [{ type: "text", text: "Инструмент не найден или не поддерживается" }],
        isError: true
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