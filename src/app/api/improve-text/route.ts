import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Типы для запроса
interface ImproveTextRequest {
  text: string;
  style?: string;
}

// Инициализация клиентов AI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || '',
});

// Стилевые промпты для разных типов улучшения текста
const stylePrompts: Record<string, string> = {
  general: "Improve this text while maintaining its original meaning:",
  business: "Make this text more professional and business-appropriate:",
  casual: "Make this text more conversational and friendly:"
};

export async function POST(req: NextRequest) {
  try {
    // Получение текста из запроса
    const body = await req.json() as ImproveTextRequest;
    const { text, style } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Missing required field: text' },
        { status: 400 }
      );
    }

    // Определение стиля по умолчанию
    const effectiveStyle = style || 'general';
    const prompt = stylePrompts[effectiveStyle] || stylePrompts.general;
    
    // Выбираем модель в зависимости от доступных API ключей
    let improvedText = '';

    if (process.env.CLAUDE_API_KEY) {
      improvedText = await improveWithClaude(text, prompt);
    } else if (process.env.OPENAI_API_KEY) {
      improvedText = await improveWithOpenAI(text, prompt);
    } else {
      return NextResponse.json(
        { error: 'No AI provider configured' },
        { status: 500 }
      );
    }

    // Возвращаем улучшенный текст
    return NextResponse.json({ improvedText });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to improve text' },
      { status: 500 }
    );
  }
}

// Функция для улучшения текста с использованием Claude
async function improveWithClaude(text: string, prompt: string): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: `${prompt} ${text}`
      }]
    });

    if (response.content[0].type === 'text') {
      return response.content[0].text;
    }
    return 'Content could not be processed';
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to process with Claude');
  }
}

// Функция для улучшения текста с использованием OpenAI
async function improveWithOpenAI(text: string, prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.3,
      max_tokens: 1000,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: text }
      ]
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to process with OpenAI');
  }
}

export const config = {
  runtime: 'nodejs'
}; 