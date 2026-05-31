import type { BlockData } from '../generators/frontend';

export interface BlockTemplate {
  type: string;
  jsx: string;
  imports: string[];
}

export interface Condition {
  prop: string;
  operator: 'equals' | 'notEquals' | 'exists' | 'notExists' | 'gt' | 'lt';
  value?: unknown;
}

export interface DataSource {
  type: 'static' | 'api' | 'state';
  endpoint?: string;
  key?: string;
}

interface ParsedBlock {
  jsx: string;
  imports: Set<string>;
}

export class BlockJSXGenerator {
  generateJSXFromBlock(block: BlockData): ParsedBlock {
    const renderer = this.renderers[block.blockType] || this.renderUnknown;
    return renderer(block);
  }

  generateNestedChildrenJSX(children: BlockData[], depth: number): string {
    const indent = '  '.repeat(depth + 1);
    return children
      .map((child) => {
        const { jsx } = this.generateJSXFromBlock(child);
        return `${indent}${jsx}`;
      })
      .join('\n');
  }

  generateConditionalRendering(
    conditions: Condition[],
    content: string
  ): string {
    if (conditions.length === 0) return content;

    const cond = conditions[0];
    let expr: string;

    switch (cond.operator) {
      case 'equals':
        expr = `props.${cond.prop} === ${JSON.stringify(cond.value)}`;
        break;
      case 'notEquals':
        expr = `props.${cond.prop} !== ${JSON.stringify(cond.value)}`;
        break;
      case 'exists':
        expr = `props.${cond.prop} !== undefined && props.${cond.prop} !== null`;
        break;
      case 'notExists':
        expr = `props.${cond.prop} === undefined || props.${cond.prop} === null`;
        break;
      case 'gt':
        expr = `props.${cond.prop} > ${JSON.stringify(cond.value)}`;
        break;
      case 'lt':
        expr = `props.${cond.prop} < ${JSON.stringify(cond.value)}`;
        break;
      default:
        expr = `props.${cond.prop}`;
    }

    return `{${expr} && (\n  ${content}\n)}`;
  }

  generateLoopRendering(
    dataSource: DataSource,
    itemTemplate: string,
    itemName = 'item',
    indexName = 'i'
  ): string {
    if (dataSource.type === 'static') {
      return `{data.map((${itemName}, ${indexName}) => (\n  ${itemTemplate}\n))}`;
    }
    if (dataSource.type === 'api') {
      const endpoint = dataSource.endpoint || '/api/data';
      return `{(() => {
  const [items, setItems] = React.useState([]);
  React.useEffect(() => { fetch('${endpoint}').then(r => r.json()).then(setItems); }, []);
  return items.map((${itemName}, ${indexName}) => (\n  ${itemTemplate}\n));
})()}`;
    }
    return `{Array.from({ length: 3 }).map((${itemName}, ${indexName}) => (\n  ${itemTemplate}\n))}`;
  }

