import { NextResponse } from 'next/server';
import { sendMessage, getConversation, listConversations, createConversation } from '../controllers/chatController';
export async function POST_message(req) {
    const { conversationId, content, role, model } = await req.json();
    const result = await sendMessage(conversationId, content, role || 'user', model);
    return NextResponse.json(result, { status: 201 });
}
export async function GET_conversations(req) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const siteId = searchParams.get('siteId');
    const id = searchParams.get('id');
    if (id)
        return NextResponse.json(await getConversation(id));
    return NextResponse.json(await listConversations(userId, siteId));
}
export async function POST_conversation(req) {
    const { userId, siteId, title } = await req.json();
    return NextResponse.json(await createConversation(userId, siteId, title), { status: 201 });
}
//# sourceMappingURL=chatRoutes.js.map