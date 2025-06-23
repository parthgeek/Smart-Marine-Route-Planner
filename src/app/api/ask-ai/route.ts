import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userMessage, routeData } = body;

    if (!userMessage || !routeData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a maritime assistant AI. You will answer questions about the following route data:\n${JSON.stringify(routeData)}`
        },
        {
          role: 'user',
          content: userMessage
        }
      ]
    });

    return NextResponse.json({ reply: completion.choices[0].message.content });
  } catch (err: any) {
    console.error("❌ OpenAI error:", err);
    return NextResponse.json({ error: 'AI processing failed', detail: err.message }, { status: 500 });
  }
}
