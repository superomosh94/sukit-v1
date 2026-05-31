import type { BlockRegistration, BlockPropSchema } from './types';

class BlockRegistry {
  private blocks: Map<string, BlockRegistration> = new Map();

  registerBlockType(registration: BlockRegistration): void {
    this.validateSchema(registration.schema);
    if (this.blocks.has(registration.type)) {
      console.warn(
        `Block type "${registration.type}" is already registered. Overwriting.`
      );
    }
    this.blocks.set(registration.type, registration);
  }

  private validateSchema(schema: Record<string, BlockPropSchema>): void {
    for (const [key, prop] of Object.entries(schema)) {
      if (prop.required && prop.default !== undefined) {
        console.warn(
          `Prop "${key}" is marked required but has a default value.`
        );
      }
    }
  }

  getBlockType(type: string): BlockRegistration | undefined {
    return this.blocks.get(type);
  }

  getAllBlockTypes(): BlockRegistration[] {
    return Array.from(this.blocks.values());
  }

  getBlocksByCategory(
    category: BlockRegistration['category']
  ): BlockRegistration[] {
    return this.getAllBlockTypes().filter((b) => b.category === category);
  }

  getCategories(): string[] {
    return Array.from(new Set(this.getAllBlockTypes().map((b) => b.category)));
  }

  searchBlocks(query: string): BlockRegistration[] {
    const lower = query.toLowerCase();
    return this.getAllBlockTypes().filter(
      (b) =>
        b.label.toLowerCase().includes(lower) ||
        b.type.toLowerCase().includes(lower) ||
        (b.description ?? '').toLowerCase().includes(lower)
    );
  }

  getTemplates(type: string): BlockRegistration['templates'] {
    return this.blocks.get(type)?.templates;
  }
}

export const blockRegistry = new BlockRegistry();
