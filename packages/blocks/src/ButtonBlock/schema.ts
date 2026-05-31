import { BlockSchema } from '@sukit/shared';

export const buttonBlockSchema: BlockSchema = {
  type: 'object',
  properties: {
    text: {
      type: 'text',
      label: 'Button Text',
      default: 'Click me',
    },
    url: {
      type: 'text',
      label: 'Link URL',
      default: '#',
    },
    target: {
      type: 'select',
      label: 'Open In',
      default: '_self',
      options: [
        { label: 'Same tab', value: '_self' },
        { label: 'New tab', value: '_blank' },
      ],
    },
    variant: {
      type: 'select',
      label: 'Variant',
      default: 'primary',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Outline', value: 'outline' },
        { label: 'Ghost', value: 'ghost' },
        { label: 'Link', value: 'link' },
      ],
    },
    size: {
      type: 'select',
      label: 'Size',
      default: 'md',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ],
    },
    fullWidth: {
      type: 'boolean',
      label: 'Full Width',
      default: false,
    },
    icon: {
      type: 'text',
      label: 'Icon Name',
    },
  },
  required: [],
};
