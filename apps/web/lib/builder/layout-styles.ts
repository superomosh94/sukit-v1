import type React from "react";

export function getSectionLayoutStyles(settings: Record<string, unknown>): React.CSSProperties {
  return {
    backgroundColor: (settings.backgroundColor as string) ?? "transparent",
    paddingTop: (settings.paddingTop as number) ?? 0,
    paddingBottom: (settings.paddingBottom as number) ?? 0,
    paddingLeft: (settings.paddingLeft as number) ?? 0,
    paddingRight: (settings.paddingRight as number) ?? 0,
    backgroundImage: (settings.backgroundImage as string) ?? undefined,
    backgroundSize: (settings.backgroundSize as string) ?? undefined,
    backgroundPosition: (settings.backgroundPosition as string) ?? undefined,
    backgroundAttachment: (settings.backgroundAttachment as string) ?? undefined,
  };
}

export function getColumnLayoutStyles(settings: Record<string, unknown>): React.CSSProperties {
  return {
    backgroundColor: (settings.backgroundColor as string) ?? undefined,
    paddingTop: (settings.paddingTop as number) ?? undefined,
    paddingBottom: (settings.paddingBottom as number) ?? undefined,
    paddingLeft: (settings.paddingLeft as number) ?? undefined,
    paddingRight: (settings.paddingRight as number) ?? undefined,
    justifyContent: (settings.justifyContent as string) ?? undefined,
    alignItems: (settings.alignItems as string) ?? undefined,
    gap: (settings.gap as number) ?? undefined,
  };
}

export function getBlockLayoutStyles(styles: Record<string, unknown>): React.CSSProperties {
  const result: React.CSSProperties = {};

  const stringKeys: Record<string, string> = {
    color: "color",
    backgroundColor: "backgroundColor",
    backgroundImage: "backgroundImage",
    backgroundSize: "backgroundSize",
    backgroundPosition: "backgroundPosition",
    fontFamily: "fontFamily",
    textAlign: "textAlign",
    textDecoration: "textDecoration",
    textTransform: "textTransform",
    borderStyle: "borderStyle",
    borderColor: "borderColor",
    boxShadow: "boxShadow",
    display: "display",
    position: "position",
    overflow: "overflow",
    cursor: "cursor",
    whiteSpace: "whiteSpace",
    wordBreak: "wordBreak",
    verticalAlign: "verticalAlign",
  };

  const numKeys: Record<string, string> = {
    fontSize: "fontSize",
    fontWeight: "fontWeight",
    lineHeight: "lineHeight",
    letterSpacing: "letterSpacing",
    paddingTop: "paddingTop",
    paddingRight: "paddingRight",
    paddingBottom: "paddingBottom",
    paddingLeft: "paddingLeft",
    marginTop: "marginTop",
    marginRight: "marginRight",
    marginBottom: "marginBottom",
    marginLeft: "marginLeft",
    borderWidth: "borderWidth",
    borderRadius: "borderRadius",
    opacity: "opacity",
    width: "width",
    height: "height",
    minWidth: "minWidth",
    minHeight: "minHeight",
    maxWidth: "maxWidth",
    maxHeight: "maxHeight",
    zIndex: "zIndex",
    flexGrow: "flexGrow",
    flexShrink: "flexShrink",
    flexBasis: "flexBasis",
    gap: "gap",
    rowGap: "rowGap",
    columnGap: "columnGap",
    top: "top",
    right: "right",
    bottom: "bottom",
    left: "left",
    aspectRatio: "aspectRatio",
  };

  for (const [key, cssKey] of Object.entries(stringKeys)) {
    const val = styles[key];
    if (val !== undefined && val !== "") {
      (result as Record<string, unknown>)[cssKey] = val;
    }
  }

  for (const [key, cssKey] of Object.entries(numKeys)) {
    const val = styles[key];
    if (val !== undefined && val !== "") {
      (result as Record<string, unknown>)[cssKey] = val;
    }
  }

  return result;
}

export function getResponsiveStyles(
  responsive: Record<string, Record<string, unknown>>,
  viewport: string,
): React.CSSProperties {
  const overrides = responsive[viewport];
  if (!overrides) return {};
  return getBlockLayoutStyles(overrides as Record<string, unknown>);
}
