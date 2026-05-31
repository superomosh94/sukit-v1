export const TEXT_BLOCK = 'textBlock';
export const IMAGE_BLOCK = 'imageBlock';
export const BUTTON_BLOCK = 'buttonBlock';
export const CONTAINER_BLOCK = 'containerBlock';
export const GRID_BLOCK = 'gridBlock';
export const VIDEO_BLOCK = 'videoBlock';
export const SPACER_BLOCK = 'spacerBlock';
export const DIVIDER_BLOCK = 'dividerBlock';
export const ICON_BLOCK = 'iconBlock';
export const MAP_BLOCK = 'mapBlock';
export const FORM_BLOCK = 'formBlock';
export const ACCORDION_BLOCK = 'accordionBlock';
export const TABS_BLOCK = 'tabsBlock';
export const CAROUSEL_BLOCK = 'carouselBlock';
export const TESTIMONIAL_BLOCK = 'testimonialBlock';
export const PRICING_BLOCK = 'pricingBlock';
export const FAQ_BLOCK = 'faqBlock';
export const HEADING_BLOCK = 'headingBlock';
export const LIST_BLOCK = 'listBlock';
export const CODE_BLOCK = 'codeBlock';
export const CUSTOM_HTML_BLOCK = 'customHtmlBlock';

export const BLOCK_CATEGORIES = {
  content: 'Content',
  media: 'Media',
  layout: 'Layout',
  forms: 'Forms',
  widgets: 'Widgets',
  advanced: 'Advanced',
} as const;

export const DEFAULT_BLOCKS = [
  TEXT_BLOCK,
  IMAGE_BLOCK,
  BUTTON_BLOCK,
  CONTAINER_BLOCK,
  GRID_BLOCK,
  VIDEO_BLOCK,
  SPACER_BLOCK,
  DIVIDER_BLOCK,
  ICON_BLOCK,
  MAP_BLOCK,
  FORM_BLOCK,
  ACCORDION_BLOCK,
  TABS_BLOCK,
  CAROUSEL_BLOCK,
  TESTIMONIAL_BLOCK,
  PRICING_BLOCK,
  FAQ_BLOCK,
] as const;
