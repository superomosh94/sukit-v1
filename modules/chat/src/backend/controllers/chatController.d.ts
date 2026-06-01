export declare function createConversation(
  userId: string,
  siteId: string,
  title?: string
): Promise<any>;
export declare function listConversations(
  userId: string,
  siteId: string
): Promise<any>;
export declare function getConversation(id: string): Promise<any>;
export declare function sendMessage(
  conversationId: string,
  content: string,
  role: string,
  model?: string
): Promise<any>;
export declare function deleteConversation(id: string): Promise<void>;
//# sourceMappingURL=chatController.d.ts.map
