import { BlockSchema } from '@sukit/shared';

export const textBlockSchema: BlockSchema = {
  type: 'object',
  properties: {
    content: {
      type: 'richText',
      label: 'Content',
      default: '<p>Start typing...</p>',
    },
    tag: {
      type: 'select',
      label: 'HTML Tag',
      default: 'p',
      options: [
        { label: 'Paragraph', value: 'p' },
        { label: 'Heading 1', value: 'h1' },
        { label: 'Heading 2', value: 'h2' },
        { label: 'Heading 3', value: 'h3' },
        { label: 'Heading 4', value: 'h4' },
        { label: 'Heading 5', value: 'h5' },
        { label: 'Heading 6', value: 'h6' },
        { label: 'Span', value: 'span' },
        { label: 'Div', value: 'div' },
      ],
    },
    link: {
      type: 'text',
      label: 'Link URL',
    },
  },
  required: [],
};
