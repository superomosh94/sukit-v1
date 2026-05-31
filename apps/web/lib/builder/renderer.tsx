import React, { useRef, useEffect, useState } from "react";
import type { Block, Section, Column, Page, DeviceViewport } from "./types";
import { blockRegistry } from "./block-registry";

export function resolveBlock(
  block: Block,
  viewport: DeviceViewport,
): Block {
  if (viewport === "desktop" || !block.responsive[viewport]) return block;
  const overrides = block.responsive[viewport] as Record<string, unknown>;
  const cleanOverrides: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(overrides)) {
    if (v !== undefined && k !== "hidden") {
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
  siblingCount: number,
): number {
  if (cascadeLevel === 0) return 0;
  const baseDelay = 100;
  const perLevel = cascadeLevel === 1
    ? index * baseDelay
    : cascadeLevel === 2
      ? Math.floor(index / siblingCount) * baseDelay
      : cascadeLevel === 3
        ? Math.floor(index / (siblingCount * 2)) * baseDelay
        : 0;
  return perLevel;
}

const hoverEffectStyles: Record<string, React.CSSProperties> = {
  scale: { transition: "transform 0.2s ease" },
  lift: { transition: "transform 0.2s ease, box-shadow 0.2s ease" },
  glow: { transition: "box-shadow 0.2s ease" },
  shadow: { transition: "box-shadow 0.2s ease" },
  underline: { textDecoration: "underline", textDecorationColor: "transparent", transition: "text-decoration-color 0.2s ease" },
  blur: { transition: "filter 0.2s ease" },
  grayscale: { transition: "filter 0.2s ease" },
};

const hoverEffectActiveStyles: Record<string, React.CSSProperties> = {
  scale: { transform: "scale(1.05)" },
  lift: { transform: "translateY(-4px)", boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)" },
  glow: { boxShadow: "0 0 20px rgb(59 130 246 / 0.5)" },
  shadow: { boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" },
  underline: { textDecorationColor: "currentColor" },
  blur: { filter: "blur(1px)" },
  grayscale: { filter: "grayscale(100%)" },
};

function EnterAnimationWrapper({
  animation,
  cascadeIndex,
  siblingCount,
  children,
}: {
  animation: Block["animation"];
  cascadeIndex: number;
  siblingCount: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(animation.type === "none");

  useEffect(() => {
    if (animation.type === "none") return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animation.type]);

  const cascadeDelay = getCascadeDelay(
    animation.cascadeLevel,
    cascadeIndex,
    siblingCount,
  );
  const totalDelay = animation.delay + cascadeDelay;

  return (
    <div
      ref={ref}
      style={{
        opacity: visible || animation.type === "none" ? 1 : 0,
        animation: visible && animation.type !== "none"
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

  if (!hoverEffect || hoverEffect === "none") {
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

function BlockRenderer({
  block,
  viewport,
  cascadeIndex = 0,
  siblingCount = 1,
}: {
  block: Block;
  viewport: DeviceViewport;
  cascadeIndex?: number;
  siblingCount?: number;
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
  const hoverEffect = (resolved.props as Record<string, unknown>).hoverEffect as string | undefined;

  return (
    <EnterAnimationWrapper
      animation={resolved.animation}
      cascadeIndex={cascadeIndex}
      siblingCount={siblingCount}
    >
      <HoverAnimationWrapper hoverEffect={hoverEffect}>
        <div
          data-block-id={resolved.id}
          data-block-type={resolved.blockType}
          style={resolved.styles}
        >
          <Component block={resolved} />
        </div>
      </HoverAnimationWrapper>
    </EnterAnimationWrapper>
  );
}

function ColumnRenderer({
  column,
  viewport,
  columnIndex = 0,
  totalColumns = 1,
}: {
  column: Column;
  viewport: DeviceViewport;
  columnIndex?: number;
  totalColumns?: number;
}) {
  const sortedBlocks = [...column.blocks].sort(
    (a, b) => (a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0),
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
        />
      ))}
    </div>
  );
}

export function SectionRenderer({
  section,
  viewport,
}: {
  section: Section;
  viewport: DeviceViewport;
}) {
  const settings = section.settings as Record<string, unknown>;
  const sortedColumns = [...section.columns].sort(
    (a, b) => (a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0),
  );

  return (
    <section
      data-section-id={section.id}
      data-section-type={section.sectionType}
      className="builder-section"
      style={{
        backgroundColor: settings.backgroundColor as string,
        paddingTop: settings.paddingTop as number,
        paddingBottom: settings.paddingBottom as number,
        paddingLeft: settings.paddingLeft as number,
        paddingRight: settings.paddingRight as number,
      }}
    >
      <div
        className="builder-section-inner mx-auto w-full"
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
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function PageRenderer({
  page,
  viewport = "desktop",
}: {
  page: Page;
  viewport?: DeviceViewport;
}) {
  return (
    <article data-page-id={page.id}>
      {page.sections
            .sort((a, b) => (a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0))
        .map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            viewport={viewport}
          />
        ))}
    </article>
  );
}
