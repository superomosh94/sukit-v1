import { describe, it, expect } from 'vitest';
import { stateToDocument, documentToState } from '@/lib/builder/serializer';

describe('Serializer', () => {
  const sampleState = {
    sections: [
      {
        id: 'sec-1',
        type: 'empty',
        blocks: [
          {
            id: 'blk-1',
            type: 'text',
            props: { content: 'hello' },
            styles: { color: '#333' },
          },
        ],
        settings: { bgColor: '#fff' },
      },
    ],
  };

  it('stateToDocument removes runtime fields', () => {
    const state = {
      sections: [
        {
          id: 'sec-1',
          type: 'empty',
          blocks: [
            {
              id: 'blk-1',
              type: 'text',
              props: { content: 'hello' },
              styles: { color: '#333' },
              _isDragging: true,
              _tempHighlight: false,
            },
          ],
          settings: { bgColor: '#fff' },
          _isSelected: false,
        },
      ],
    };
    const doc = stateToDocument(state);
    expect(doc.sections[0]._isSelected).toBeUndefined();
    expect(doc.sections[0].blocks[0]._isDragging).toBeUndefined();
    expect(doc.sections[0].blocks[0]._tempHighlight).toBeUndefined();
    expect(doc.sections[0].blocks[0].props.content).toBe('hello');
  });

  it('documentToState hydrates IDs', () => {
    const doc = {
      sections: [{ type: 'empty', blocks: [{ type: 'text', props: { content: 'hello' }, styles: {} }], settings: {} }],
    };
    const state = documentToState(doc);
    expect(state.sections[0].id).toBeDefined();
    expect(state.sections[0].blocks[0].id).toBeDefined();
    expect(state.sections[0].blocks[0].props.content).toBe('hello');
  });

  it('round-trip preserves data', () => {
    const doc = stateToDocument(sampleState);
    const restored = documentToState(doc);
    expect(restored.sections).toHaveLength(1);
    expect(restored.sections[0].type).toBe('empty');
    expect(restored.sections[0].blocks[0].type).toBe('text');
    expect(restored.sections[0].blocks[0].props.content).toBe('hello');
  });
});
