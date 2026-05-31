import type { EventPayload } from '../types';

export function beforeCreate(payload: EventPayload) {
  console.log('[SiteManager] site:beforeCreate', payload);
}

export function afterCreate(payload: EventPayload) {
  console.log('[SiteManager] site:afterCreate', payload);
}

export function beforeDelete(payload: EventPayload) {
  console.log('[SiteManager] site:beforeDelete', payload);
}

export function afterDelete(payload: EventPayload) {
  console.log('[SiteManager] site:afterDelete', payload);
}
