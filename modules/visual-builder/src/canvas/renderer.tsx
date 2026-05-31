import React, { memo, useRef, useEffect, useState, useCallback } from 'react';
import type { Block, Section, Column, Page, DeviceViewport } from '../types';
import { blockRegistry } from '../block-registry';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useBuilderStore } from '../stores/builderStore';
import { cn } from '../utils/cn';

const INLINE_EDITABLE_TYPES = new Set([
  'heading',
  'paragraph',
  'text',
  'link',
  'quote',
]);

function InlineEditor({
  block,
  children,
  onSave,
}: {
  block: Block;
  children: React.ReactNode;
  onSave?: (text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const props = block.props as Record<string, unknown>;
  const text = (props.text as string) ?? '';

  const handleDoubleClick = useCallback(() => {
    if (!INLINE_EDITABLE_TYPES.has(block.blockType)) return;
    setEditing(true);
    setValue(text);
  }, [block.blockType, text]);

  const handleSave = useCallback(() => {
    setEditing(false);
    if (value !== text && value.trim()) {
      onSave?.(value);
    }
  }, [value, text, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditing(false);
        setValue(text);
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      }
    },
    [text, handleSave]
  );

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  if (editing) {
    return (
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full resize-none rounded border border-blue-500 bg-background p-1 text-xs outline-none"
        style={{ minHeight: 32, ...(block.styles as React.CSSProperties) }}
      />
    );
  }

  return (
    <div onDoubleClick={handleDoubleClick} className="group cursor-text">
      {children}
      {INLINE_EDITABLE_TYPES.has(block.blockType) && (
        <span className="invisible group-hover:visible absolute -top-3 right-0 rounded bg-blue-500 px-1 text-[9px] text-white">
          edit
        </span>
      )}
    </div>
  );
}

export function resolveBlock(block: Block, viewport: DeviceViewport): Block {
  if (viewport === 'desktop' || !block.responsive[viewport]) return block;
  const overrides = block.responsive[viewport] as Record<string, unknown>;
  const cleanOverrides: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(overrides)) {
    if (v !== undefined && k !== 'hidden') {
      cleanOverrides[k] = v as string | number;
    }
  }
  return {
    ...block,
    props: { ...block.props, ...cleanOverrides },
    styles: { ...block.styles, ...cleanOverrides },
  };
}

function getCascadeDelay(
  cascadeLevel: number,
  index: number,
  siblingCount: number
): number {
  if (cascadeLevel === 0) return 0;
  const baseDelay = 100;
  const perLevel =
    cascadeLevel === 1
      ? index * baseDelay
      : cascadeLevel === 2
        ? Math.floor(index / siblingCount) * baseDelay
        : cascadeLevel === 3
          ? Math.floor(index / (siblingCount * 2)) * baseDelay
          : 0;
  return perLevel;
}

const hoverEffectStyles: Record<string, React.CSSProperties> = {
  scale: { transition: 'transform 0.2s ease' },
  lift: { transition: 'transform 0.2s ease, box-shadow 0.2s ease' },
  glow: { transition: 'box-shadow 0.2s ease' },
  shadow: { transition: 'box-shadow 0.2s ease' },
  underline: {
    textDecoration: 'underline',
    textDecorationColor: 'transparent',
    transition: 'text-decoration-color 0.2s ease',
  },
  blur: { transition: 'filter 0.2s ease' },
  grayscale: { transition: 'filter 0.2s ease' },
};

