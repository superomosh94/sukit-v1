'use client';

import type { Block } from '../types';

export default function CardBlock({ block }: { block: Block }) {
  const { props, styles } = block;
  const image = props.image as string | undefined;
  const title = (props.title as string) || '';
  const description = (props.description as string) || '';
  const link = props.link as string | undefined;
  const borderRadius = (styles.borderRadius as number) ?? 8;

  const cardStyle: React.CSSProperties = {
    borderRadius,
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    backgroundColor: '#fff',
    transition: 'box-shadow 0.2s',
  };

  const content = (
    <>
      {image && (
        <img
          src={image}
          alt={title}
          style={{
            width: '100%',
            height: 200,
            objectFit: 'cover',
            display: 'block',
          }}
        />
      )}
      <div style={{ padding: 20 }}>
        {title && (
          <h3
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: '#111827',
              margin: '0 0 8px',
            }}
          >
            {title}
          </h3>
        )}
        {description && (
          <p
            style={{
              fontSize: 15,
              color: '#6b7280',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {description}
          </p>
        )}
      </div>
    </>
  );

  if (link) {
    return (
      <a
        href={link}
        style={{ ...cardStyle, textDecoration: 'none', display: 'block' }}
      >
        {content}
      </a>
    );
  }

  return <div style={cardStyle}>{content}</div>;
}
