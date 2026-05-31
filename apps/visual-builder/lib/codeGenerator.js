// lib/codeGenerator.js
// Generates HTML/CSS/JS code from the component tree stored in editorStore
import { componentRegistry } from './componentRegistry';

export function generateHTML(components) {
  // Recursive function to render component and its children
  const renderComponent = (comp) => {
    const { type, props = {}, children = [] } = comp;
    const registry = componentRegistry[type];
    if (!registry) return '';
    const mergedProps = { ...registry.defaultProps, ...props };
    const innerHTML = children.map(renderComponent).join('');
    return registry.render({ ...mergedProps, children: innerHTML });
  };
  return components.map(renderComponent).join('\n');
}

export function generateCSS(components) {
  // Simple CSS generator based on component styles
  const cssLines = components.map((c) => {
    const selector = `#${c.id}`;
    const style = c.styles || {};
    const styleStr = Object.entries(style)
      .map(([k, v]) => `${k}: ${v};`)
      .join(' ');
    return `${selector} { ${styleStr} }`;
  });
  return cssLines.join('\n');
}
