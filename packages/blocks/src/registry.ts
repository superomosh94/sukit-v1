import { BlockRegistration } from '@sukit/shared';

const registry = new Map<string, BlockRegistration>();

export function registerBlock(block: BlockRegistration): void {
  registry.set(block.type, block);
}

export function getBlock(type: string): BlockRegistration | undefined {
  return registry.get(type);
}

export function getAllBlocks(): BlockRegistration[] {
  return Array.from(registry.values());
}

export function getBlocksByCategory(category: string): BlockRegistration[] {
  return getAllBlocks().filter((b) => b.category === category);
}

export function unregisterBlock(type: string): boolean {
  return registry.delete(type);
}

export function clearRegistry(): void {
  registry.clear();
}
