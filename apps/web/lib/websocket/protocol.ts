export type BuilderSocketEvent =
  | { type: 'BLOCK_UPDATE'; roomId: string; payload: { blockId: string; props: Record<string, unknown>; styles?: Record<string, unknown>; version: number; nonce: number }; userId: string; timestamp: number }
  | { type: 'BLOCK_MOVE'; roomId: string; payload: { blockId: string; newSortKey: string; version: number; nonce: number }; userId: string; timestamp: number }
  | { type: 'BLOCK_DELETE'; roomId: string; payload: { blockId: string; version: number; nonce: number }; userId: string; timestamp: number }
  | { type: 'SECTION_ADD'; roomId: string; payload: { section: any }; userId: string; timestamp: number }
  | { type: 'SECTION_REORDER'; roomId: string; payload: { sectionId: string; newSortKey: string }; userId: string; timestamp: number }
  | { type: 'SECTION_DELETE'; roomId: string; payload: { sectionId: string }; userId: string; timestamp: number }
  | { type: 'CURSOR_MOVE'; roomId: string; payload: { x: number; y: number; elementId?: string }; userId: string; timestamp: number }
  | { type: 'SELECT_CHANGE'; roomId: string; payload: { elementId: string | null; elementType: string | null }; userId: string; timestamp: number }
  | { type: 'SCENE_INIT'; roomId: string; payload: { sections: any[]; pageSettings: any; sceneVersion: number }; userId: string; timestamp: number }
  | { type: 'SCENE_SYNC'; roomId: string; payload: { sections: any[]; pageSettings: any; sceneVersion: number }; userId: string; timestamp: number }
  | { type: 'USER_JOIN'; roomId: string; payload: { username: string; color: string }; userId: string; timestamp: number }
  | { type: 'USER_LEAVE'; roomId: string; payload: {}; userId: string; timestamp: number }
  | { type: 'IDLE_CHANGE'; roomId: string; payload: { isIdle: boolean }; userId: string; timestamp: number };

export type BuilderEventType = BuilderSocketEvent['type'];

export function createEvent<T extends BuilderSocketEvent['type']>(
  type: T,
  roomId: string,
  payload: Extract<BuilderSocketEvent, { type: T }>['payload'],
  userId: string,
): Extract<BuilderSocketEvent, { type: T }> {
  return { type, roomId, payload, userId, timestamp: Date.now() } as Extract<BuilderSocketEvent, { type: T }>;
}
