import type { EventPayload } from '../types';

export function beforeUpload(payload: EventPayload) {
  console.log('[MediaLibrary] media:beforeUpload', payload);
}

export function afterUpload(payload: EventPayload) {
  console.log('[MediaLibrary] media:afterUpload', payload);
}

export function beforeDelete(payload: EventPayload) {
  console.log('[MediaLibrary] media:beforeDelete', payload);
}

export function afterDelete(payload: EventPayload) {
  console.log('[MediaLibrary] media:afterDelete', payload);
}
