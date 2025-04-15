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

// GET обработчик - заменяем SSE на обычный HTTP ответ
export async function GET() {
  const customUUID = Math.random().toString(36).substring(2, 15);
  
  // Возвращаем всю информацию в одном HTTP ответе
  return NextResponse.json({
    jsonrpc: "2.0",
    id: customUUID,
    result: {
      capabilities: {
        tools: {}
      },
      meta: {
        name: "Vercel Integration",
        version: "1.0.0",
        description: "MCP сервер для интеграции с Vercel API"
      },
      tools: tools
    }
  }, {
    headers: {
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

// Обработчик вызовов инструментов
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Проверяем, что это JSON-RPC запрос
    if (body.jsonrpc !== "2.0" || !body.method || !body.id) {
      return NextResponse.json({
        jsonrpc: "2.0",
        id: body.id || null,
        error: {
          code: -32600,
          message: "Invalid Request"
        }
      }, { status: 400 });
    }
    
    // Обработка вызова инструмента
    if (body.method === "callTool") {
      const params = body.params || {};
      
      // Проверяем наличие имени инструмента
      if (!params.name) {
        return NextResponse.json({
          jsonrpc: "2.0",
          id: body.id,
          error: {
            code: -32602,
            message: "Invalid params: tool name is required"
          }
        }, { status: 400 });
      }
      
      // Вызов инструмента vercel-test
      if (params.name === 'vercel-test') {
        const args = params.arguments || {};
        
        return NextResponse.json({
          jsonrpc: "2.0",
          id: body.id,
          result: {
            content: [{ type: "text", text: `Тестовый ответ: ${args.message || 'не указано сообщение'}` }]
          }
        });
      }
      
      // Инструмент не найден
      return NextResponse.json({
        jsonrpc: "2.0",
        id: body.id,
        error: {
          code: -32601,
          message: `Method not found: ${params.name}`
        }
      }, { status: 404 });
    }
    
    // Обработка запроса на получение списка инструментов
    if (body.method === "listTools") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          tools: tools
        }
      });
    }
    
    // Метод не найден
    return NextResponse.json({
      jsonrpc: "2.0",
      id: body.id,
      error: {
        code: -32601,
        message: `Method not found: ${body.method}`
      }
    }, { status: 404 });
    
  } catch (error) {
    console.error('Ошибка обработки запроса:', error);
    return NextResponse.json({
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32603,
        message: `Internal error: ${error instanceof Error ? error.message : String(error)}`
      }
    }, { status: 500 });
  }
}

// Явно указываем, что используем Node.js среду вместо Edge Runtime
export const config = {
  runtime: 'nodejs'
}; 