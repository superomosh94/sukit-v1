import { BlockSchema } from '@sukit/shared';

export const imageBlockSchema: BlockSchema = {
  type: 'object',
  properties: {
    src: {
      type: 'image',
      label: 'Image Source',
      required: true,
    },
    alt: {
      type: 'text',
      label: 'Alt Text',
      default: '',
    },
    width: {
      type: 'number',
      label: 'Width',
    },
    height: {
      type: 'number',
      label: 'Height',
    },
    objectFit: {
      type: 'select',
      label: 'Object Fit',
      default: 'cover',
      options: [
        { label: 'Cover', value: 'cover' },
        { label: 'Contain', value: 'contain' },
        { label: 'Fill', value: 'fill' },
        { label: 'None', value: 'none' },
        { label: 'Scale Down', value: 'scale-down' },
      ],
    },
    link: {
      type: 'text',
      label: 'Link URL',
    },
    lazy: {
      type: 'boolean',
      label: 'Lazy Load',
      default: true,
    },
  },
  required: ['src'],
};