  private renderers: Record<string, (b: BlockData) => ParsedBlock> = {
    textBlock: (b) => {
      const tag = (b.props.tag as string) || 'p';
      const content = (b.props.content as string) || '';
      const { className } = this.stylesToTailwind(b.styles);
      return {
        jsx: `<${tag} className="${className}">${this.escapeJsx(content)}</${tag}>`,
        imports: new Set(),
      };
    },

    headingBlock: (b) => {
      const level = (b.props.level as number) || 2;
      const content = (b.props.content as string) || '';
      const sizeMap: Record<number, string> = {
        1: 'text-4xl md:text-5xl',
        2: 'text-3xl md:text-4xl',
        3: 'text-2xl',
        4: 'text-xl',
        5: 'text-lg',
        6: 'text-base',
      };
      return {
        jsx: `<h${level} className="font-bold ${sizeMap[level] || 'text-2xl'} mb-2">${this.escapeJsx(content)}</h${level}>`,
        imports: new Set(),
      };
    },

    imageBlock: (b) => {
      const src = (b.props.src as string) || '';
      const alt = (b.props.alt as string) || '';
      const width = b.props.width as string;
      const height = b.props.height as string;
      const dims = `${width ? ` width={${width}}` : ''}${height ? ` height={${height}}` : ''}`;
      return {
        jsx: `<img src={${JSON.stringify(src)}} alt={${JSON.stringify(alt)}} className="max-w-full h-auto rounded" loading="lazy"${dims} />`,
        imports: new Set(),
      };
    },

    buttonBlock: (b) => {
      const text = (b.props.text as string) || 'Button';
      const href = (b.props.href as string) || (b.props.url as string) || '#';
      const variant = (b.props.variant as string) || 'primary';
      const fullWidth = !!b.props.fullWidth;
      const variantClasses: Record<string, string> = {
        primary: 'bg-gray-900 text-white hover:bg-gray-800',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        outline: 'border border-gray-900 text-gray-900 hover:bg-gray-50',
        ghost: 'text-gray-900 hover:bg-gray-100',
        link: 'text-blue-600 underline-offset-4 hover:underline p-0',
      };
      return {
        jsx: `<a href={${JSON.stringify(href)}} className="inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors ${variantClasses[variant] || variantClasses.primary}${fullWidth ? ' w-full' : ''}">${text}</a>`,
        imports: new Set(),
      };
    },

    spacerBlock: (b) => {
      const height = (b.props.height as number) ?? 40;
      return {
        jsx: `<div style={{ height: ${height}px }} aria-hidden="true" />`,
        imports: new Set(),
      };
    },

    dividerBlock: (b) => {
      const color = (b.props.color as string) || '#e2e8f0';
      return {
        jsx: `<hr style={{ border: 'none', borderTop: '1px solid ${color}', margin: '1rem 0' }} />`,
        imports: new Set(),
      };
    },

    containerBlock: (b) => {
      const maxWidth = (b.props.maxWidth as string) || '1200px';
      return {
        jsx: `<div className="mx-auto w-full px-4" style={{ maxWidth: '${maxWidth}' }}>
  {props.children}
</div>`,
        imports: new Set(),
      };
    },

    gridBlock: (b) => {
      const cols = (b.props.columns as number) ?? 2;
      const gap = (b.props.gap as string) || '16px';
      return {
        jsx: `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(${cols}, 1fr)', gap: '${gap}' }}>
  {props.children}
</div>`,
        imports: new Set(),
      };
    },

    formBlock: (b) => {
      const formId = b.id || 'form';
      const fields =
        (b.props.fields as Array<{
          type: string;
          label: string;
          name: string;
          required?: boolean;
          placeholder?: string;
        }>) || [];
      const submitText = (b.props.submitText as string) || 'Submit';
      const fieldInputs = fields
        .map((f) => {
          const required = f.required ? 'required' : '';
          const placeholder = f.placeholder || '';
          const label = f.label
            ? `<label className="block mb-1 font-medium text-sm">${f.label}</label>`
            : '';
          if (f.type === 'textarea') {
            return `<div className="mb-3">${label}<textarea name="${f.name}" ${required} placeholder="${placeholder}" className="w-full p-2 border rounded-md min-h-[80px]" /></div>`;
          }
          if (f.type === 'select') {
            return `<div className="mb-3">${label}<select name="${f.name}" ${required} className="w-full p-2 border rounded-md">{(props.options || []).map(o => <option key={o} value={o}>{o}</option>)}</select></div>`;
          }
          return `<div className="mb-3">${label}<input type="${f.type === 'email' ? 'email' : 'text'}" name="${f.name}" ${required} placeholder="${placeholder}" className="w-full p-2 border rounded-md" /></div>`;
        })
        .join('\n        ');

      return {
        jsx: `<form id="${formId}" onSubmit={handleSubmit} className="space-y-4">
  ${fieldInputs}
  <button type="submit" className="px-6 py-2.5 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 transition-colors">
    ${submitText}
  </button>
</form>`,
        imports: new Set(['React', 'useState']),
      };
    },

    videoBlock: (b) => {
      const src = (b.props.src as string) || '';
      const poster = (b.props.poster as string) || '';
      return {
        jsx: `<video className="max-w-full h-auto rounded" controls${poster ? ` poster={${JSON.stringify(poster)}}` : ''}>
  <source src={${JSON.stringify(src)}} />
  Your browser does not support the video tag.
</video>`,
        imports: new Set(),
      };
    },

    mapBlock: (b) => {
      const address = (b.props.address as string) || '';
      const encoded = encodeURIComponent(address);
      return {
        jsx: `<iframe
  title="Map"
  src={"https://maps.google.com/maps?q=${encoded}&z=14&output=embed"}
  className="w-full h-[300px] border-0 rounded-lg"
  allowFullScreen
  loading="lazy"
/>`,
        imports: new Set(),
      };
    },

    accordionBlock: (b) => {
      const items =
        (b.props.items as Array<{ title: string; content: string }>) || [];
      const itemsJsx = items
        .map(
          (item, i) => `
        <details${i === 0 ? ' open' : ''} className="border-b">
          <summary className="py-3 font-semibold cursor-pointer hover:text-gray-600">${item.title}</summary>
          <div className="pb-3 text-gray-600">${item.content}</div>
        </details>`
        )
        .join('\n');

      return {
        jsx: `<div className="divide-y border-t">
  ${itemsJsx}
</div>`,
        imports: new Set(),
      };
    },

    tabsBlock: (b) => {
      const tabs =
        (b.props.tabs as Array<{ label: string; content: string }>) || [];
      return {
        jsx: `<div>
  <div className="flex border-b">
    {tabs.map((tab, i) => (
      <button
        key={i}
        className={\`px-4 py-2 font-medium transition-colors \${
          activeTab === i
            ? 'border-b-2 border-gray-900 text-gray-900'
            : 'text-gray-400 hover:text-gray-600'
        }\`}
        onClick={() => setActiveTab(i)}
      >
        {tab.label}
      </button>
    ))}
  </div>
  {tabs.map((tab, i) => (
    <div key={i} style={{ display: activeTab === i ? 'block' : 'none' }} className="py-4">
      {tab.content}
    </div>
  ))}
</div>`,
        imports: new Set(['React', 'useState']),
      };
    },

    carouselBlock: (b) => {
      const slides = (b.props.slides as string[]) || [];
      const slidesJsx = slides
        .map(
          (src, i) => `
        <div key={i} className={\`min-w-full transition-opacity duration-500 \${current === i ? 'opacity-100' : 'opacity-0'}\`}>
          <img src={${JSON.stringify(src)}} alt={\`Slide \${i + 1}\`} className="w-full h-64 object-cover rounded-lg" />
        </div>`
        )
        .join('\n');

      return {
        jsx: `<div className="relative overflow-hidden rounded-lg">
  <div className="flex">
    ${slidesJsx}
  </div>
  <button onClick={() => setCurrent((current - 1 + slides.length) % slides.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white">
    ←
  </button>
  <button onClick={() => setCurrent((current + 1) % slides.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white">
    →
  </button>
</div>`,
        imports: new Set(['React', 'useState']),
      };
    },
  };

