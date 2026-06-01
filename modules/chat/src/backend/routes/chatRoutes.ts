import { NextRequest, NextResponse } from 'next/server';
import {
  sendMessage,
  getConversation,
  listConversations,
  createConversation,
} from '../controllers/chatController';

export async function POST_message(req: NextRequest) {
  const { conversationId, content, role, model } = await req.json();
  const result = await sendMessage(
    conversationId,
    content,
    role || 'user',
    model
  );
  return NextResponse.json(result, { status: 201 });
}

export async function GET_conversations(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') as string;
  const siteId = searchParams.get('siteId') as string;
  const id = searchParams.get('id');

  if (id) return NextResponse.json(await getConversation(id));
  return NextResponse.json(await listConversations(userId, siteId));
}

export async function POST_conversation(req: NextRequest) {
  const { userId, siteId, title } = await req.json();
  return NextResponse.json(await createConversation(userId, siteId, title), {
    status: 201,
  });
}
