import type { PropsWithChildren } from 'react';
import type { Section } from '@/lib/builder/types';
import { blockRegistry } from '@/lib/builder/block-registry';

interface CustomSectionProps {
  data: Section;
  className?: string;
}

export function CustomSection({ data, className }: CustomSectionProps) {
  const bgColor = (data.settings?.backgroundColor as string) ?? 'transparent';
  const paddingTop = (data.settings?.paddingTop as number) ?? 40;
  const paddingBottom = (data.settings?.paddingBottom as number) ?? 40;

  return (
    <section
      className={className}
      style={{
        backgroundColor: bgColor,
        paddingTop,
        paddingBottom,
      }}
    >
      <div className="mx-auto w-full max-w-[1200px] px-4">
        <div className="grid grid-cols-12 gap-4">
          {data.columns
            .sort((a, b) =>
              a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0
            )
            .map((column) => (
              <div
                key={column.id}
                style={{
                  gridColumn: `span ${column.span} / span ${column.span}`,
                }}
              >
                {column.blocks
                  .sort((a, b) =>
                    a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0
                  )
                  .map((block) => {
                    const registration = blockRegistry.getBlockType(
                      block.blockType
                    );
                    if (!registration) {
                      return (
                        <div
                          key={block.id}
                          className="rounded border border-dashed border-muted-foreground/30 p-4 text-center text-sm text-muted-foreground"
                        >
                          {block.blockType}
                        </div>
                      );
                    }
                    const Component = registration.Component;
                    return (
                      <div
                        key={block.id}
                        data-block-id={block.id}
                        style={block.styles as Record<string, string | number>}
                      >
                        <Component block={block} />
                      </div>
                    );
                  })}
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
