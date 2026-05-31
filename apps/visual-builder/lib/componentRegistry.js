// lib/componentRegistry.js
// Simple registry mapping component types to default props and render functions
export const componentRegistry = {
  Container: {
    defaultProps: { width: 300, height: 200, background: '#f0f0f0' },
    render: (props) => {
      const { width, height, background, children } = props;
      return `<div style="width:${width}px;height:${height}px;background:${background};position:relative;">${children || ''}</div>`;
    }
  },
  Section: {
    defaultProps: { width: '100%', height: 100, background: '#e0e0e0' },
    render: (props) => {
      const { width, height, background, children } = props;
      return `<section style="width:${width};height:${height}px;background:${background};position:relative;">${children || ''}</section>`;
    }
  },
  Text: {
    defaultProps: { text: 'Sample text', fontSize: 16, color: '#000' },
    render: (props) => {
      const { text, fontSize, color } = props;
      return `<p style="font-size:${fontSize}px;color:${color};position:relative;">${text}</p>`;
    }
  }
};
