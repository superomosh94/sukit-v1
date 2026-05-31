// CSS Variable Generator
export const generateCSSVariables = (theme) => {
    const vars = [];
    
    // Colors
    Object.entries(theme.colors || {}).forEach(([key, value]) => {
        if (typeof value === 'string') {
            vars.push(`--color-${key}: ${value};`);
        }
    });
    
    // Typography
    if (theme.typography?.base) {
        vars.push(`--font-family-base: '${theme.typography.base.fontFamily}';`);
        vars.push(`--font-size-base: ${theme.typography.base.fontSize}px;`);
    }
    
    // Spacing
    Object.entries(theme.spacing || {}).forEach(([key, value]) => {
        vars.push(`--spacing-${key}: ${value}px;`);
    });
    
    // Border Radius
    Object.entries(theme.borderRadius || {}).forEach(([key, value]) => {
        vars.push(`--radius-${key}: ${value}px;`);
    });
    
    return `:root {\n  ${vars.join('\n  ')}\n}`;
};

// Tailwind Config Generator
export const generateTailwindConfig = (theme) => {
    return `module.exports = {
    theme: {
        extend: {
            colors: {
                primary: ${JSON.stringify(theme.colors?.primary)},
                secondary: ${JSON.stringify(theme.colors?.secondary)},
                success: ${JSON.stringify(theme.colors?.success)},
                warning: ${JSON.stringify(theme.colors?.warning)},
                danger: ${JSON.stringify(theme.colors?.danger)},
                background: ${JSON.stringify(theme.colors?.background)},
                surface: ${JSON.stringify(theme.colors?.surface)},
            },
            fontFamily: {
                sans: ['${theme.typography?.base?.fontFamily}', 'system-ui', 'sans-serif'],
            },
            spacing: ${JSON.stringify(theme.spacing)},
            borderRadius: ${JSON.stringify(theme.borderRadius)},
            boxShadow: ${JSON.stringify(theme.shadows)},
        },
    },
};`;
};

// CSS to Inject
export const injectThemeCSS = (theme) => {
    const styleId = 'sukit-theme-styles';
    let style = document.getElementById(styleId);
    if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
    }
    
    const cssVars = generateCSSVariables(theme);
    const customCss = theme.customCSS || '';
    
    style.innerHTML = `
${cssVars}

/* Custom CSS */
${customCss}
    `;
};
