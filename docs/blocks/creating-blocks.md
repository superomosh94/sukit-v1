# Creating Custom Blocks

Blocks are the fundamental building units of SUKIT. Each block has a component, schema, default props, and styles.

## Block File Structure

```
blocks/MyBlock/
├── index.tsx        # React component
├── schema.ts        # Props schema (Zod)
├── defaultProps.ts  # Default property values
└── styles.ts        # Default styles
```

## BlockRegistration Interface

```typescript
interface BlockRegistration {
  type: string;
  component: React.ComponentType<BlockProps>;
  category: 'content' | 'media' | 'layout' | 'advanced';
  schema: ZodObject<any>;
  defaultProps: Record<string, unknown>;
  defaultStyles?: Record<string, string>;
  icon?: string;
  description?: string;
}
```

### Example: TextBlock

```typescript
// index.tsx
import { BlockProps } from '@sukit/blocks';

export const TextBlock: React.FC<BlockProps> = ({ props, styles }) => {
  const Tag = (props.tag as keyof JSX.IntrinsicElements) || 'p';
  return <Tag style={styles}>{props.content as string}</Tag>;
};
```

```typescript
// schema.ts
import { z } from 'zod';

export const textBlockSchema = z.object({
  content: z.string().default('Enter text...'),
  tag: z.enum(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span']).default('p'),
  align: z.enum(['left', 'center', 'right']).default('left'),
});
```

```typescript
// defaultProps.ts
export const defaultProps = {
  content: 'Enter text...',
  tag: 'p',
  align: 'left',
};
```

```typescript
// styles.ts
export const defaultStyles = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#333333',
};
```

## Registering in Block Registry

```typescript
import { blockRegistry } from '@/lib/builder/block-registry';
import { TextBlock } from './blocks/TextBlock';
import { textBlockSchema } from './blocks/TextBlock/schema';
import { defaultProps } from './blocks/TextBlock/defaultProps';
import { defaultStyles } from './blocks/TextBlock/styles';

blockRegistry.registerBlockType({
  type: 'text',
  component: TextBlock,
  category: 'content',
  schema: textBlockSchema,
  defaultProps,
  defaultStyles,
  icon: 'type',
  description: 'Rich text block with heading and paragraph options',
});
```

## Editor Component (Property Panel)

When a block is selected, the property panel renders form controls based on the schema. You can provide a custom editor:

```typescript
import { PropertyEditor } from '@sukit/builder';

const TextBlockEditor: React.FC<{
  props: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}> = ({ props, onChange }) => (
  <div>
    <label>Content</label>
    <textarea
      value={props.content as string}
      onChange={(e) => onChange('content', e.target.value)}
    />
    <label>Tag</label>
    <select
      value={props.tag as string}
      onChange={(e) => onChange('tag', e.target.value)}
    >
      <option value="h1">Heading 1</option>
      <option value="h2">Heading 2</option>
      <option value="p">Paragraph</option>
    </select>
  </div>
);
```

## Best Practices

1. **Default props first** — Always provide sensible defaults so blocks render immediately after being dragged.
2. **Use Zod schemas** — Schema validation ensures data integrity during serialization.
3. **Responsive styles** — Use `responsive` overrides for mobile/tablet/desktop variants.
4. **Keep components pure** — Blocks should be presentational, with no side effects.
5. **Avoid external state** — Use only props and styles passed by the renderer.
6. **Test in all viewports** — Ensure your block works at 390px, 810px, and 1920px.
