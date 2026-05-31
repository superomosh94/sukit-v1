import type { BlockData } from '../generators/frontend.js';

export interface BlockVariation {
  id: string;
  name: string;
  description: string;
  overrides: {
    props?: Record<string, unknown>;
    styles?: Record<string, unknown>;
  };
}

const BLOCK_VARIATIONS: Record<string, BlockVariation[]> = {
  buttonBlock: [
    {
      id: 'primary',
      name: 'Primary',
      description: 'Solid primary button',
      overrides: { props: { variant: 'primary' } },
    },
    {
      id: 'secondary',
      name: 'Secondary',
      description: 'Secondary outline button',
      overrides: { props: { variant: 'secondary' } },
    },
    {
      id: 'outline',
      name: 'Outline',
      description: 'Border-only button',
      overrides: { props: { variant: 'outline' } },
    },
    {
      id: 'ghost',
      name: 'Ghost',
      description: 'Minimal ghost button',
      overrides: { props: { variant: 'ghost' } },
    },
    {
      id: 'link',
      name: 'Link',
      description: 'Text link style button',
      overrides: { props: { variant: 'link' } },
    },
    {
      id: 'large',
      name: 'Large',
      description: 'Large button with icon',
      overrides: { props: { variant: 'primary', size: 'lg' } },
    },
    {
      id: 'small',
      name: 'Small',
      description: 'Small compact button',
      overrides: { props: { variant: 'primary', size: 'sm' } },
    },
  ],
  headingBlock: [
    {
      id: 'h1',
      name: 'Heading 1',
      description: 'Main page heading',
      overrides: { props: { level: 1 } },
    },
    {
      id: 'h2',
      name: 'Heading 2',
      description: 'Section heading',
      overrides: { props: { level: 2 } },
    },
    {
      id: 'h3',
      name: 'Heading 3',
      description: 'Subsection heading',
      overrides: { props: { level: 3 } },
    },
  ],
  imageBlock: [
    {
      id: 'rounded',
      name: 'Rounded',
      description: 'Image with rounded corners',
      overrides: { styles: { borderRadius: '8px' } },
    },
    {
      id: 'circle',
      name: 'Circle',
      description: 'Circular image',
      overrides: { styles: { borderRadius: '50%' } },
    },
    {
      id: 'shadow',
      name: 'Shadow',
      description: 'Image with shadow',
      overrides: { styles: { boxShadow: '0 4px 6px rgba(0,0,0,0.1)' } },
    },
  ],
  containerBlock: [
    {
      id: 'narrow',
      name: 'Narrow',
      description: 'Narrow container (720px)',
      overrides: { props: { maxWidth: '720px' } },
    },
    {
      id: 'default',
      name: 'Default',
      description: 'Default container (1200px)',
      overrides: { props: { maxWidth: '1200px' } },
    },
    {
      id: 'wide',
      name: 'Wide',
      description: 'Wide container (1400px)',
      overrides: { props: { maxWidth: '1400px' } },
    },
    {
      id: 'full',
      name: 'Full Width',
      description: 'Full width container',
      overrides: { props: { maxWidth: '100%' } },
    },
  ],
  gridBlock: [
    {
      id: '2cols',
      name: '2 Columns',
      description: 'Two equal columns',
      overrides: { props: { columns: 2, gap: '16px' } },
    },
    {
      id: '3cols',
      name: '3 Columns',
      description: 'Three equal columns',
      overrides: { props: { columns: 3, gap: '16px' } },
    },
    {
      id: '4cols',
      name: '4 Columns',
      description: 'Four equal columns',
      overrides: { props: { columns: 4, gap: '12px' } },
    },
  ],
};

export class BlockTemplateEngine {
  getBlockVariations(blockType: string): BlockVariation[] {
    return BLOCK_VARIATIONS[blockType] || [];
  }

  applyVariation(block: BlockData, variationId: string): BlockData {
    const variations = this.getBlockVariations(block.blockType);
    const variation = variations.find((v) => v.id === variationId);
    if (!variation) return block;

    return {
      ...block,
      props: { ...block.props, ...variation.overrides.props },
      styles: { ...block.styles, ...variation.overrides.styles },
    };
  }

  mergeUserOverrides(
    base: BlockData,
    overrides: Partial<BlockData>
  ): BlockData {
    return {
      ...base,
      props: this.deepMerge(base.props, overrides.props || {}),
      styles: this.deepMerge(base.styles || {}, overrides.styles || {}),
    };
  }

  getVariationById(
    blockType: string,
    variationId: string
  ): BlockVariation | null {
    const variations = this.getBlockVariations(blockType);
    return variations.find((v) => v.id === variationId) || null;
  }

  getAllVariationsGrouped(): Record<string, BlockVariation[]> {
    return { ...BLOCK_VARIATIONS };
  }

  private deepMerge(
    base: Record<string, unknown>,
    override: Record<string, unknown>
  ): Record<string, unknown> {
    const result = { ...base };
    for (const [key, value] of Object.entries(override)) {
      if (value !== undefined) {
        result[key] = value;
      }
    }
    return result;
  }
}

export const blockTemplateEngine = new BlockTemplateEngine();
