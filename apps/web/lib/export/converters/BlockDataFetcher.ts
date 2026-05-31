import { prisma } from '@/lib/db/prisma';

export interface BlockDefinition {
  type: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  schema: Record<string, unknown>;
  defaultProps: Record<string, unknown>;
  defaultStyles: Record<string, unknown>;
}

export interface UserBlockData {
  blocks: Array<{
    id: string;
    blockType: string;
    props: Record<string, unknown>;
    styles: Record<string, unknown>;
  }>;
  totalCount: number;
}

export interface BlockCustomizationMap {
  [blockType: string]: {
    count: number;
    usedProps: string[];
    customStyles: boolean;
  };
}

export class BlockDataFetcher {
  async getBlockDefinition(blockType: string): Promise<BlockDefinition | null> {
    const fallbackBlocks: Record<string, Partial<BlockDefinition>> = {
      textBlock: {
        name: 'Text',
        description: 'Rich text block',
        category: 'content',
        icon: 'Type',
      },
      headingBlock: {
        name: 'Heading',
        description: 'Heading with levels',
        category: 'content',
        icon: 'Heading',
      },
      imageBlock: {
        name: 'Image',
        description: 'Image with alt text',
        category: 'media',
        icon: 'Image',
      },
      buttonBlock: {
        name: 'Button',
        description: 'Call to action button',
        category: 'content',
        icon: 'Pointer',
      },
      spacerBlock: {
        name: 'Spacer',
        description: 'Vertical space',
        category: 'layout',
        icon: 'Minus',
      },
      dividerBlock: {
        name: 'Divider',
        description: 'Horizontal line',
        category: 'layout',
        icon: 'SeparatorHorizontal',
      },
      containerBlock: {
        name: 'Container',
        description: 'Max-width container',
        category: 'layout',
        icon: 'Container',
      },
      gridBlock: {
        name: 'Grid',
        description: 'CSS grid layout',
        category: 'layout',
        icon: 'Grid3x3',
      },
      formBlock: {
        name: 'Form',
        description: 'Form builder',
        category: 'forms',
        icon: 'FileInput',
      },
      videoBlock: {
        name: 'Video',
        description: 'Video embed',
        category: 'media',
        icon: 'Video',
      },
      mapBlock: {
        name: 'Map',
        description: 'Google Maps embed',
        category: 'media',
        icon: 'Map',
      },
      iconBlock: {
        name: 'Icon',
        description: 'Lucide icon',
        category: 'content',
        icon: 'Smile',
      },
      accordionBlock: {
        name: 'Accordion',
        description: 'Expandable sections',
        category: 'widgets',
        icon: 'ListCollapse',
      },
      tabsBlock: {
        name: 'Tabs',
        description: 'Tabbed content',
        category: 'widgets',
        icon: 'Tabs',
      },
      carouselBlock: {
        name: 'Carousel',
        description: 'Image carousel',
        category: 'widgets',
        icon: 'Images',
      },
    };

    const fb = fallbackBlocks[blockType];
    if (fb) {
      return {
        type: blockType,
        name: fb.name || blockType,
        description: fb.description || '',
        category: fb.category || 'content',
        icon: fb.icon || 'box',
        schema: {},
        defaultProps: {},
        defaultStyles: {},
      };
    }

    return null;
  }

  async getUserBlockData(
    siteId: string,
    blockType: string
  ): Promise<UserBlockData> {
    const blocks = await prisma.block.findMany({
      where: {
        column: { section: { page: { siteId } } },
        blockType,
      },
      select: { id: true, blockType: true, props: true, styles: true },
      take: 100,
    });

    return {
      blocks: blocks.map((b) => ({
        id: b.id,
        blockType: b.blockType,
        props: b.props as Record<string, unknown>,
        styles: b.styles as Record<string, unknown>,
      })),
      totalCount: blocks.length,
    };
  }

  async getAllBlocksForSite(siteId: string): Promise<BlockDefinition[]> {
    const types = await prisma.block.findMany({
      where: { column: { section: { page: { siteId } } } },
      select: { blockType: true },
      distinct: ['blockType'],
    });

    const definitions: BlockDefinition[] = [];
    for (const { blockType } of types) {
      const def = await this.getBlockDefinition(blockType);
      if (def) definitions.push(def);
    }
    return definitions;
  }

  async getBlockCustomizations(siteId: string): Promise<BlockCustomizationMap> {
    const blocks = await prisma.block.findMany({
      where: { column: { section: { page: { siteId } } } },
      select: { blockType: true, props: true, styles: true },
    });

    const map: BlockCustomizationMap = {};
    for (const b of blocks) {
      if (!map[b.blockType]) {
        map[b.blockType] = { count: 0, usedProps: [], customStyles: false };
      }
      map[b.blockType].count++;
      const props = b.props as Record<string, unknown>;
      for (const key of Object.keys(props)) {
        if (!map[b.blockType].usedProps.includes(key)) {
          map[b.blockType].usedProps.push(key);
        }
      }
      const styles = b.styles as Record<string, unknown>;
      if (styles && Object.keys(styles).length > 0) {
        map[b.blockType].customStyles = true;
      }
    }
    return map;
  }
}

export const blockDataFetcher = new BlockDataFetcher();
