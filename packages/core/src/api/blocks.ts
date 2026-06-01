import React from 'react';
import type { BlockDefinition, Block } from '../types';

interface BlockVersion {
  type: string;
  version: string;
  definition: BlockDefinition;
  createdAt: number;
}

interface BlockTemplate {
  id: string;
  name: string;
  category: string;
  blocks: Block[];
}

export function createBlocksAPI() {
  const blocks = new Map<string, BlockDefinition>();
  const versions = new Map<string, BlockVersion[]>();
  const templates = new Map<string, BlockTemplate>();
  const dependencies = new Map<string, string[]>();
  const variations = new Map<string, BlockDefinition[]>();

  return {
    register(block: BlockDefinition): void {
      blocks.set(block.type, block);

      if (!versions.has(block.type)) {
        versions.set(block.type, []);
      }
      versions.get(block.type)!.push({
        type: block.type,
        version: '1.0.0',
        definition: block,
        createdAt: Date.now(),
      });
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
      return React.createElement(def.component, block.props);
    },

    /* --- Validation --- */
    validate(
      type: string,
      props: Record<string, any>
    ): { valid: boolean; errors: string[] } {
      const def = blocks.get(type);
      if (!def)
        return { valid: false, errors: [`Block type "${type}" not found`] };
      const errors: string[] = [];
      const schema = def.schema ?? {};
      for (const [key, config] of Object.entries(schema) as [string, any][]) {
        if (
          config.required &&
          (props[key] === undefined || props[key] === null || props[key] === '')
        ) {
          errors.push(`Missing required prop "${key}"`);
        }
        if (props[key] !== undefined && config.type) {
          const actualType = typeof props[key];
          if (config.type === 'array' && !Array.isArray(props[key]))
            errors.push(`Prop "${key}" must be an array`);
          else if (config.type !== 'array' && actualType !== config.type)
            errors.push(
              `Prop "${key}" must be of type ${config.type}, got ${actualType}`
            );
        }
      }
      return { valid: errors.length === 0, errors };
    },

    /* --- Search --- */
    search(query: string): BlockDefinition[] {
      const q = query.toLowerCase();
      return this.getAll().filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.type.toLowerCase().includes(q)
      );
    },

    /* --- Versioning --- */
    getVersions(type: string): BlockVersion[] {
      return versions.get(type) ?? [];
    },

    /* --- Dependencies --- */
    setDependency(blockType: string, dependsOn: string[]): void {
      dependencies.set(blockType, dependsOn);
    },

    getDependencies(blockType: string): string[] {
      return dependencies.get(blockType) ?? [];
    },

    /* --- Variations --- */
    registerVariation(blockType: string, variation: BlockDefinition): void {
      if (!variations.has(blockType)) variations.set(blockType, []);
      variations.get(blockType)!.push(variation);
    },

    getVariations(blockType: string): BlockDefinition[] {
      return variations.get(blockType) ?? [];
    },

    /* --- Templates --- */
    registerTemplate(template: BlockTemplate): void {
      templates.set(template.id, template);
    },

    getTemplates(category?: string): BlockTemplate[] {
      const all = Array.from(templates.values());
      return category ? all.filter((t) => t.category === category) : all;
    },

    /* --- Styles --- */
    getDefaultStyles(type: string): Record<string, any> {
      const def = blocks.get(type);
      return def?.defaultStyles ?? {};
    },

    /* --- Hooks --- */
    hooks: new Map<
      string,
      Array<{ hook: string; handler: (block: Block) => void | Promise<void> }>
    >(),

    addHook(
      type: string,
      hook: string,
      handler: (block: Block) => void | Promise<void>
    ): void {
      if (!this.hooks.has(type)) this.hooks.set(type, []);
      this.hooks.get(type)!.push({ hook, handler });
    },

    async runHook(type: string, hook: string, block: Block): Promise<void> {
      const handlers =
        this.hooks.get(type)?.filter((h) => h.hook === hook) ?? [];
      for (const { handler } of handlers) {
        await handler(block);
      }
    },

    /* --- Composition --- */
    compose(blocks: Block[]): Block {
      return {
        id: 'composed-' + Date.now(),
        blockType: 'composition',
        props: {},
        children: blocks,
      };
    },
  };
}

export type BlocksAPI = ReturnType<typeof createBlocksAPI>;
