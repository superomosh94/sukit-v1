function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}

function rgbToHex(r, g, b) {
    return `#${[r, g, b]
        .map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0'))
        .join('')}`;
}

function lighten(hex, factor) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    return rgbToHex(rgb.r + (255 - rgb.r) * factor, rgb.g + (255 - rgb.g) * factor, rgb.b + (255 - rgb.b) * factor);
}

function darken(hex, factor) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    return rgbToHex(rgb.r * (1 - factor), rgb.g * (1 - factor), rgb.b * (1 - factor));
}

function generateShades(hex) {
    if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return {};
    return {
        50: lighten(hex, 0.9),
        100: lighten(hex, 0.8),
        200: lighten(hex, 0.6),
        300: lighten(hex, 0.4),
        400: lighten(hex, 0.2),
        500: hex,
        600: darken(hex, 0.15),
        700: darken(hex, 0.3),
        800: darken(hex, 0.5),
        900: darken(hex, 0.7),
    };
}

const SHADE_COLORS = ['primary', 'secondary', 'success', 'warning', 'danger'];

const colorVarName = (key) => {
    const map = {
        text: 'text-primary',
        textSecondary: 'text-secondary',
    };
    return `--color-${map[key] || key}`;
};

// CSS Variable Generator
export const generateCSSVariables = (theme) => {
    const vars = [];

    // Colors
    Object.entries(theme.colors || {}).forEach(([key, value]) => {
        if (typeof value !== 'string') return;
        if (SHADE_COLORS.includes(key)) {
            const shades = generateShades(value);
            Object.entries(shades).forEach(([shade, shadeValue]) => {
                vars.push(`--color-${key}-${shade}: ${shadeValue};`);
            });
            vars.push(`--color-${key}: ${value};`);
        } else {
            vars.push(`${colorVarName(key)}: ${value};`);
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
