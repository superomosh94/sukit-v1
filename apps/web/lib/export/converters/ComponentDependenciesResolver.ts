export interface ImportMap {
  [modulePath: string]: string[];
}

export interface SharedComponent {
  name: string;
  usedBy: string[];
  path: string;
}

export interface ChunkPlan {
  chunks: Array<{
    name: string;
    components: string[];
    size: number;
  }>;
}

const BLOCK_IMPORTS: Record<string, { default: string[]; external: string[] }> =
  {
    textBlock: { default: [], external: [] },
    headingBlock: { default: [], external: [] },
    imageBlock: { default: [], external: [] },
    buttonBlock: { default: [], external: ['Link'] },
    formBlock: { default: ['useState'], external: [] },
    tabsBlock: { default: ['useState'], external: [] },
    carouselBlock: { default: ['useState'], external: [] },
    accordionBlock: { default: [], external: [] },
    videoBlock: { default: [], external: [] },
    mapBlock: { default: [], external: [] },
    containerBlock: { default: [], external: [] },
    gridBlock: { default: [], external: [] },
    spacerBlock: { default: [], external: [] },
    dividerBlock: { default: [], external: [] },
    iconBlock: { default: [], external: ['* as Icons'] },
  };

export class ComponentDependenciesResolver {
  resolveImports(blocks: string[]): ImportMap {
    const imports: ImportMap = {};

    for (const blockType of blocks) {
      const blockImports = BLOCK_IMPORTS[blockType];
      if (!blockImports) continue;

      if (blockImports.default.length > 0) {
        const key = 'react';
        if (!imports[key]) imports[key] = [];
        for (const imp of blockImports.default) {
          if (!imports[key].includes(imp)) imports[key].push(imp);
        }
      }

      if (blockImports.external.length > 0) {
        for (const ext of blockImports.external) {
          if (ext.startsWith('* as ')) {
            const lib = 'lucide-react';
            if (!imports[lib]) imports[lib] = [];
            const name = ext.replace('* as ', '');
            if (!imports[lib].includes(name)) imports[lib].push(name);
          } else {
            const lib = 'react-router-dom';
            if (!imports[lib]) imports[lib] = [];
            if (!imports[lib].includes(ext)) imports[lib].push(ext);
          }
        }
      }
    }

    return imports;
  }

  resolveSharedComponents(blocks: string[]): SharedComponent[] {
    const usageCount = new Map<string, string[]>();
    const blockPages = this.getBlockPageMap(blocks);

    for (const [blockType, pages] of Object.entries(blockPages)) {
      usageCount.set(blockType, pages);
    }

    return Array.from(usageCount.entries())
      .filter(([_, pages]) => pages.length > 1)
      .map(([name, usedBy]) => ({
        name: this.blockToComponent(name),
        usedBy,
        path: `../components/blocks/${name}`,
      }));
  }

  optimizeChunking(
    components: Array<{ name: string; size: number }>
  ): ChunkPlan {
    const sorted = [...components].sort((a, b) => b.size - a.size);
    const chunks: ChunkPlan['chunks'] = [];
    const MAX_CHUNK_SIZE = 244 * 1024;

    let currentChunk: { name: string; components: string[]; size: number } = {
      name: `chunk-${chunks.length}`,
      components: [],
      size: 0,
    };

    for (const comp of sorted) {
      if (currentChunk.size + comp.size > MAX_CHUNK_SIZE) {
        chunks.push(currentChunk);
        currentChunk = {
          name: `chunk-${chunks.length}`,
          components: [],
          size: 0,
        };
      }
      currentChunk.components.push(comp.name);
      currentChunk.size += comp.size;
    }

    if (currentChunk.components.length > 0) {
      chunks.push(currentChunk);
    }

    return { chunks };
  }

  generatePageImports(blocks: string[]): string {
    const imports = this.resolveImports(blocks);
    const lines: string[] = [];

    const reactImports = imports['react'];
    if (reactImports?.length) {
      lines.push(
        `import React${reactImports.length ? `, { ${reactImports.join(', ')} }` : ''} from 'react';`
      );
    }

    const routerImports = imports['react-router-dom'];
    if (routerImports?.length) {
      lines.push(
        `import { ${routerImports.join(', ')} } from 'react-router-dom';`
      );
    }

    const lucideImports = imports['lucide-react'];
    if (lucideImports?.length) {
      lines.push(`import { ${lucideImports.join(', ')} } from 'lucide-react';`);
    }

    return lines.join('\n');
  }

  private blockToComponent(blockType: string): string {
    const name = blockType.replace(/Block$/, '');
    return name.charAt(0).toUpperCase() + name.slice(1) + 'Block';
  }

  private getBlockPageMap(blocks: string[]): Record<string, string[]> {
    const map: Record<string, string[]> = {};
    for (const block of blocks) {
      if (!map[block]) map[block] = ['shared'];
    }
    return map;
  }
}

export const componentDepsResolver = new ComponentDependenciesResolver();