const hoverEffectActiveStyles: Record<string, React.CSSProperties> = {
  scale: { transform: 'scale(1.05)' },
  lift: {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
  },
  glow: { boxShadow: '0 0 20px rgb(59 130 246 / 0.5)' },
  shadow: { boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' },
  underline: { textDecorationColor: 'currentColor' },
  blur: { filter: 'blur(1px)' },
  grayscale: { filter: 'grayscale(100%)' },
};

function EnterAnimationWrapper({
  animation,
  cascadeIndex,
  siblingCount,
  children,
}: {
  animation: Block['animation'];
  cascadeIndex: number;
  siblingCount: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(animation.type === 'none');

  useEffect(() => {
    if (animation.type === 'none') return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animation.type]);

  const cascadeDelay = getCascadeDelay(
    animation.cascadeLevel,
    cascadeIndex,
    siblingCount
  );
  const totalDelay = animation.delay + cascadeDelay;

  return (
    <div
      ref={ref}
      style={{
        opacity: visible || animation.type === 'none' ? 1 : 0,
        animation:
          visible && animation.type !== 'none'
            ? `${animation.type} ${animation.duration}ms ${animation.easing} ${totalDelay}ms both`
            : undefined,
      }}
    >
      {children}
    </div>
  );
}

function HoverAnimationWrapper({
  hoverEffect,
  children,
}: {
  hoverEffect: string | undefined;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  if (!hoverEffect || hoverEffect === 'none') {
    return <>{children}</>;
  }

  const baseStyle = hoverEffectStyles[hoverEffect] ?? {};
  const activeStyle = hoverEffectActiveStyles[hoverEffect] ?? {};

  return (
    <div
      style={{ ...baseStyle, ...(hovered ? activeStyle : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}

const BlockRendererInner = memo(function BlockRendererInner({
  block,
  viewport,
  cascadeIndex = 0,
  siblingCount = 1,
  onInlineEdit,
}: {
  block: Block;
  viewport: DeviceViewport;
  cascadeIndex?: number;
  siblingCount?: number;
  onInlineEdit?: (blockId: string, text: string) => void;
}) {
  const resolved = resolveBlock(block, viewport);
  const registration = blockRegistry.getBlockType(resolved.blockType);

  if (!registration) {
    return (
      <div className="flex items-center justify-center rounded border-2 border-dashed border-muted-foreground/30 p-8 text-sm text-muted-foreground">
        Unknown block: {resolved.blockType}
      </div>
    );
  }

  const Component = registration.Component;
  const hoverEffect = (resolved.props as Record<string, unknown>)
    .hoverEffect as string | undefined;
  const props = resolved.props as Record<string, unknown>;
  const cssClass = props.cssClass as string | undefined;
  const htmlId = props.htmlId as string | undefined;
  const customCss = props.customCss as string | undefined;
  const hidden = (resolved.responsive[viewport] as Record<string, unknown>)
    ?.hidden as boolean | undefined;

  if (hidden) return null;

  const className = cn('builder-block', cssClass);
  const style = { ...resolved.styles } as React.CSSProperties;

  // Render children recursively for layout blocks
  const childElements = resolved.children?.length
    ? resolved.children.map((child, idx) => (
        <BlockRenderer
          key={child.id}
          block={child}
          viewport={viewport}
          cascadeIndex={cascadeIndex + idx}
          siblingCount={(resolved.children?.length ?? 0) * (siblingCount || 1)}
          onInlineEdit={onInlineEdit}
        />
      ))
    : null;

  return (
    <EnterAnimationWrapper
      animation={resolved.animation}
      cascadeIndex={cascadeIndex}
      siblingCount={siblingCount}
    >
      <HoverAnimationWrapper hoverEffect={hoverEffect}>
        <div
          id={htmlId}
          className={className}
          data-block-id={resolved.id}
          data-block-type={resolved.blockType}
          style={style}
        >
          {customCss && <style>{customCss}</style>}
          <InlineEditor
            block={resolved}
            onSave={(text) => onInlineEdit?.(resolved.id, text)}
          >
            <Component block={resolved}>{childElements}</Component>
          </InlineEditor>
        </div>
      </HoverAnimationWrapper>
    </EnterAnimationWrapper>
  );
});

function BlockRenderer(props: {
  block: Block;
  viewport: DeviceViewport;
  cascadeIndex?: number;
  siblingCount?: number;
  onInlineEdit?: (blockId: string, text: string) => void;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center rounded border-2 border-dashed border-destructive/30 p-4 text-xs text-destructive">
          Failed to render: {props.block.blockType}
        </div>
      }
    >
      <BlockRendererInner {...props} />
    </ErrorBoundary>
  );
}

function ColumnRenderer({
  column,
  viewport,
  columnIndex = 0,
  totalColumns = 1,
  onInlineEdit,
}: {
  column: Column;
  viewport: DeviceViewport;
  columnIndex?: number;
  totalColumns?: number;
  onInlineEdit?: (blockId: string, text: string) => void;
}) {
  const sortedBlocks = [...column.blocks].sort((a, b) =>
    a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0
  );

  return (
    <div
      data-column-id={column.id}
      className="builder-column"
      style={{
        gridColumn: `span ${column.span} / span ${column.span}`,
        ...column.settings,
      }}
    >
      {sortedBlocks.map((block, idx) => (
        <BlockRenderer
          key={block.id}
          block={block}
          viewport={viewport}
          cascadeIndex={columnIndex * sortedBlocks.length + idx}
          siblingCount={totalColumns * sortedBlocks.length}
          onInlineEdit={onInlineEdit}
        />
      ))}
    </div>
  );
}

export const SectionRenderer = memo(function SectionRenderer({
  section,
  viewport,
  onInlineEdit,
}: {
  section: Section;
  viewport: DeviceViewport;
  onInlineEdit?: (blockId: string, text: string) => void;
}) {
  const settings = section.settings as Record<string, unknown>;
  const sortedColumns = [...section.columns].sort((a, b) =>
    a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0
  );

  const bgVideo = settings.backgroundVideoUrl as string | undefined;
  const collapsed = (settings as any).collapsed as boolean | undefined;

  return (
    <section
      data-section-id={section.id}
      data-section-type={section.sectionType}
      className={cn(
        'builder-section relative',
        collapsed && 'min-h-[48px] overflow-hidden'
      )}
      style={{
        backgroundColor: collapsed
          ? 'transparent'
          : (settings.backgroundColor as string),
        paddingTop: collapsed ? 0 : (settings.paddingTop as number),
        paddingBottom: collapsed ? 0 : (settings.paddingBottom as number),
        paddingLeft: collapsed ? 0 : (settings.paddingLeft as number),
        paddingRight: collapsed ? 0 : (settings.paddingRight as number),
      }}
    >
      {bgVideo && !collapsed && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ zIndex: 0 }}
        >
          <source src={bgVideo} type="video/mp4" />
        </video>
      )}
      {collapsed && (
        <div className="flex items-center justify-center h-12 text-xs text-muted-foreground border-b">
          <span>Section collapsed</span>
        </div>
      )}
      {!collapsed && (
        <div
          className={cn(
            'builder-section-inner mx-auto w-full',
            bgVideo && 'relative z-10'
          )}
          style={{ maxWidth: (settings.maxWidth as number) ?? 1200 }}
        >
          <div className="builder-grid grid grid-cols-12 gap-4">
            {sortedColumns.map((column, idx) => (
              <ColumnRenderer
                key={column.id}
                column={column}
                viewport={viewport}
                columnIndex={idx}
                totalColumns={sortedColumns.length}
                onInlineEdit={onInlineEdit}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
});

export const PageRenderer = memo(function PageRenderer({
  page,
  viewport = 'desktop',
}: {
  page: Page;
  viewport?: DeviceViewport;
}) {
  return (
    <article data-page-id={page.id}>
      {page.sections
        .sort((a, b) =>
          a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0
        )
        .map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            viewport={viewport}
          />
        ))}
    </article>
  );
});
