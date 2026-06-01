'use client';

import { useCallback } from 'react';
import { useBuilderStore } from '../stores/builderStore';
import type { Block } from '../types';

export function useCommerceIntegration() {
  const sections = useBuilderStore((s) => s.sections);
  const updateBlock = useBuilderStore((s) => s.updateBlock);

  const setProductBlock = useCallback(
    (
      sectionId: string,
      columnId: string,
      blockId: string,
      productId: string
    ) => {
      updateBlock(sectionId, columnId, blockId, {
        props: { productId } as Record<string, unknown>,
      } as Partial<Block>);
    },
    [updateBlock]
  );

  const getProductBlocks = useCallback(() => {
    const productBlocks: Array<{
      sectionId: string;
      columnId: string;
      block: Block;
    }> = [];
    for (const s of sections) {
      for (const c of s.columns) {
        for (const b of c.blocks) {
          if (b.blockType === 'product' || b.props?.productId) {
            productBlocks.push({ sectionId: s.id, columnId: c.id, block: b });
          }
        }
      }
    }
    return productBlocks;
  }, [sections]);

  return { setProductBlock, getProductBlocks };
}
