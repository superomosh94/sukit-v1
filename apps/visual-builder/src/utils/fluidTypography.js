export function generateClamp(options = {}) {
    const {
        minSize = 16,
        maxSize = 32,
        minViewport = 375,
        maxViewport = 1440,
        unit = 'px',
        preferredUnit = 'vw',
    } = options;

    const slope = (maxSize - minSize) / (maxViewport - minViewport);
    const slopeVw = slope * 100;
    const intercept = minSize - slope * minViewport;

    return `clamp(${minSize}${unit}, ${slopeVw.toFixed(4)}${preferredUnit} + ${intercept.toFixed(2)}${unit}, ${maxSize}${unit})`;
}

export function fluidScale(minSize, maxSize, minViewport = 375, maxViewport = 1440) {
    return generateClamp({ minSize, maxSize, minViewport, maxViewport });
}

export function getFluidTypographyScale(baseSize = 16, scaleRatio = 1.25) {
    const sizes = {};
    const levels = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'];
    const ratios = { xs: 0.75, sm: 0.875, base: 1, lg: 1.125, xl: 1.25, '2xl': 1.5, '3xl': 1.875, '4xl': 2.25, '5xl': 3, '6xl': 3.75 };

    levels.forEach((level) => {
        const size = baseSize * (ratios[level] || 1);
        const minSize = Math.round(size * 0.8);
        const maxSize = Math.round(size);
        sizes[level] = fluidScale(minSize, maxSize);
    });

    return sizes;
}

export default { generateClamp, fluidScale, getFluidTypographyScale };
