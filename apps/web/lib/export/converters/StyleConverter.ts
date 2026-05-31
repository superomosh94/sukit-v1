export interface SpacingConfig {
  paddingTop?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;
  paddingRight?: number | string;
  marginTop?: number | string;
  marginBottom?: number | string;
  gap?: number | string;
}

export interface TypographyConfig {
  fontFamily?: string;
  fontSize?: number | string;
  fontWeight?: number | string;
  lineHeight?: number | string;
  letterSpacing?: number | string;
  textAlign?: string;
}

export interface ColorConfig {
  text?: string;
  background?: string;
  border?: string;
  primary?: string;
  secondary?: string;
}

export interface ResponsiveStyleMap {
  base?: Record<string, string>;
  sm?: Record<string, string>;
  md?: Record<string, string>;
  lg?: Record<string, string>;
  xl?: Record<string, string>;
}

export class StyleConverter {
  convertSpacingToTailwind(spacing: SpacingConfig): string[] {
    const classes: string[] = [];
    const pt = spacing.paddingTop;
    const pb = spacing.paddingBottom;
    const pl = spacing.paddingLeft;
    const pr = spacing.paddingRight;
    const mt = spacing.marginTop;
    const mb = spacing.marginBottom;

    if (pt !== undefined) classes.push(`pt-${this.pxToTw(pt)}`);
    if (pb !== undefined) classes.push(`pb-${this.pxToTw(pb)}`);
    if (pl !== undefined) classes.push(`pl-${this.pxToTw(pl)}`);
    if (pr !== undefined) classes.push(`pr-${this.pxToTw(pr)}`);
    if (mt !== undefined) classes.push(`mt-${this.pxToTw(mt)}`);
    if (mb !== undefined) classes.push(`mb-${this.pxToTw(mb)}`);

    if (
      pt !== undefined &&
      pb !== undefined &&
      pl === undefined &&
      pr === undefined
    ) {
      const idx = classes.indexOf(`pt-${this.pxToTw(pt)}`);
      if (idx >= 0) classes[idx] = `py-${this.pxToTw(pt)}`;
      const idx2 = classes.indexOf(`pb-${this.pxToTw(pb)}`);
      if (idx2 >= 0) classes.splice(idx2, 1);
    }

    return classes;
  }

  convertTypographyToTailwind(typography: TypographyConfig): string[] {
    const classes: string[] = [];

    if (typography.fontSize) {
      const size = this.fontSizeToTw(typography.fontSize);
      if (size) classes.push(size);
    }
    if (typography.fontWeight) {
      const weight = this.fontWeightToTw(typography.fontWeight);
      if (weight) classes.push(weight);
    }
    if (typography.textAlign) classes.push(`text-${typography.textAlign}`);
    if (typography.fontFamily)
      classes.push(`font-${this.fontFamilyToTw(typography.fontFamily)}`);

    return classes;
  }

  convertColorsToTailwind(colors: ColorConfig): Record<string, string> {
    const result: Record<string, string> = {};
    if (colors.text) result['color'] = this.colorToHex(colors.text);
    if (colors.background)
      result['backgroundColor'] = this.colorToHex(colors.background);
    if (colors.border) result['borderColor'] = this.colorToHex(colors.border);
    return result;
  }

  convertResponsiveStyles(styles: ResponsiveStyleMap): string {
    const parts: string[] = [];
    if (styles.base) parts.push(this.styleObjectToString(styles.base, ''));
    if (styles.sm) parts.push(this.styleObjectToString(styles.sm, 'sm:'));
    if (styles.md) parts.push(this.styleObjectToString(styles.md, 'md:'));
    if (styles.lg) parts.push(this.styleObjectToString(styles.lg, 'lg:'));
    if (styles.xl) parts.push(this.styleObjectToString(styles.xl, 'xl:'));
    return parts.join(' ');
  }

  generateCustomCSS(customStyles: Record<string, unknown>): string {
    return Object.entries(customStyles)
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `  ${cssKey}: ${value};`;
      })
      .join('\n');
  }

  toInlineStyle(styles: Record<string, unknown>): string {
    const s = styles as Record<string, string>;
    const map: Record<string, string> = {
      backgroundColor: 'background-color',
      borderRadius: 'border-radius',
      fontSize: 'font-size',
      fontWeight: 'font-weight',
      lineHeight: 'line-height',
      letterSpacing: 'letter-spacing',
      textAlign: 'text-align',
      maxWidth: 'max-width',
    };

    return Object.entries(s)
      .map(([key, value]) => {
        const cssKey = map[key] || key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value}`;
      })
      .join('; ');
  }

  private pxToTw(value: number | string): number {
    const num = typeof value === 'string' ? parseInt(value) : value;
    return Math.round((num || 0) / 4);
  }

  private fontSizeToTw(size: number | string): string | null {
    const num = typeof size === 'string' ? parseInt(size) : size;
    const sizes: Record<number, string> = {
      12: 'text-xs',
      14: 'text-sm',
      16: 'text-base',
      18: 'text-lg',
      20: 'text-xl',
      24: 'text-2xl',
      30: 'text-3xl',
      36: 'text-4xl',
      48: 'text-5xl',
      60: 'text-6xl',
    };
    return sizes[num] || (num >= 12 ? `text-[${num}px]` : null);
  }

  private fontWeightToTw(weight: number | string): string | null {
    const w = typeof weight === 'string' ? parseInt(weight) : weight;
    const weights: Record<number, string> = {
      100: 'font-thin',
      200: 'font-extralight',
      300: 'font-light',
      400: 'font-normal',
      500: 'font-medium',
      600: 'font-semibold',
      700: 'font-bold',
      800: 'font-extrabold',
      900: 'font-black',
    };
    return weights[w] || null;
  }

  private fontFamilyToTw(family: string): string {
    const lower = family.toLowerCase();
    if (lower.includes('mono')) return 'mono';
    if (lower.includes('serif')) return 'serif';
    if (
      lower.includes('sans') ||
      lower.includes('inter') ||
      lower.includes('system')
    )
      return 'sans';
    return 'sans';
  }

  private colorToHex(color: string): string {
    if (color.startsWith('#')) return color;
    if (color.startsWith('rgb') || color.startsWith('hsl')) return color;
    if (color.startsWith('var(')) return '#000';
    return color;
  }

  private styleObjectToString(
    styles: Record<string, string>,
    prefix: string
  ): string {
    return Object.entries(styles)
      .map(([key, value]) => {
        const twKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${prefix}${twKey}-${value}`;
      })
      .join(' ');
  }
}

export const styleConverter = new StyleConverter();
