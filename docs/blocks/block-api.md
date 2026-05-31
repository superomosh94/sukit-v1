# Block API Reference

## Reserved Prop Names

The following prop names are reserved and should not be used for custom block data:

| Prop | Type | Description |
|------|------|-------------|
| `children` | `string[]` | IDs of child blocks (for container blocks) |
| `tag` | `string` | HTML tag override (e.g., `h1`, `section`, `article`) |
| `href` | `string` | Link URL for clickable blocks |
| `target` | `string` | Link target (`_self`, `_blank`) |
| `id` | `string` | HTML id attribute |
| `className` | `string` | Additional CSS classes |
| `ariaLabel` | `string` | Accessibility label |

## Style Properties Supported

All standard CSS properties are supported via inline styles. Key categories:

### Layout
`display`, `position`, `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight`, `overflow`, `zIndex`

### Flexbox
`flexDirection`, `flexWrap`, `justifyContent`, `alignItems`, `alignContent`, `flex`, `flexGrow`, `flexShrink`, `gap`

### Grid
`gridTemplateColumns`, `gridTemplateRows`, `gridColumn`, `gridRow`, `gridGap`

### Spacing
`margin`, `marginTop`, `marginRight`, `marginBottom`, `marginLeft`, `padding`, `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`

### Typography
`fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `textAlign`, `letterSpacing`, `textTransform`, `textDecoration`, `wordBreak`

### Visual
`color`, `backgroundColor`, `backgroundImage`, `backgroundSize`, `backgroundPosition`, `backgroundRepeat`, `border`, `borderRadius`, `boxShadow`, `opacity`

### Transform
`transform`, `transition`, `rotate`, `scale`, `translateX`, `translateY`

## Responsive Override Keys

Each style property can be overridden per viewport:

```typescript
interface ResponsiveOverrides {
  mobile?: { styles: Record<string, string> };
  tablet?: { styles: Record<string, string> };
  desktop?: { styles: Record<string, string> };
}
```

Resolution breakpoints:

| Viewport | Width | Target |
|----------|-------|--------|
| `desktop` | ≥ 1024px | Default styles |
| `tablet` | 768px – 1023px | Override styles |
| `mobile` | < 768px | Override styles |

## Animation System

```typescript
interface AnimationConfig {
  type: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' |
        'scaleIn' | 'rotateIn' | 'typewriter';
  duration?: number;  // ms, default: 500
  delay?: number;     // ms, default: 0
  easing?: string;    // CSS easing, default: 'ease-out'
  cascade?: boolean;  // stagger children animations
  cascadeDelay?: number; // ms between each child
}
```

## Hover Effects

```typescript
interface HoverEffect {
  type: 'scale' | 'lift' | 'glow' | 'underline' | 'colorShift' |
        'borderGlow' | 'shadow' | 'ripple' | 'rgbShift' | 'pixelate';
  scale?: number;
  color?: string;
  duration?: number;
}
```

## Custom CSS

Blocks can include custom CSS via the `customCSS` setting in site/block settings. This is injected into the page head during export and rendered as a `<style>` tag in the preview.
