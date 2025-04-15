import { NextRequest, NextResponse } from 'next/server';

// Этот эндпоинт будет обрабатывать входящие сообщения от клиента MCP
export async function POST(request: NextRequest) {
  try {
    // Здесь должна быть обработка сообщений от клиента и передача в транспорт
    // В полной реализации необходимо передавать сообщения в активный транспорт SSE
    
    // Пока возвращаем заглушку
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing MCP message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge'; 