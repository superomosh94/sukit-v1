import React from 'react';
import type { BlockDefinition, Block } from '../types';
export declare function createBlocksAPI(): {
  register(block: BlockDefinition): void;
  unregister(type: string): void;
  get(type: string): BlockDefinition | undefined;
  getAll(): BlockDefinition[];
  getByCategory(category: string): BlockDefinition[];
  render(block: Block): React.ReactNode;
};
export type BlocksAPI = ReturnType<typeof createBlocksAPI>;
