export const ENTER_ANIMATIONS = [
  'fadeIn',
  'slideUp',
  'slideDown',
  'slideLeft',
  'slideRight',
  'scaleIn',
  'rotateIn',
  'typewriter',
] as const;

export const HOVER_EFFECTS = [
  'scale',
  'lift',
  'glow',
  'color',
  'border',
  'shadow',
  'ripple',
  'rgbShift',
  'pixelate',
] as const;

export const ANIMATION_EASINGS = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

export const ANIMATION_CASCADE_LEVELS = ['block', 'column', 'section', 'page'] as const;

export const DEFAULT_ANIMATION_DURATION = 500;
export const DEFAULT_ANIMATION_DELAY = 100;
