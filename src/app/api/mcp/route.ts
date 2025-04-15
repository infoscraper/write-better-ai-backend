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
  },
  {
    name: "vercel-list-projects",
    description: "Получение списка проектов из Vercel API",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Максимальное количество проектов для возврата"
        }
      }
    }
  }
];

// Обработчик SSE запросов
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const customUUID = Math.random().toString(36).substring(2, 15);
  
  // Создаем трансформирующий поток для SSE
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  
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
  
  const writeToStream = async (data: any) => {
    await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };
  
  // Записываем начальное сообщение
  await writeToStream(initialMessage);
  
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
  
  // Возвращаем поток с заголовками SSE
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
    
    // Обработка вызова инструмента
    if (body.type === 'request' && body.params && body.params.name) {
      const toolName = body.params.name;
      const args = body.params.arguments || {};
      
      // Обработка разных инструментов
      if (toolName === 'vercel-test') {
        return NextResponse.json({
          type: 'response',
          id: Math.random().toString(36).substring(2, 15),
          request_id: body.id,
          response: {
            content: [{ type: "text", text: `Тестовый ответ: ${args.message}` }]
          }
        });
      } 
      
      if (toolName === 'vercel-list-projects') {
        try {
          const token = process.env.VERCEL_API_TOKEN;
          if (!token) {
            return NextResponse.json({
              type: 'response',
              id: Math.random().toString(36).substring(2, 15),
              request_id: body.id,
              response: {
                content: [{ type: "text", text: "Ошибка: отсутствует токен Vercel API" }],
                isError: true
              }
            });
          }

          const limit = args.limit || 20;
          const response = await fetch(`https://api.vercel.com/v9/projects?limit=${limit}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (!response.ok) {
            return NextResponse.json({
              type: 'response',
              id: Math.random().toString(36).substring(2, 15),
              request_id: body.id,
              response: {
                content: [{ type: "text", text: `Ошибка API: ${response.status} ${response.statusText}` }],
                isError: true
              }
            });
          }

          const data = await response.json();
          return NextResponse.json({
            type: 'response',
            id: Math.random().toString(36).substring(2, 15),
            request_id: body.id,
            response: {
              content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
            }
          });
        } catch (error) {
          return NextResponse.json({
            type: 'response',
            id: Math.random().toString(36).substring(2, 15),
            request_id: body.id,
            response: {
              content: [{ type: "text", text: `Ошибка: ${error instanceof Error ? error.message : String(error)}` }],
              isError: true
            }
          });
        }
      }
      
      // Инструмент не найден
      return NextResponse.json({
        type: 'response',
        id: Math.random().toString(36).substring(2, 15),
        request_id: body.id,
        response: {
          content: [{ type: "text", text: `Инструмент "${toolName}" не найден` }],
          isError: true
        }
      });
    }
    
    // Неизвестный тип запроса
    return NextResponse.json({
      type: 'error',
      id: Math.random().toString(36).substring(2, 15),
      request_id: body.id || 'unknown',
      error: {
        message: 'Неизвестный тип запроса'
      }
    }, { status: 400 });
  } catch (error) {
    console.error('Ошибка обработки запроса:', error);
    return NextResponse.json({
      type: 'error',
      id: Math.random().toString(36).substring(2, 15),
      error: {
        message: `Ошибка обработки запроса: ${error instanceof Error ? error.message : String(error)}`
      }
    }, { status: 500 });
  }
}

export const runtime = 'edge'; 