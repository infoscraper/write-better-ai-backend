import { NextResponse } from 'next/server';

export async function GET() {
  // Простой ответ для проверки работоспособности
  return NextResponse.json({
    status: "MCP server is running",
    timestamp: new Date().toISOString(),
    tools: ["vercel-test"]
  });
}

// Явно указываем, что используем Node.js среду
export const config = {
  runtime: 'nodejs'
}; 