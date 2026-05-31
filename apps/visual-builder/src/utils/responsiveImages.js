export function generateSrcset(baseUrl, options = {}) {
    const {
        widths = [320, 640, 768, 1024, 1280, 1536, 1920],
        format,
        quality = 80,
    } = options;

    if (!baseUrl) return '';

    return widths
        .map((width) => {
            let url = baseUrl;
            const separator = baseUrl.includes('?') ? '&' : '?';

            if (baseUrl.includes('unsplash') || baseUrl.includes('picsum')) {
                url = `${baseUrl}${separator}w=${width}&q=${quality}`;
            } else if (format) {
                const ext = baseUrl.split('.').pop();
                url = baseUrl.replace(`.${ext}`, `.${format}`);
                url = `${url}${separator}w=${width}`;
            } else {
                url = `${baseUrl}${separator}w=${width}`;
            }

            return `${url} ${width}w`;
        })
        .join(', ');
}

export function generateSizes(breakpoints = {}) {
    const defaults = {
        sm: '100vw',
        md: '100vw',
        lg: '50vw',
        xl: '33vw',
        '2xl': '25vw',
    };

    const merged = { ...defaults, ...breakpoints };

    const bpMap = {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536,
    };

    return Object.entries(merged)
        .filter(([bp]) => bpMap[bp])
        .sort(([a], [b]) => (bpMap[a] || 0) - (bpMap[b] || 0))
        .map(([bp, size]) => `(min-width: ${bpMap[bp]}px) ${size}`)
        .join(', ');
}

export function getResponsiveImageProps(baseUrl, options = {}) {
    return {
        src: baseUrl,
        srcSet: generateSrcset(baseUrl, options),
        sizes: generateSizes(options.breakpoints),
        loading: options.lazy !== false ? 'lazy' : 'eager',
        decoding: 'async',
    };
}

export default { generateSrcset, generateSizes, getResponsiveImageProps };