  private renderUnknown(b: BlockData): ParsedBlock {
    return {
      jsx: `<div className="${this.stylesToTailwind(b.styles).className}">
  {props.content || props.children || <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-400">${b.blockType}</div>}
</div>`,
      imports: new Set(),
    };
  }

  private stylesToTailwind(styles: Record<string, unknown> | undefined): {
    className: string;
  } {
    if (!styles || Object.keys(styles).length === 0) return { className: '' };
    const classes: string[] = [];
    const s = styles as Record<string, string>;

    if (s.padding) classes.push(`p-${this.pxToTailwind(s.padding)}`);
    if (s.margin) classes.push(`m-${this.pxToTailwind(s.margin)}`);
    if (s.textAlign) classes.push(`text-${s.textAlign}`);
    if (s.backgroundColor) classes.push('bg-custom');
    if (s.color) classes.push('text-custom');
    if (s.borderRadius)
      classes.push(`rounded-${this.pxToTailwind(s.borderRadius)}`);

    return { className: classes.join(' ') };
  }

  private pxToTailwind(px: string): number {
    const num = parseInt(px);
    if (isNaN(num)) return 1;
    return Math.round(num / 4);
  }

  private escapeJsx(text: string): string {
    return text.replace(/{/g, '{"{"}').replace(/}/g, '{"}"}');
  }
}

export const blockJsxGenerator = new BlockJSXGenerator();
