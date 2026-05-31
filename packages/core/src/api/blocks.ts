import type { BlockDefinition, Block } from "../types";

export function createBlocksAPI() {
  const blocks = new Map<string, BlockDefinition>();

  return {
    register(block: BlockDefinition): void {
      blocks.set(block.type, block);
    },

    unregister(type: string): void {
      blocks.delete(type);
    },

    get(type: string): BlockDefinition | undefined {
      return blocks.get(type);
    },

    getAll(): BlockDefinition[] {
      return Array.from(blocks.values());
    },

    getByCategory(category: string): BlockDefinition[] {
      return this.getAll().filter((b) => b.category === category);
    },

    render(block: Block): React.ReactNode {
      const def = blocks.get(block.blockType);
      if (!def) return null;
      const Component = def.component;
      return <Component {...block.props} />;
    },
  };
}

export type BlocksAPI = ReturnType<typeof createBlocksAPI>;
