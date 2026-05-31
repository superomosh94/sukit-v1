import { blockRegistry } from './block-registry';
import type { BlockRegistration, BlockPropSchema } from './types';

import TextBlock from './blocks/TextBlock';
import ImageBlock from './blocks/ImageBlock';
import ButtonBlock from './blocks/ButtonBlock';
import ContainerBlock from './blocks/ContainerBlock';
import GridBlock from './blocks/GridBlock';
import VideoBlock from './blocks/VideoBlock';
import SpacerBlock from './blocks/SpacerBlock';
import DividerBlock from './blocks/DividerBlock';
import IconBlock from './blocks/IconBlock';
import MapBlock from './blocks/MapBlock';
import FormBlock from './blocks/FormBlock';
import AccordionBlock from './blocks/AccordionBlock';
import TabsBlock from './blocks/TabsBlock';
import CarouselBlock from './blocks/CarouselBlock';
import TestimonialBlock from './blocks/TestimonialBlock';
import PricingBlock from './blocks/PricingBlock';
import FAQBlock from './blocks/FAQBlock';
import HeadingBlock from './blocks/HeadingBlock';
import ParagraphBlock from './blocks/ParagraphBlock';
import LinkBlock from './blocks/LinkBlock';
import ListBlock from './blocks/ListBlock';
import QuoteBlock from './blocks/QuoteBlock';
import CodeBlock from './blocks/CodeBlock';
import RowBlock from './blocks/RowBlock';
import ColumnBlock from './blocks/ColumnBlock';
import StackBlock from './blocks/StackBlock';
import SectionBlock from './blocks/SectionBlock';
import MenuBlock from './blocks/MenuBlock';
import BreadcrumbBlock from './blocks/BreadcrumbBlock';
import BackToTopBlock from './blocks/BackToTopBlock';
import CardBlock from './blocks/CardBlock';
import GalleryBlock from './blocks/GalleryBlock';
import AvatarBlock from './blocks/AvatarBlock';
import TableBlock from './blocks/TableBlock';

function s(
  label: string,
  type: BlockPropSchema['type'] = 'string',
  extra: Partial<BlockPropSchema> = {}
): BlockPropSchema {
  return { label, type, ...extra };
}

