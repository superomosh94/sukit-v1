import type { Section } from './types';

interface SectionPreset {
  type: string;
  label: string;
  description: string;
  icon: string;
  build: () => Omit<Section, 'id' | 'sortKey' | 'pageId'>;
}

function createBlock(
  blockType: string,
  props: Record<string, unknown> = {},
  styles: Record<string, string | number> = {}
) {
  return {
    id: crypto.randomUUID(),
    blockType,
    sortKey: '',
    props,
    styles,
    responsive: {},
    animation: {
      type: 'none' as const,
      duration: 300,
      delay: 0,
      easing: 'ease-out',
      cascadeLevel: 0,
    },
  };
}

function createColumn(span: number, blocks: ReturnType<typeof createBlock>[]) {
  return {
    id: crypto.randomUUID(),
    sectionId: '',
    gridRow: 1,
    gridCol: 1,
    span,
    sortKey: '',
    settings: {},
    blocks,
  };
}

const SECTION_PRESETS: SectionPreset[] = [
  {
    type: 'hero',
    label: 'Hero Section',
    description: 'Full-width hero with headline, subtitle, and CTA buttons',
    icon: 'Monitor',
    build: () => ({
      sectionType: 'hero',
      settings: {
        backgroundColor: '#0f172a',
        paddingTop: 100,
        paddingBottom: 100,
        paddingLeft: 24,
        paddingRight: 24,
        maxWidth: 1200,
        minHeight: 500,
        textAlign: 'center',
        backgroundSize: 'cover',
      },
      responsive: {},
      columns: [
        createColumn(12, [
          createBlock(
            'heading',
            { text: 'Build Something Amazing', level: 1 },
            {
              fontSize: '48px',
              fontWeight: '700',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: 16,
            }
          ),
          createBlock(
            'paragraph',
            {
              text: 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore.',
            },
            {
              fontSize: '18px',
              color: '#94a3b8',
              textAlign: 'center',
              marginBottom: 32,
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }
          ),
          createBlock(
            'button',
            { text: 'Get Started', url: '#', variant: 'primary', size: 'lg' },
            {}
          ),
        ]),
      ],
    }),
  },
  {
    type: 'features',
    label: 'Features Grid',
    description:
      'Three-column feature grid with icons, headings and descriptions',
    icon: 'LayoutGrid',
    build: () => ({
      sectionType: 'features',
      settings: {
        backgroundColor: '#ffffff',
        paddingTop: 80,
        paddingBottom: 80,
        paddingLeft: 24,
        paddingRight: 24,
        maxWidth: 1200,
      },
      responsive: {},
      columns: [
        createColumn(12, [
          createBlock(
            'heading',
            { text: 'Features', level: 2 },
            {
              fontSize: '36px',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: 48,
            }
          ),
        ]),
      ].concat(
        ['Fast', 'Reliable', 'Scalable'].map((title, i) =>
          createColumn(4, [
            createBlock(
              'icon',
              { name: ['zap', 'shield', 'trending-up'][i] },
              { fontSize: '32px', marginBottom: 12 }
            ),
            createBlock(
              'heading',
              { text: title, level: 3 },
              { fontSize: '20px', fontWeight: '600', marginBottom: 8 }
            ),
            createBlock(
              'paragraph',
              {
                text: `Our ${title.toLowerCase()} solution helps you achieve more with less effort.`,
              },
              { fontSize: '14px', color: '#64748b' }
            ),
          ])
        )
      ),
    }),
  },
  {
    type: 'pricing',
    label: 'Pricing Table',
    description: 'Three-tier pricing cards with plan details and CTA',
    icon: 'DollarSign',
    build: () => ({
      sectionType: 'pricing',
      settings: {
        backgroundColor: '#f8fafc',
        paddingTop: 80,
        paddingBottom: 80,
        paddingLeft: 24,
        paddingRight: 24,
        maxWidth: 1200,
      },
      responsive: {},
      columns: [
        createColumn(12, [
          createBlock(
            'heading',
            { text: 'Pricing Plans', level: 2 },
            {
              fontSize: '36px',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: 48,
            }
          ),
        ]),
      ].concat(
        [
          ['Starter', '$9'],
          ['Professional', '$29'],
          ['Enterprise', '$99'],
        ].map(([plan, price], i) =>
          createColumn(4, [
            createBlock(
              'heading',
              { text: plan, level: 3 },
              {
                fontSize: '24px',
                fontWeight: '600',
                textAlign: 'center',
                marginBottom: 8,
              }
            ),
            createBlock(
              'paragraph',
              { text: price },
              {
                fontSize: '36px',
                fontWeight: '700',
                textAlign: 'center',
                color: '#0f172a',
                marginBottom: 16,
              }
            ),
            createBlock(
              'list',
              {
                items: [
                  `Feature ${i + 1}`,
                  `Feature ${i + 1}.b`,
                  `Feature ${i + 1}.c`,
                ],
                ordered: false,
              },
              {}
            ),
            createBlock(
              'button',
              {
                text: 'Choose Plan',
                url: '#',
                variant: i === 1 ? 'primary' : 'outline',
                fullWidth: true,
              },
              { marginTop: 16 }
            ),
          ])
        )
      ),
    }),
  },
  {
    type: 'contact',
    label: 'Contact Section',
    description:
      'Contact form with name, email, message fields and submit button',
    icon: 'Mail',
    build: () => ({
      sectionType: 'contact',
      settings: {
        backgroundColor: '#ffffff',
        paddingTop: 80,
        paddingBottom: 80,
        paddingLeft: 24,
        paddingRight: 24,
        maxWidth: 800,
      },
      responsive: {},
      columns: [
        createColumn(12, [
          createBlock(
            'heading',
            { text: 'Get in Touch', level: 2 },
            {
              fontSize: '36px',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: 12,
            }
          ),
          createBlock(
            'paragraph',
            { text: "Have a question? We'd love to hear from you." },
            {
              fontSize: '16px',
              color: '#64748b',
              textAlign: 'center',
              marginBottom: 32,
            }
          ),
          createBlock(
            'form',
            {
              fields: [
                {
                  type: 'text',
                  label: 'Name',
                  placeholder: 'Your name',
                  required: true,
                },
                {
                  type: 'email',
                  label: 'Email',
                  placeholder: 'your@email.com',
                  required: true,
                },
                {
                  type: 'textarea',
                  label: 'Message',
                  placeholder: 'Your message...',
                  required: true,
                },
              ],
              submitText: 'Send Message',
            },
            {}
          ),
        ]),
      ],
    }),
  },
  {
    type: 'footer',
    label: 'Footer',
    description: 'Simple footer with links and copyright',
    icon: 'Copyright',
    build: () => ({
      sectionType: 'footer',
      settings: {
        backgroundColor: '#0f172a',
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: 24,
        paddingRight: 24,
        maxWidth: 1200,
      },
      responsive: {},
      columns: [
        createColumn(6, [
          createBlock(
            'heading',
            { text: 'Company Name', level: 3 },
            {
              fontSize: '18px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: 8,
            }
          ),
          createBlock(
            'paragraph',
            { text: '© 2026 All rights reserved.' },
            { fontSize: '14px', color: '#94a3b8' }
          ),
        ]),
        createColumn(6, [
          createBlock(
            'menu',
            {
              items: [
                { label: 'About', url: '#' },
                { label: 'Privacy', url: '#' },
                { label: 'Terms', url: '#' },
                { label: 'Contact', url: '#' },
              ],
            },
            { display: 'flex', gap: '16px', justifyContent: 'flex-end' }
          ),
        ]),
      ],
    }),
  },
];

export function getSectionPresets() {
  return SECTION_PRESETS;
}

export function buildPresetSection(
  presetType: string
): Omit<Section, 'id' | 'sortKey' | 'pageId'> | null {
  const preset = SECTION_PRESETS.find((p) => p.type === presetType);
  if (!preset) return null;
  return preset.build();
}
