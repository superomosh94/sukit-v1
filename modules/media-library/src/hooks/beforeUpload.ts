import type { MediaAsset } from '../types';

export interface BeforeUploadEvent {
  file: File;
  asset?: MediaAsset;
}

export type BeforeUploadHandler = (
  event: BeforeUploadEvent
) => Promise<boolean | void>;

const hooks: BeforeUploadHandler[] = [];

export function addBeforeUploadHook(handler: BeforeUploadHandler) {
  hooks.push(handler);
}

export function removeBeforeUploadHook(handler: BeforeUploadHandler) {
  const idx = hooks.indexOf(handler);
  if (idx >= 0) hooks.splice(idx, 1);
}

export async function runBeforeUploadHooks(
  event: BeforeUploadEvent
): Promise<boolean> {
  for (const hook of hooks) {
    const result = await hook(event);
    if (result === false) return false;
  }
  return true;
}