const registrations: BlockRegistration[] = [
  // ── Layout Blocks ──
  {
    type: 'container',
    label: 'Container',
    description: 'Centered content wrapper with max-width',
    category: 'layout',
    icon: '⊞',
    schema: {
      maxWidth: s('Max Width', 'string', {
        default: '1200px',
        group: 'layout',
      }),
      padding: s('Padding', 'string', { default: '0 24px', group: 'layout' }),
      backgroundColor: s('Background Color', 'color', { group: 'style' }),
    },
    defaultProps: { maxWidth: '1200px', padding: '0 24px' },
    defaultStyles: { backgroundColor: 'transparent' },
    defaultAnimation: {
      type: 'fadeIn',
      duration: 500,
      delay: 0,
      easing: 'ease-out',
      cascadeLevel: 'block',
    },
    Component: ContainerBlock,
  },
  {
    type: 'section',
    label: 'Section',
    description: 'Full-width background section with inner container',
    category: 'layout',
    icon: '▬',
    schema: {
      backgroundColor: s('Background Color', 'color', { group: 'style' }),
      paddingTop: s('Padding Top', 'number', { default: 60, group: 'spacing' }),
      paddingBottom: s('Padding Bottom', 'number', {
        default: 60,
        group: 'spacing',
      }),
      maxWidth: s('Inner Max Width', 'string', {
        default: '1200px',
        group: 'layout',
      }),
    },
    defaultProps: { maxWidth: '1200px', paddingTop: 60, paddingBottom: 60 },
    defaultStyles: { backgroundColor: 'transparent' },
    Component: SectionBlock,
  },
  {
    type: 'row',
    label: 'Row',
    description: 'Horizontal flex wrapper for columns',
    category: 'layout',
    icon: '⇔',
    schema: {
      gap: s('Gap', 'string', { default: '16px', group: 'layout' }),
      alignItems: s('Align Items', 'select', {
        default: 'stretch',
        options: [
          { label: 'Stretch', value: 'stretch' },
          { label: 'Start', value: 'flex-start' },
          { label: 'Center', value: 'center' },
          { label: 'End', value: 'flex-end' },
        ],
        group: 'layout',
      }),
      justifyContent: s('Justify Content', 'select', {
        default: 'flex-start',
        options: [
          { label: 'Start', value: 'flex-start' },
          { label: 'Center', value: 'center' },
          { label: 'End', value: 'flex-end' },
          { label: 'Space Between', value: 'space-between' },
          { label: 'Space Around', value: 'space-around' },
        ],
        group: 'layout',
      }),
    },
    defaultProps: {
      gap: '16px',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
    },
    defaultStyles: {},
    Component: RowBlock,
  },
  {
    type: 'column',
    label: 'Column',
    description: 'Grid column inside a row (1-12 span)',
    category: 'layout',
    icon: '▯',
    schema: {
      span: s('Span', 'number', { default: 4, group: 'layout' }),
      offset: s('Offset', 'number', { default: 0, group: 'layout' }),
    },
    defaultProps: { span: 4, offset: 0 },
    defaultStyles: {},
    Component: ColumnBlock,
  },
  {
    type: 'grid',
    label: 'Grid',
    description: 'CSS Grid layout with custom rows/columns',
    category: 'layout',
    icon: '⊞',
    schema: {
      columns: s('Columns', 'number', { default: 3, group: 'layout' }),
      gap: s('Gap', 'string', { default: '16px', group: 'layout' }),
      minChildWidth: s('Min Child Width', 'string', { group: 'layout' }),
    },
    defaultProps: { columns: 3, gap: '16px' },
    defaultStyles: {},
    Component: GridBlock,
  },
  {
    type: 'stack',
    label: 'Stack',
    description: 'Vertical or horizontal stack with gap',
    category: 'layout',
    icon: '⫶',
    schema: {
      direction: s('Direction', 'select', {
        default: 'vertical',
        options: [
          { label: 'Vertical', value: 'vertical' },
          { label: 'Horizontal', value: 'horizontal' },
        ],
        group: 'layout',
      }),
      gap: s('Gap', 'string', { default: '12px', group: 'layout' }),
      alignItems: s('Align Items', 'select', {
        default: 'stretch',
        options: [
          { label: 'Stretch', value: 'stretch' },
          { label: 'Start', value: 'flex-start' },
          { label: 'Center', value: 'center' },
          { label: 'End', value: 'flex-end' },
        ],
        group: 'layout',
      }),
    },
    defaultProps: { direction: 'vertical', gap: '12px', alignItems: 'stretch' },
    defaultStyles: {},
    Component: StackBlock,
  },
  {
    type: 'divider',
    label: 'Divider',
    description: 'Horizontal rule with style options',
    category: 'layout',
    icon: '―',
    schema: {
      style: s('Line Style', 'select', {
        default: 'solid',
        options: [
          { label: 'Solid', value: 'solid' },
          { label: 'Dashed', value: 'dashed' },
          { label: 'Dotted', value: 'dotted' },
        ],
      }),
      color: s('Color', 'color', { default: '#d1d5db' }),
      thickness: s('Thickness', 'string', { default: '1px' }),
      width: s('Width', 'string', { default: '100%' }),
    },
    defaultProps: {
      style: 'solid',
      color: '#d1d5db',
      thickness: '1px',
      width: '100%',
    },
    defaultStyles: {},
    Component: DividerBlock,
  },
  {
    type: 'spacer',
    label: 'Spacer',
    description: 'Empty space for margins',
    category: 'layout',
    icon: '⏹',
    schema: {
      height: s('Height', 'string', { default: '40px' }),
    },
    defaultProps: { height: '40px' },
    defaultStyles: {},
    Component: SpacerBlock,
  },

  // ── Typography Blocks ──
  {
    type: 'heading',
    label: 'Heading',
    description: 'H1-H6 with style controls',
    category: 'content',
    icon: 'H',
    schema: {
      text: s('Text', 'rich-text', { default: 'Heading Text' }),
      level: s('Level', 'select', {
        default: 'h2',
        options: [
          { label: 'H1', value: 'h1' },
          { label: 'H2', value: 'h2' },
          { label: 'H3', value: 'h3' },
          { label: 'H4', value: 'h4' },
          { label: 'H5', value: 'h5' },
          { label: 'H6', value: 'h6' },
        ],
      }),
      textAlign: s('Align', 'select', {
        default: 'left',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
      }),
    },
    defaultProps: { text: 'Heading Text', level: 'h2', textAlign: 'left' },
    defaultStyles: { color: '#111827' },
    Component: HeadingBlock,
  },
  {
    type: 'paragraph',
    label: 'Paragraph',
    description: 'Text block with line height and spacing',
    category: 'content',
    icon: '¶',
    schema: {
      text: s('Text', 'rich-text', {
        default: 'Add some descriptive text here.',
      }),
      textAlign: s('Align', 'select', {
        default: 'left',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
          { label: 'Justify', value: 'justify' },
        ],
      }),
      dropCap: s('Drop Cap', 'boolean', { default: false }),
    },
    defaultProps: {
      text: 'Add some descriptive text here.',
      textAlign: 'left',
      dropCap: false,
    },
    defaultStyles: { color: '#374151', fontSize: 16, lineHeight: 1.7 },
    Component: ParagraphBlock,
  },
  {
    type: 'text',
    label: 'Text',
    description: 'Rich text block with formatting',
    category: 'content',
    icon: 'T',
    schema: {
      text: s('Text', 'rich-text', { default: 'Add some text here' }),
      html: s('Render as HTML', 'boolean', { default: true }),
    },
    defaultProps: { text: 'Add some text here', html: true },
    defaultStyles: { fontSize: 16, color: '#374151', lineHeight: 1.6 },
    Component: TextBlock,
  },
  {
    type: 'link',
    label: 'Link',
    description: 'Hyperlink with open in new tab option',
    category: 'content',
    icon: '🔗',
    schema: {
      text: s('Text', 'string', { default: 'Click here' }),
      url: s('URL', 'string', { placeholder: 'https://...' }),
      newTab: s('Open in New Tab', 'boolean', { default: true }),
    },
    defaultProps: { text: 'Click here', url: '', newTab: true },
    defaultStyles: { color: '#3b82f6' },
    Component: LinkBlock,
  },
  {
    type: 'list',
    label: 'List',
    description: 'Bullet or numbered list with nesting',
    category: 'content',
    icon: '≡',
    schema: {
      type: s('List Type', 'select', {
        default: 'bullet',
        options: [
          { label: 'Bullet', value: 'bullet' },
          { label: 'Numbered', value: 'numbered' },
        ],
      }),
      items: s('Items', 'array', { default: ['Item 1', 'Item 2', 'Item 3'] }),
    },
    defaultProps: { type: 'bullet', items: ['Item 1', 'Item 2', 'Item 3'] },
    defaultStyles: { color: '#374151', fontSize: 16 },
    Component: ListBlock,
  },
  {
    type: 'quote',
    label: 'Quote',
    description: 'Blockquote with citation author',
    category: 'content',
    icon: '❝',
    schema: {
      text: s('Quote Text', 'rich-text', {
        default: 'The best way to predict the future is to create it.',
      }),
      author: s('Author', 'string', { default: 'Peter Drucker' }),
    },
    defaultProps: {
      text: 'The best way to predict the future is to create it.',
      author: 'Peter Drucker',
    },
    defaultStyles: { color: '#374151', borderColor: '#3b82f6' },
    Component: QuoteBlock,
  },
  {
    type: 'code',
    label: 'Code Block',
    description: 'Syntax-highlighted code with language selector',
    category: 'content',
    icon: '</>',
    schema: {
      code: s('Code', 'code', { default: "console.log('hello world');" }),
      language: s('Language', 'select', {
        default: 'javascript',
        options: [
          { label: 'JavaScript', value: 'javascript' },
          { label: 'TypeScript', value: 'typescript' },
          { label: 'HTML', value: 'html' },
          { label: 'CSS', value: 'css' },
          { label: 'Python', value: 'python' },
          { label: 'JSON', value: 'json' },
          { label: 'Shell', value: 'bash' },
        ],
      }),
    },
    defaultProps: {
      code: "console.log('hello world');",
      language: 'javascript',
    },
    defaultStyles: {
      backgroundColor: '#1e293b',
      color: '#e2e8f0',
      borderRadius: 8,
    },
    Component: CodeBlock,
  },

  // ── Media Blocks ──
  {
    type: 'image',
    label: 'Image',
    description: 'Single image with alt text and caption',
    category: 'media',
    icon: '🖼',
    schema: {
      src: s('Image URL', 'image'),
      alt: s('Alt Text', 'string'),
      caption: s('Caption', 'string'),
    },
    defaultProps: {},
    defaultStyles: { objectFit: 'cover', borderRadius: 0, maxWidth: '100%' },
    Component: ImageBlock,
  },
  {
    type: 'gallery',
    label: 'Gallery',
    description: 'Responsive image grid with lightbox',
    category: 'media',
    icon: '▤',
    schema: {
      images: s('Images', 'array', { default: [] }),
      columns: s('Columns', 'number', { default: 3 }),
      gap: s('Gap', 'string', { default: '8px' }),
    },
    defaultProps: { images: [], columns: 3, gap: '8px' },
    defaultStyles: {},
    Component: GalleryBlock,
  },
  {
    type: 'video',
    label: 'Video',
    description: 'YouTube, Vimeo, or self-hosted MP4',
    category: 'media',
    icon: '▶',
    schema: {
      src: s('Video URL', 'string', { placeholder: 'https://...' }),
      type: s('Source Type', 'select', {
        default: 'mp4',
        options: [
          { label: 'MP4', value: 'mp4' },
          { label: 'YouTube', value: 'youtube' },
          { label: 'Vimeo', value: 'vimeo' },
        ],
      }),
      autoplay: s('Autoplay', 'boolean', { default: false }),
      controls: s('Show Controls', 'boolean', { default: true }),
      loop: s('Loop', 'boolean', { default: false }),
      muted: s('Muted', 'boolean', { default: false }),
    },
    defaultProps: { type: 'mp4', controls: true },
    defaultStyles: {},
    Component: VideoBlock,
  },
  {
    type: 'icon',
    label: 'Icon',
    description: 'SVG icons from Lucide',
    category: 'media',
    icon: '✦',
    schema: {
      iconName: s('Icon Name', 'string', { default: 'Star' }),
      size: s('Size', 'number', { default: 24 }),
      color: s('Color', 'color', { default: 'currentColor' }),
      strokeWidth: s('Stroke Width', 'number', { default: 2 }),
    },
    defaultProps: {
      iconName: 'Star',
      size: 24,
      color: 'currentColor',
      strokeWidth: 2,
    },
    defaultStyles: {},
    Component: IconBlock,
  },
  {
    type: 'avatar',
    label: 'Avatar',
    description: 'User profile image with fallback',
    category: 'media',
    icon: '👤',
    schema: {
      src: s('Image URL', 'image'),
      alt: s('Alt Text', 'string', { default: 'Avatar' }),
      size: s('Size', 'number', { default: 48 }),
    },
    defaultProps: { size: 48, alt: 'Avatar' },
    defaultStyles: { borderRadius: '50%' },
    Component: AvatarBlock,
  },
  {
    type: 'map',
    label: 'Map',
    description: 'OpenStreetMap embed',
    category: 'media',
    icon: '🗺',
    schema: {
      address: s('Address', 'string', {
        default: '1600 Amphitheatre Parkway, Mountain View, CA',
      }),
      zoom: s('Zoom Level', 'number', { default: 14 }),
      height: s('Height', 'string', { default: '400px' }),
    },
    defaultProps: {
      address: '1600 Amphitheatre Parkway, Mountain View, CA',
      zoom: 14,
      height: '400px',
    },
    defaultStyles: {},
    Component: MapBlock,
  },

  // ── Data Blocks ──
  {
    type: 'accordion',
    label: 'Accordion',
    description: 'Collapsible sections',
    category: 'content',
    icon: '≡',
    schema: {
      items: s('Items', 'array', {
        default: [{ title: 'Section 1', content: 'Content here...' }],
      }),
      allowMultiple: s('Allow Multiple Open', 'boolean', { default: false }),
    },
    defaultProps: {
      items: [{ title: 'Section 1', content: 'Content here...' }],
      allowMultiple: false,
    },
    defaultStyles: {},
    Component: AccordionBlock,
  },
  {
    type: 'tabs',
    label: 'Tabs',
    description: 'Tabbed content panels',
    category: 'content',
    icon: '▦',
    schema: {
      tabs: s('Tabs', 'array', {
        default: [
          { label: 'Tab 1', content: 'Content 1' },
          { label: 'Tab 2', content: 'Content 2' },
        ],
      }),
      defaultTab: s('Default Tab', 'number', { default: 0 }),
    },
    defaultProps: {
      tabs: [
        { label: 'Tab 1', content: 'Content 1' },
        { label: 'Tab 2', content: 'Content 2' },
      ],
      defaultTab: 0,
    },
    defaultStyles: {},
    Component: TabsBlock,
  },
  {
    type: 'carousel',
    label: 'Carousel',
    description: 'Image/text slider with autoplay',
    category: 'content',
    icon: '❮❯',
    schema: {
      images: s('Images', 'array', { default: [] }),
      autoPlay: s('Auto Play', 'boolean', { default: false }),
      interval: s('Interval (ms)', 'number', { default: 5000 }),
      showDots: s('Show Dots', 'boolean', { default: true }),
      showArrows: s('Show Arrows', 'boolean', { default: true }),
    },
    defaultProps: {
      images: [],
      interval: 5000,
      showDots: true,
      showArrows: true,
    },
    defaultStyles: {},
    Component: CarouselBlock,
  },
  {
    type: 'card',
    label: 'Card',
    description: 'Content card with image, title, description',
    category: 'content',
    icon: '▢',
    schema: {
      image: s('Image URL', 'image'),
      title: s('Title', 'string', { default: 'Card Title' }),
      description: s('Description', 'rich-text', {
        default: 'Card description goes here.',
      }),
      link: s('Link URL', 'string'),
    },
    defaultProps: {
      title: 'Card Title',
      description: 'Card description goes here.',
    },
    defaultStyles: { borderRadius: 8 },
    Component: CardBlock,
  },
  {
    type: 'table',
    label: 'Table',
    description: 'Data table with headers and rows',
    category: 'content',
    icon: '⊞',
    schema: {
      headers: s('Headers', 'array', {
        default: ['Column 1', 'Column 2', 'Column 3'],
      }),
      rows: s('Rows', 'array', {
        default: [
          ['Row 1', 'Data', 'Data'],
          ['Row 2', 'Data', 'Data'],
        ],
      }),
    },
    defaultProps: {
      headers: ['Column 1', 'Column 2', 'Column 3'],
      rows: [
        ['Row 1', 'Data', 'Data'],
        ['Row 2', 'Data', 'Data'],
      ],
    },
    defaultStyles: {},
    Component: TableBlock,
  },

  // ── Navigation Blocks ──
  {
    type: 'menu',
    label: 'Menu',
    description: 'Responsive navbar with links',
    category: 'content',
    icon: '☰',
    schema: {
      items: s('Menu Items', 'array', {
        default: [
          { label: 'Home', url: '/' },
          { label: 'About', url: '/about' },
          { label: 'Contact', url: '/contact' },
        ],
      }),
      alignment: s('Alignment', 'select', {
        default: 'left',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
      }),
    },
    defaultProps: {
      items: [
        { label: 'Home', url: '/' },
        { label: 'About', url: '/about' },
        { label: 'Contact', url: '/contact' },
      ],
      alignment: 'left',
    },
    defaultStyles: {},
    Component: MenuBlock,
  },
  {
    type: 'breadcrumb',
    label: 'Breadcrumb',
    description: 'Page hierarchy navigation',
    category: 'content',
    icon: '›',
    schema: {
      items: s('Items', 'array', {
        default: [
          { label: 'Home', url: '/' },
          { label: 'Current Page', url: '' },
        ],
      }),
      separator: s('Separator', 'string', { default: '/' }),
    },
    defaultProps: {
      items: [
        { label: 'Home', url: '/' },
        { label: 'Current Page', url: '' },
      ],
      separator: '/',
    },
    defaultStyles: { fontSize: 14 },
    Component: BreadcrumbBlock,
  },
  {
    type: 'backToTop',
    label: 'Back to Top',
    description: 'Scroll-up button after threshold',
    category: 'content',
    icon: '↑',
    schema: {
      threshold: s('Scroll Threshold (px)', 'number', { default: 300 }),
      icon: s('Icon Name', 'string', { default: 'ArrowUp' }),
      position: s('Position', 'select', {
        default: 'bottom-right',
        options: [
          { label: 'Bottom Right', value: 'bottom-right' },
          { label: 'Bottom Left', value: 'bottom-left' },
        ],
      }),
    },
    defaultProps: { threshold: 300, icon: 'ArrowUp', position: 'bottom-right' },
    defaultStyles: {},
    Component: BackToTopBlock,
  },

  // ── Interactive Blocks ──
  {
    type: 'form',
    label: 'Form',
    description: 'Form with fields and submission handling',
    category: 'forms',
    icon: '☐',
    schema: {
      fields: s('Fields', 'array', {
        default: [
          { type: 'text', label: 'Name', required: true },
          { type: 'email', label: 'Email', required: true },
          { type: 'textarea', label: 'Message' },
        ],
      }),
      submitText: s('Submit Button Text', 'string', { default: 'Submit' }),
    },
    defaultProps: {
      fields: [
        { type: 'text', label: 'Name', required: true },
        { type: 'email', label: 'Email', required: true },
        { type: 'textarea', label: 'Message' },
      ],
      submitText: 'Submit',
    },
    defaultStyles: {},
    Component: FormBlock,
  },
  {
    type: 'button',
    label: 'Button',
    description: 'Clickable button with variants',
    category: 'forms',
    icon: '▣',
    schema: {
      text: s('Button Text', 'string', { default: 'Button' }),
      url: s('Link URL', 'string'),
      variant: s('Variant', 'select', {
        default: 'primary',
        options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
          { label: 'Outline', value: 'outline' },
          { label: 'Ghost', value: 'ghost' },
        ],
      }),
      size: s('Size', 'select', {
        default: 'md',
        options: [
          { label: 'Small', value: 'sm' },
          { label: 'Medium', value: 'md' },
          { label: 'Large', value: 'lg' },
        ],
      }),
    },
    defaultProps: { text: 'Button', variant: 'primary', size: 'md' },
    defaultStyles: { borderRadius: 6 },
    defaultAnimation: {
      type: 'fadeIn',
      duration: 300,
      delay: 0,
      easing: 'ease-out',
      cascadeLevel: 'block',
    },
    Component: ButtonBlock,
  },

  // ── Existing Blocks (Testimonial, Pricing, FAQ) ──
  {
    type: 'testimonial',
    label: 'Testimonial',
    description: 'Customer review with quote and author',
    category: 'content',
    icon: '💬',
    schema: {
      quote: s('Quote', 'rich-text', { default: 'Great product!' }),
      author: s('Author', 'string', { default: 'Jane Doe' }),
      role: s('Role', 'string', { default: 'CEO, Company' }),
      avatar: s('Avatar URL', 'image'),
    },
    defaultProps: {
      quote: 'Great product!',
      author: 'Jane Doe',
      role: 'CEO, Company',
    },
    defaultStyles: { backgroundColor: '#f9fafb', borderRadius: 12 },
    Component: TestimonialBlock,
  },
  {
    type: 'pricing',
    label: 'Pricing Card',
    description: 'Pricing plan with features',
    category: 'content',
    icon: '💰',
    schema: {
      plan: s('Plan Name', 'string', { default: 'Professional' }),
      price: s('Price', 'string', { default: '$29' }),
      period: s('Period', 'string', { default: '/month' }),
      features: s('Features', 'array', {
        default: ['Feature 1', 'Feature 2', 'Feature 3'],
      }),
      ctaText: s('CTA Text', 'string', { default: 'Get Started' }),
      highlighted: s('Highlighted', 'boolean', { default: false }),
    },
    defaultProps: {
      plan: 'Professional',
      price: '$29',
      period: '/month',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      ctaText: 'Get Started',
      highlighted: false,
    },
    defaultStyles: { borderRadius: 12 },
    Component: PricingBlock,
  },
  {
    type: 'faq',
    label: 'FAQ',
    description: 'Frequently asked questions accordion',
    category: 'content',
    icon: '?',
    schema: {
      items: s('Questions', 'array', {
        default: [{ question: 'What is this?', answer: 'This is a FAQ item.' }],
      }),
    },
    defaultProps: {
      items: [{ question: 'What is this?', answer: 'This is a FAQ item.' }],
    },
    defaultStyles: {},
    Component: FAQBlock,
  },
];

export function registerAllBlocks() {
  for (const reg of registrations) {
    blockRegistry.registerBlockType(reg);
  }
}
