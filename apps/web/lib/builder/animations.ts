import type { EnterAnimationType, EnterAnimationConfig, CSSHoverPreset, ShaderHoverPreset } from "./types";

export const ENTER_ANIMATION_PRESETS: Record<EnterAnimationType, {
  keyframes: string;
  css: string;
  duration: number;
  easing: string;
}> = {
  fadeIn: {
    keyframes: '@keyframes builder-fadeIn { from { opacity: 0; } to { opacity: 1; } }',
    css: 'animation: builder-fadeIn var(--anim-duration) var(--anim-easing) var(--anim-delay) both;',
    duration: 400,
    easing: 'ease-out',
  },
  slideUp: {
    keyframes: '@keyframes builder-slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }',
    css: 'animation: builder-slideUp var(--anim-duration) var(--anim-easing) var(--anim-delay) both;',
    duration: 500,
    easing: 'ease-out',
  },
  slideLeft: {
    keyframes: '@keyframes builder-slideLeft { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }',
    css: 'animation: builder-slideLeft var(--anim-duration) var(--anim-easing) var(--anim-delay) both;',
    duration: 500,
    easing: 'ease-out',
  },
  slideRight: {
    keyframes: '@keyframes builder-slideRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }',
    css: 'animation: builder-slideRight var(--anim-duration) var(--anim-easing) var(--anim-delay) both;',
    duration: 500,
    easing: 'ease-out',
  },
  scaleIn: {
    keyframes: '@keyframes builder-scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }',
    css: 'animation: builder-scaleIn var(--anim-duration) var(--anim-easing) var(--anim-delay) both;',
    duration: 400,
    easing: 'ease-out',
  },
  rotateIn: {
    keyframes: '@keyframes builder-rotateIn { from { opacity: 0; transform: rotate(-10deg) scale(0.8); } to { opacity: 1; transform: rotate(0deg) scale(1); } }',
    css: 'animation: builder-rotateIn var(--anim-duration) var(--anim-easing) var(--anim-delay) both;',
    duration: 600,
    easing: 'ease-out',
  },
  flipIn: {
    keyframes: '@keyframes builder-flipIn { from { opacity: 0; transform: perspective(400px) rotateX(-90deg); } to { opacity: 1; transform: perspective(400px) rotateX(0deg); } }',
    css: 'animation: builder-flipIn var(--anim-duration) var(--anim-easing) var(--anim-delay) both;',
    duration: 600,
    easing: 'ease-out',
  },
  typewriter: {
    keyframes: '@keyframes builder-typewriter { from { width: 0; } to { width: 100%; } }',
    css: 'animation: builder-typewriter var(--anim-duration) steps(30) var(--anim-delay) both; overflow: hidden; white-space: nowrap;',
    duration: 1000,
    easing: 'steps(30)',
  },
};

export const CSS_HOVER_PRESETS: Record<CSSHoverPreset, string> = {
  none: '',
  lift: 'transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12);',
  shadow: 'box-shadow: 0 8px 24px rgba(0,0,0,0.12);',
  scale: 'transform: scale(1.05);',
  glow: 'box-shadow: 0 0 20px rgba(var(--color-primary), 0.3);',
  color: 'filter: hue-rotate(30deg);',
  underline: 'text-decoration: underline; text-underline-offset: 4px;',
};

export const SHADER_HOVER_PRESETS: Record<ShaderHoverPreset, string> = {
  none: '',
  ripple: 'ripple',
  'rgb-shift': 'rgb-shift',
  pixelate: 'pixelate',
};

export function resolveCascadeDelay(
  config: EnterAnimationConfig,
  itemIndex: number,
  totalItems: number,
): number {
  const stagger = config.staggerDelay ?? 100;
  switch (config.cascadeLevel) {
    case 'block':
      return config.delay + itemIndex * stagger;
    case 'column':
      return config.delay + itemIndex * stagger * 2;
    case 'section':
      return config.delay + itemIndex * stagger * 3;
    case 'page':
      return config.delay;
    default:
      return config.delay;
  }
}

export function getAllKeyframes(): string {
  return Object.values(ENTER_ANIMATION_PRESETS)
    .map((p) => p.keyframes)
    .join('\n');
}
