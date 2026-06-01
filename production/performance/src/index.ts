import type { SukitKernel } from '@sukit/core';

export interface PerformanceConfig {
  bundleSizeLimit: number;
  cacheTTL: number;
  compressionLevel: number;
  connectionPoolSize: number;
  queryTimeout: number;
  maxQueryComplexity: number;
  enableBrotli: boolean;
  enableServiceWorker: boolean;
  enablePwa: boolean;
  pwaName: string;
  pwaShortName: string;
  pwaThemeColor: string;
  pwaBackgroundColor: string;
  pwaDisplay: string;
  pwaOrientation: string;
  pwaIconSizes: number[];
  preconnectOrigins: string[];
  criticalCSS: string;
  enableLazyLoading: boolean;
  lazyLoadThreshold: string;
  enableWebpDelivery: boolean;
  enableAvifDelivery: boolean;
  enableBlurhash: boolean;
  enableRum: boolean;
  rumSampleRate: number;
  coreWebVitalsTarget: { lcp: number; fid: number; cls: number };
  enableCacheWarming: boolean;
  cacheWarmingInterval: number;
  cacheWarmingPaths: string[];
  enableBundleMonitoring: boolean;
  bundleSizeThresholdWarning: number;
  bundleSizeThresholdError: number;
  imageCdnUrl: string;
  enableImageCdn: boolean;
  enableEdgeCaching: boolean;
  performanceBudget: Record<string, number>;
  appUrl: string;
}

const DEFAULT_CONFIG: PerformanceConfig = {
  bundleSizeLimit: 200 * 1024,
  cacheTTL: 300,
  compressionLevel: 6,
  connectionPoolSize: 15,
  queryTimeout: 30000,
  maxQueryComplexity: 100,
  enableBrotli: true,
  enableServiceWorker: true,
  enablePwa: true,
  pwaName: 'SUKIT',
  pwaShortName: 'SUKIT',
  pwaThemeColor: '#4F46E5',
  pwaBackgroundColor: '#ffffff',
  pwaDisplay: 'standalone',
  pwaOrientation: 'any',
  pwaIconSizes: [72, 96, 128, 144, 152, 192, 384, 512],
  preconnectOrigins: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ],
  criticalCSS: '',
  enableLazyLoading: true,
  lazyLoadThreshold: '200px',
  enableWebpDelivery: true,
  enableAvifDelivery: false,
  enableBlurhash: true,
  enableRum: true,
  rumSampleRate: 0.1,
  coreWebVitalsTarget: { lcp: 2500, fid: 100, cls: 0.1 },
  enableCacheWarming: false,
  cacheWarmingInterval: 300,
  cacheWarmingPaths: ['/', '/api/sites', '/api/pages', '/api/modules'],
  enableBundleMonitoring: true,
  bundleSizeThresholdWarning: 250 * 1024,
  bundleSizeThresholdError: 500 * 1024,
  imageCdnUrl: process.env.IMAGE_CDN_URL || '',
  enableImageCdn: false,
  enableEdgeCaching: false,
  performanceBudget: {
    'total-bundle': 500000,
    'first-load': 200000,
    'lcp': 2500,
    'fid': 100,
    'cls': 0.1,
    'ttfb': 800,
  },
  appUrl: process.env.APP_URL || 'http://localhost:3042',
};

export class PerformanceOptimizer {
  private kernel: SukitKernel;
  private config: PerformanceConfig;
  private cacheHitCount = 0;
  private cacheMissCount = 0;

  constructor(kernel: SukitKernel, config?: Partial<PerformanceConfig>) {
    this.kernel = kernel;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ─── Cache Layer ───────────────────────────────────────────────

  async getCached<T>(
    key: string,
    fetch: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.kernel.cache.get(key);
    if (cached !== null && cached !== undefined) {
      this.cacheHitCount++;
      return JSON.parse(cached as string);
    }
    this.cacheMissCount++;
    const value = await fetch();
    await this.kernel.cache.set(
      key,
      JSON.stringify(value),
      ttl || this.config.cacheTTL
    );
    return value;
  }

  async invalidateCache(pattern: string): Promise<void> {
    // In production, scan Redis keys matching pattern
    await this.kernel.events.emit('cache:invalidated', { pattern });
  }

  getCacheHitRatio(): number {
    const total = this.cacheHitCount + this.cacheMissCount;
    return total > 0 ? this.cacheHitCount / total : 0;
  }

  // ─── Compression ───────────────────────────────────────────────

  shouldCompress(response: Response): boolean {
    const contentType = response.headers.get('content-type') || '';
    const size = parseInt(response.headers.get('content-length') || '0');
    const compressible = [
      'text/',
      'application/json',
      'application/javascript',
      'application/xml',
      'image/svg+xml',
    ];
    return compressible.some((t) => contentType.startsWith(t)) && size > 1024;
  }

  getCompressionHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Encoding': this.config.enableBrotli ? 'br' : 'gzip',
      Vary: 'Accept-Encoding',
    };
    return headers;
  }

  // ─── Cache Headers ─────────────────────────────────────────────

  getCacheHeaders(path: string, maxAge?: number): Record<string, string> {
    const isImmutable =
      /\.(js|css|png|jpg|webp|avif|woff2?|svg)$/.test(path) &&
      /[a-f0-9]{8,}/.test(path);
    return {
      'Cache-Control': isImmutable
        ? `public, max-age=31536000, immutable`
        : `public, max-age=${maxAge || 60}, must-revalidate`,
      'CDN-Cache-Control': `public, max-age=${maxAge || 60}`,
      'Surrogate-Control': `public, max-age=${maxAge || 60}`,
    };
  }

  // ─── HTML Generation ───────────────────────────────────────────

  getPreloadTags(): string {
    return [
      ...this.config.preconnectOrigins.map(
        (o) => `<link rel="preconnect" href="${o}" crossorigin>`
      ),
      ...this.config.preconnectOrigins.map(
        (o) => `<link rel="dns-prefetch" href="${o}">`
      ),
    ].join('\n');
  }

  getCriticalCSSInline(): string {
    return this.config.criticalCSS
      ? `<style>${this.config.criticalCSS}</style>`
      : '';
  }

  getServiceWorkerRegistration(): string {
    if (!this.config.enableServiceWorker) return '';
    return `<script>'serviceWorker' in navigator && navigator.serviceWorker.register('/sw.js')</script>`;
  }

  // ─── Query Optimization ────────────────────────────────────────

  validateQueryComplexity(
    fields: string[],
    depth: number
  ): { valid: boolean; reason?: string } {
    const complexity = fields.length * Math.pow(2, depth);
    if (complexity > this.config.maxQueryComplexity) {
      return {
        valid: false,
        reason: `Query too complex (${complexity} > ${this.config.maxQueryComplexity})`,
      };
    }
    return { valid: true };
  }

  getQueryTimeout(): number {
    return this.config.queryTimeout;
  }

  // ─── Resource Hints ────────────────────────────────────────────

  getResourceHints(): {
    preload: string[];
    prefetch: string[];
    preconnect: string[];
  } {
    return {
      preload: [],
      prefetch: [],
      preconnect: this.config.preconnectOrigins,
    };
  }

  // ─── Performance Metrics ───────────────────────────────────────

  getMetrics() {
    return {
      cacheHitRatio: this.getCacheHitRatio(),
      cacheHits: this.cacheHitCount,
      cacheMisses: this.cacheMissCount,
      bundleSizeLimit: this.config.bundleSizeLimit,
      compressionEnabled: this.config.enableBrotli,
      connectionPoolSize: this.config.connectionPoolSize,
      queryTimeout: this.config.queryTimeout,
    };
  }

  // ─── Bundle Optimization ──────────────────────────────────────

  getOptimizationHints(): Record<string, any> {
    return {
      codeSplitting: true,
      treeShaking: true,
      dynamicImports: true,
      lazyLoading: true,
      imageOptimization: true,
      fontOptimization: true,
      cssPurge: true,
    };
  }

  // ─── Image Optimization ────────────────────────────────────────

  getImageSizes(width: number): number[] {
    const sizes = [640, 750, 1080, 1200, 1920, 2048, 3840];
    return sizes.filter((s) => s <= width * 2).concat([width]);
  }

  getSrcSet(url: string, widths: number[], format?: string): string {
    return widths
      .map((w) => `${url}?w=${w}${format ? `&fmt=${format}` : ''} ${w}w`)
      .join(', ');
  }

  // ─── PWA Manifest ─────────────────────────────────────────────

  generatePwaManifest(): Record<string, any> {
    return {
      name: this.config.pwaName,
      short_name: this.config.pwaShortName,
      description: 'SUKIT - Visual Site Builder',
      start_url: '/',
      display: this.config.pwaDisplay,
      orientation: this.config.pwaOrientation,
      theme_color: this.config.pwaThemeColor,
      background_color: this.config.pwaBackgroundColor,
      categories: ['productivity', 'web-development'],
      prefer_related_applications: false,
      icons: this.config.pwaIconSizes.map(size => ({
        src: `/icons/icon-${size}x${size}.png`,
        sizes: `${size}x${size}`,
        type: 'image/png',
        purpose: size >= 192 ? 'any maskable' : 'any',
      })),
      screenshots: [
        {
          src: '/screenshots/desktop.png',
          sizes: '1920x1080',
          type: 'image/png',
          form_factor: 'wide',
          label: 'SUKIT Desktop View',
        },
        {
          src: '/screenshots/mobile.png',
          sizes: '750x1334',
          type: 'image/png',
          form_factor: 'narrow',
          label: 'SUKIT Mobile View',
        },
      ],
      shortcuts: [
        { name: 'New Site', url: '/sites/new', icons: [{ src: '/icons/new-site.png', sizes: '96x96' }] },
        { name: 'Dashboard', url: '/dashboard', icons: [{ src: '/icons/dashboard.png', sizes: '96x96' }] },
        { name: 'Media Library', url: '/media', icons: [{ src: '/icons/media.png', sizes: '96x96' }] },
      ],
      related_applications: [],
    };
  }

  getPwaMetaTags(): string {
    return [
      `<meta name="application-name" content="${this.config.pwaShortName}">`,
      `<meta name="apple-mobile-web-app-capable" content="yes">`,
      `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`,
      `<meta name="apple-mobile-web-app-title" content="${this.config.pwaShortName}">`,
      `<meta name="mobile-web-app-capable" content="yes">`,
      `<link rel="manifest" href="/manifest.json">`,
      ...this.config.pwaIconSizes.map(s => `<link rel="apple-touch-icon" sizes="${s}x${s}" href="/icons/icon-${s}x${s}.png">`),
      `<link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="${this.config.pwaThemeColor}">`,
      `<meta name="msapplication-TileColor" content="${this.config.pwaThemeColor}">`,
      `<meta name="msapplication-config" content="/browserconfig.xml">`,
      `<meta name="theme-color" content="${this.config.pwaThemeColor}" media="(prefers-color-scheme: light)">`,
      `<meta name="theme-color" content="${this.config.pwaThemeColor}" media="(prefers-color-scheme: dark)">`,
    ].join('\n');
  }

  // ─── Lazy Loading ─────────────────────────────────────────────

  getLazyLoadingAttributes(): Record<string, string> {
    return {
      loading: 'lazy',
      decoding: 'async',
      'data-lazy-threshold': this.config.lazyLoadThreshold,
    };
  }

  generateLazyLoadingScript(): string {
    if (!this.config.enableLazyLoading) return '';
    return `<script>
document.addEventListener('DOMContentLoaded', function() {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        if (el.dataset.src) { el.src = el.dataset.src; el.removeAttribute('data-src'); }
        if (el.dataset.srcset) { el.srcset = el.dataset.srcset; el.removeAttribute('data-srcset'); }
        if (el.dataset.background) { el.style.backgroundImage = el.dataset.background; el.removeAttribute('data-background'); }
        observer.unobserve(el);
      }
    });
  }, { rootMargin: '${this.config.lazyLoadThreshold}' });
  document.querySelectorAll('[data-src],[data-srcset],[data-background]').forEach(function(el) { observer.observe(el); });
});
</script>`;
  }

  // ─── WebP / AVIF Delivery ─────────────────────────────────────

  getImageDeliveryUrl(url: string, options?: { width?: number; format?: string; quality?: number }): string {
    if (!this.config.enableImageCdn || !this.config.imageCdnUrl) {
      let result = url;
      if (options?.width) result += `?w=${options.width}`;
      if (options?.format) result += `${result.includes('?') ? '&' : '?'}fmt=${options.format}`;
      if (options?.quality) result += `&q=${options.quality}`;
      return result;
    }
    const cdnUrl = this.config.imageCdnUrl.replace(/\/$/, '');
    const encoded = Buffer.from(url).toString('base64');
    const params = new URLSearchParams();
    if (options?.width) params.set('w', String(options.width));
    if (options?.format) params.set('fmt', options.format);
    if (options?.quality) params.set('q', String(options.quality));
    const qs = params.toString();
    return `${cdnUrl}/cdn-cgi/image/${qs ? qs + '/' : ''}${encoded}`;
  }

  getPreferredFormats(requestHeaders: { accept?: string }): string[] {
    const accept = requestHeaders.accept || '';
    const formats: string[] = ['original'];
    if (this.config.enableAvifDelivery && accept.includes('image/avif')) formats.unshift('avif');
    if (this.config.enableWebpDelivery && accept.includes('image/webp')) formats.unshift('webp');
    return formats;
  }

  getPictureElement(url: string, alt: string, widths: number[], options?: { className?: string; lazy?: boolean }): string {
    const lazy = options?.lazy !== false && this.config.enableLazyLoading;
    const srcAttr = lazy ? 'data-src' : 'src';
    const srcsetAttr = lazy ? 'data-srcset' : 'srcset';
    const sources = this.getPreferredFormats({ accept: 'image/webp,image/avif' })
      .filter(f => f !== 'original')
      .map(f => `<source ${srcsetAttr}="${this.getSrcSet(url, widths, f)}" type="image/${f}">`)
      .join('\n    ');
    const className = options?.className ? ` class="${options.className}"` : '';
    return `<picture>
    ${sources}
    <img ${srcAttr}="${url}" ${srcsetAttr}="${this.getSrcSet(url, widths)}" alt="${alt}" loading="${lazy ? 'lazy' : 'eager'}" decoding="async"${className}>
  </picture>`;
  }

  // ─── Blurhash ─────────────────────────────────────────────────

  generateBlurhashPlaceholder(imageUrl: string, width?: number, height?: number): string {
    if (!this.config.enableBlurhash) return '';
    const w = width || 32;
    const h = height || 32;
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:0;left:0;width:100%;height:100%">
  <filter id="blur">
    <feGaussianBlur stdDeviation="20" />
  </filter>
  <image href="${imageUrl}?w=${w}&blur=40" width="${w}" height="${h}" filter="url(#blur)" preserveAspectRatio="xMidYMid slice" />
</svg>`;
  }

  // ─── Real User Monitoring (RUM) ───────────────────────────────

  generateRumScript(): string {
    if (!this.config.enableRum) return '';
    return `<script>
(function() {
  if (Math.random() > ${this.config.rumSampleRate}) return;
  var metrics = {};
  var observer = new PerformanceObserver(function(list) {
    for (var entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') metrics.lcp = entry.startTime;
      if (entry.entryType === 'first-input') metrics.fid = entry.processingStart - entry.startTime;
      if (entry.entryType === 'layout-shift') metrics.cls = (metrics.cls || 0) + entry.value;
      if (entry.entryType === 'navigation') {
        metrics.ttfb = entry.responseStart - entry.requestStart;
        metrics.domComplete = entry.domComplete;
        metrics.domInteractive = entry.domInteractive;
      }
    }
  });
  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'navigation'] });
  window.addEventListener('load', function() {
    setTimeout(function() {
      metrics.url = window.location.pathname;
      metrics.userAgent = navigator.userAgent;
      metrics.connection = navigator.connection ? navigator.connection.effectiveType : 'unknown';
      var payload = btoa(JSON.stringify(metrics));
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/rum', payload);
      } else {
        new Image().src = '/api/rum?d=' + encodeURIComponent(payload);
      }
    }, 3000);
  });
})();
</script>`;
  }

  // ─── Core Web Vitals Tracking ─────────────────────────────────

  checkCoreWebVitals(metrics: { lcp?: number; fid?: number; cls?: number; ttfb?: number }): {
    passed: boolean;
    results: Record<string, { value: number; target: number; status: 'good' | 'needs-improvement' | 'poor' }>;
  } {
    const results: Record<string, any> = {};
    if (metrics.lcp !== undefined) {
      results.lcp = {
        value: metrics.lcp,
        target: this.config.coreWebVitalsTarget.lcp,
        status: metrics.lcp <= this.config.coreWebVitalsTarget.lcp ? 'good' : metrics.lcp <= this.config.coreWebVitalsTarget.lcp * 2 ? 'needs-improvement' : 'poor',
      };
    }
    if (metrics.fid !== undefined) {
      results.fid = {
        value: metrics.fid,
        target: this.config.coreWebVitalsTarget.fid,
        status: metrics.fid <= this.config.coreWebVitalsTarget.fid ? 'good' : metrics.fid <= this.config.coreWebVitalsTarget.fid * 2 ? 'needs-improvement' : 'poor',
      };
    }
    if (metrics.cls !== undefined) {
      results.cls = {
        value: metrics.cls,
        target: this.config.coreWebVitalsTarget.cls,
        status: metrics.cls <= this.config.coreWebVitalsTarget.cls ? 'good' : metrics.cls <= this.config.coreWebVitalsTarget.cls * 2 ? 'needs-improvement' : 'poor',
      };
    }
    if (metrics.ttfb !== undefined) {
      results.ttfb = {
        value: metrics.ttfb,
        target: this.config.performanceBudget['ttfb'],
        status: metrics.ttfb <= this.config.performanceBudget['ttfb'] ? 'good' : metrics.ttfb <= this.config.performanceBudget['ttfb'] * 1.5 ? 'needs-improvement' : 'poor',
      };
    }
    return {
      passed: Object.values(results).every((r: any) => r.status !== 'poor'),
      results,
    };
  }

  // ─── Bundle Size Monitoring ───────────────────────────────────

  checkBundleSize(bundles: { name: string; size: number }[]): {
    passed: boolean;
    results: { name: string; size: number; status: 'ok' | 'warning' | 'error' }[];
  } {
    const results = bundles.map(b => ({
      name: b.name,
      size: b.size,
      status: b.size <= this.config.bundleSizeLimit ? 'ok' : b.size <= this.config.bundleSizeThresholdWarning ? 'warning' : 'error',
    }));
    return {
      passed: results.every(r => r.status !== 'error'),
      results,
    };
  }

  // ─── Cache Invalidation & Warming ─────────────────────────────

  async warmCache(paths?: string[]): Promise<{ warmed: number; failed: number }> {
    const targets = paths || this.config.cacheWarmingPaths;
    let warmed = 0;
    let failed = 0;
    for (const path of targets) {
      try {
        const url = `${this.config.appUrl || 'http://localhost:3042'}${path}`;
        const res = await fetch(url);
        if (res.ok) warmed++;
        else failed++;
      } catch {
        failed++;
      }
    }
    return { warmed, failed };
  }

  getCacheWarmingSchedule(): string {
    if (!this.config.enableCacheWarming) return '';
    return `*/${Math.floor(this.config.cacheWarmingInterval / 60)} * * * * curl -s http://localhost:3042/api/cache/warm > /dev/null`;
  }

  // ─── Performance Budget ───────────────────────────────────────

  checkPerformanceBudget(metrics: Record<string, number>): {
    passed: boolean;
    violations: { metric: string; actual: number; budget: number }[];
  } {
    const violations: { metric: string; actual: number; budget: number }[] = [];
    for (const [key, value] of Object.entries(metrics)) {
      const budget = this.config.performanceBudget[key];
      if (budget && value > budget) {
        violations.push({ metric: key, actual: value, budget });
      }
    }
    return { passed: violations.length === 0, violations };
  }

  // ─── Extended Metrics ─────────────────────────────────────────

  // ─── Index Recommendations ─────────────────────────────────────

  generateIndexRecommendations(queryPatterns: { table: string; columns: string[]; type: 'exact' | 'range' | 'sort' | 'join' | 'expression'; frequency: number }[]): {
    recommendedIndexes: { name: string; table: string; columns: string[]; type: string; estimatedImprovement: string; ddl: string }[];
    compositeIndexes: { name: string; table: string; columns: string[]; ddl: string }[];
    partialIndexes: { name: string; table: string; columns: string[]; condition: string; ddl: string }[];
    expressionIndexes: { name: string; table: string; expression: string; ddl: string }[];
  } {
    const recommendedIndexes: { name: string; table: string; columns: string[]; type: string; estimatedImprovement: string; ddl: string }[] = [];
    const compositeIndexes: { name: string; table: string; columns: string[]; ddl: string }[] = [];
    const partialIndexes: { name: string; table: string; columns: string[]; condition: string; ddl: string }[] = [];
    const expressionIndexes: { name: string; table: string; expression: string; ddl: string }[] = [];
    const seen = new Set<string>();

    for (const qp of queryPatterns.sort((a, b) => b.frequency - a.frequency)) {
      const table = qp.table;
      const columns = qp.columns;

      if (qp.type === 'expression' && columns.length >= 1) {
        const expr = columns.join(' ');
        const key = `${table}:expr:${expr}`;
        if (!seen.has(key)) {
          seen.add(key);
          expressionIndexes.push({
            name: `idx_${table}_expr_${expressionIndexes.length + 1}`,
            table,
            expression: expr,
            ddl: `CREATE INDEX idx_${table}_expr_${expressionIndexes.length + 1} ON "${table}" (${expr});`,
          });
        }
        continue;
      }

      if (columns.length > 1) {
        const key = `${table}:composite:${columns.join(',')}`;
        if (!seen.has(key)) {
          seen.add(key);
          compositeIndexes.push({
            name: `idx_${table}_${columns.join('_')}`,
            table,
            columns,
            ddl: `CREATE INDEX CONCURRENTLY idx_${table}_${columns.join('_')} ON "${table}" (${columns.join(', ')});`,
          });
        }
      }

      if (qp.type === 'range' || qp.type === 'sort') {
        for (const col of columns) {
          const key = `${table}:${qp.type}:${col}`;
          if (!seen.has(key)) {
            seen.add(key);
            recommendedIndexes.push({
              name: `idx_${table}_${col}`,
              table,
              columns: [col],
              type: qp.type,
              estimatedImprovement: qp.type === 'range' ? '60-80%' : '40-60%',
              ddl: qp.type === 'range'
                ? `CREATE INDEX idx_${table}_${col} ON "${table}" ("${col}" ASC);`
                : `CREATE INDEX idx_${table}_${col}_sort ON "${table}" ("${col}" ASC NULLS LAST);`,
            });
          }
        }
      } else if (qp.type === 'exact' || qp.type === 'join') {
        for (const col of columns) {
          const key = `${table}:${qp.type}:${col}`;
          if (!seen.has(key)) {
            seen.add(key);
            recommendedIndexes.push({
              name: `idx_${table}_${col}`,
              table,
              columns: [col],
              type: qp.type,
              estimatedImprovement: qp.type === 'exact' ? '70-90%' : '50-70%',
              ddl: `CREATE INDEX idx_${table}_${col} ON "${table}" ("${col}");`,
            });
          }
        }
      }

      if (qp.frequency > 100 && qp.type === 'exact') {
        for (const col of columns) {
          const cond = `"${col}" IS NOT NULL`;
          const key = `${table}:partial:${col}`;
          if (!seen.has(key)) {
            seen.add(key);
            partialIndexes.push({
              name: `idx_${table}_${col}_partial`,
              table,
              columns: [col],
              condition: cond,
              ddl: `CREATE INDEX idx_${table}_${col}_partial ON "${table}" ("${col}") WHERE ${cond};`,
            });
          }
        }
      }
    }

    return { recommendedIndexes, compositeIndexes, partialIndexes, expressionIndexes };
  }

  // ─── Read Replicas Configuration ───────────────────────────────

  generateReadReplicaConfig(options: { count?: number; regions?: string[]; lagTolerance?: number; instanceClass?: string } = {}): Record<string, any> {
    const count = options.count || 2;
    const regions = options.regions || ['us-east-1', 'us-west-2'];
    const lagTolerance = options.lagTolerance || 5;
    return {
      enabled: true,
      primary: { region: 'us-east-1', endpoint: 'sukit-db-primary.c9abcdefghij.us-east-1.rds.amazonaws.com', instanceClass: options.instanceClass || 'db.r6g.large' },
      replicas: Array.from({ length: count }, (_, i) => ({
        name: `sukit-db-replica-${i + 1}`,
        region: regions[i % regions.length],
        endpoint: `sukit-db-replica-${i + 1}.c9abcdefghij.${regions[i % regions.length]}.rds.amazonaws.com`,
        instanceClass: options.instanceClass || 'db.r6g.large',
        storage: 100,
        storageType: 'gp3',
        multiAZ: false,
        backupRetention: 7,
        publiclyAccessible: false,
      })),
      readWriteSplitting: {
        mode: 'automatic',
        proxyEndpoint: 'sukit-db-proxy.proxy-c9abcdefghij.us-east-1.rds.amazonaws.com',
        port: 5432,
        readerWeight: 'round-robin',
      },
      lag: {
        toleranceSeconds: lagTolerance,
        monitoring: true,
        alertThreshold: lagTolerance * 2,
        actionOnLagExceeded: 'remove-from-rotation',
      },
      failover: {
        priority: count > 1 ? 'lowest-lag' : 'promote-replica',
        autoFailover: true,
        maxDataLoss: '5s',
      },
    };
  }

  // ─── Database Sharding Configuration ───────────────────────────

  generateShardingConfig(options: { shardKey?: string; shardCount?: number; routing?: 'range' | 'hash' | 'geo' } = {}): Record<string, any> {
    const shardKey = options.shardKey || 'org_id';
    const shardCount = options.shardCount || 4;
    const routing = options.routing || 'hash';
    return {
      enabled: true,
      strategy: 'application-level',
      shardKey,
      shardCount,
      routing,
      shards: Array.from({ length: shardCount }, (_, i) => ({
        id: `shard-${i + 1}`,
        name: `sukit_shard_${i + 1}`,
        host: `sukit-shard-${i + 1}.cluster-abcdefghij.us-east-1.rds.amazonaws.com`,
        port: 5432,
        database: `sukit_shard_${i + 1}`,
        weight: 1,
        maxConnections: 100,
        ranges: routing === 'range' ? { min: Math.floor(i * (2 ** 32 / shardCount)), max: Math.floor((i + 1) * (2 ** 32 / shardCount) - 1) } : undefined,
        hashRing: routing === 'hash' ? { position: Math.floor((i / shardCount) * 2 ** 32), replicas: 3 } : undefined,
      })),
      routingConfig: {
        type: routing,
        hashFunction: routing === 'hash' ? 'murmur3_32' : undefined,
        rangeFunction: routing === 'range' ? 'modular' : undefined,
        consistentHashing: routing === 'hash',
        virtualNodes: 128,
      },
      rebalancing: {
        enabled: true,
        threshold: 0.2,
        maxConcurrent: 1,
        schedule: 'off-peak',
      },
      connectionManagement: {
        poolSize: 10,
        maxRetries: 3,
        retryDelay: 100,
        healthCheckInterval: 30,
      },
    };
  }

  // ─── Background Job Queue (Bull) Configuration ─────────────────

  generateBullConfig(options: { redisUrl?: string; prefix?: string; concurrency?: number } = {}): Record<string, any> {
    const redisUrl = options.redisUrl || process.env.REDIS_URL || 'redis://localhost:6379';
    return {
      connection: {
        url: redisUrl,
        enableReadyCheck: true,
        maxRetriesPerRequest: null,
        retryStrategy: (times: number) => Math.min(times * 100, 10000),
      },
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { age: 86400, count: 1000 },
        removeOnFail: { age: 604800, count: 500 },
        timeout: 300000,
      },
      settings: {
        lockDuration: 30000,
        lockRenewTime: 15000,
        stalledInterval: 30000,
        maxStalledCount: 2,
        guardInterval: 5000,
        retryProcessDelay: 5000,
      },
      queues: {
        'media-processing': { concurrency: options.concurrency || 3, description: 'Image/video optimization, thumbnail generation, format conversion' },
        'email': { concurrency: 5, description: 'Transactional emails, notifications, digests' },
        'export': { concurrency: 2, description: 'Site export (ZIP, static HTML, Next.js project)' },
        'deployment': { concurrency: 1, description: 'Site deployment to hosting providers' },
        'backup': { concurrency: 1, description: 'Automated database and media backups' },
        'analytics': { concurrency: 2, description: 'Analytics processing, aggregation, report generation' },
        'webhooks': { concurrency: 10, description: 'Outgoing webhook delivery with retry' },
        'search-index': { concurrency: 1, description: 'Search index rebuild and updates' },
        'cache-warm': { concurrency: 3, description: 'Cache warming for frequently accessed pages' },
        'audit-log': { concurrency: 2, description: 'Audit log aggregation and archival' },
      },
      jobTypes: [
        { type: 'image-optimize', queue: 'media-processing', priority: 10, timeout: 120000 },
        { type: 'video-transcode', queue: 'media-processing', priority: 5, timeout: 600000 },
        { type: 'send-email', queue: 'email', priority: 8, timeout: 30000 },
        { type: 'export-site', queue: 'export', priority: 6, timeout: 300000 },
        { type: 'deploy-site', queue: 'deployment', priority: 9, timeout: 600000 },
        { type: 'run-backup', queue: 'backup', priority: 3, timeout: 1800000 },
        { type: 'aggregate-analytics', queue: 'analytics', priority: 4, timeout: 600000 },
        { type: 'send-webhook', queue: 'webhooks', priority: 7, timeout: 30000 },
        { type: 'rebuild-search-index', queue: 'search-index', priority: 2, timeout: 1800000 },
        { type: 'warm-cache', queue: 'cache-warm', priority: 1, timeout: 600000 },
      ],
      workers: {
        defaultConcurrency: options.concurrency || 5,
        maxMemory: '512MB',
        gracefullShutdown: true,
        shutdownTimeout: 30000,
      },
      monitoring: {
        enabled: true,
        metricsInterval: 30,
        failedJobAlertThreshold: 10,
        stalledJobAlertThreshold: 5,
      },
    };
  }

  // ─── Auto-Scaling Configuration ────────────────────────────────

  generateAutoScalingConfig(options: { minReplicas?: number; maxReplicas?: number; policies?: ('cpu' | 'memory' | 'requests')[] } = {}): Record<string, any> {
    const policies = options.policies || ['cpu', 'memory', 'requests'];
    return {
      enabled: true,
      minReplicas: options.minReplicas || 2,
      maxReplicas: options.maxReplicas || 20,
      cooldown: { scaleUp: 60, scaleDown: 300 },
      policies: [
        ...(policies.includes('cpu') ? [{
          name: 'cpu-utilization',
          type: 'Resource',
          resource: { name: 'cpu', target: { type: 'Utilization', averageUtilization: 70 } },
          scaleUp: { stabilizationWindow: 60, policies: [{ value: 2, period: 60 }] },
          scaleDown: { stabilizationWindow: 300, policies: [{ value: 1, period: 120 }] },
        }] : []),
        ...(policies.includes('memory') ? [{
          name: 'memory-utilization',
          type: 'Resource',
          resource: { name: 'memory', target: { type: 'Utilization', averageUtilization: 75 } },
          scaleUp: { stabilizationWindow: 120, policies: [{ value: 1, period: 60 }] },
          scaleDown: { stabilizationWindow: 300, policies: [{ value: 1, period: 180 }] },
        }] : []),
        ...(policies.includes('requests') ? [{
          name: 'requests-per-second',
          type: 'Pods',
          metric: { name: 'http_requests_per_second', target: { type: 'AverageValue', averageValue: '1000' } },
          scaleUp: { stabilizationWindow: 60, policies: [{ value: 4, period: 60 }] },
          scaleDown: { stabilizationWindow: 300, policies: [{ value: 2, period: 120 }] },
        }] : []),
      ],
      predictiveScaling: {
        enabled: true,
        model: 'prophet',
        lookbackWindow: '7d',
        forecastHorizon: '24h',
        metrics: ['traffic', 'cpu', 'memory'],
        schedule: '0 */4 * * *',
      },
      clusterAutoscaler: {
        enabled: true,
        minNodes: 3,
        maxNodes: 30,
        expander: 'least-waste',
        scaleDownDelayAfterAdd: '10m',
        scaleDownUnneededTime: '10m',
      },
    };
  }

  // ─── Edge Caching Configuration ────────────────────────────────

  generateEdgeCacheConfig(options: { provider?: 'cloudflare' | 'akamai' | 'fastly' | 'cloudfront'; ttls?: Record<string, number>; cacheKeys?: string[] } = {}): Record<string, any> {
    const provider = options.provider || 'cloudflare';
    return {
      enabled: true,
      provider,
      zones: provider === 'cloudflare' ? ['sukit.dev', 'app.sukit.dev', 'cdn.sukit.dev'] : undefined,
      ttls: options.ttls || {
        'text/html': 60,
        'text/css': 31536000,
        'application/javascript': 31536000,
        'image/*': 86400,
        'image/svg+xml': 86400,
        'font/*': 31536000,
        'application/json': 10,
        'application/pdf': 3600,
        'video/*': 3600,
      },
      cacheKeys: options.cacheKeys || [
        'host',
        'path',
        'query',
        'accept-encoding',
        'accept-language',
      ],
      bypassRules: [
        { path: '/api/*', reason: 'Dynamic API responses' },
        { path: '/_next/data/*', reason: 'Next.js data routes' },
        { path: '/admin/*', reason: 'Admin panel' },
        { path: '/auth/*', reason: 'Authentication endpoints' },
        { path: '/sites/preview/*', reason: 'Site preview' },
      ],
      surgeProtection: {
        enabled: true,
        maxRequestsPerSecond: 10000,
        maxBandwidthPerSecond: '5Gbps',
        action: 'challenge',
      },
      purging: {
        method: provider === 'cloudflare' ? 'purgeByTags' : provider === 'fastly' ? 'purgeByKey' : 'purgeByPath',
        batchLimit: 50,
        maxPerMinute: 500,
      },
      customCacheKeys: [
        { template: '${host}${path}?v=${env.DEPLOY_ID}', description: 'Static assets with deploy version' },
        { template: '${host}${path}?lang=${accept_language}', description: 'Language-specific content' },
      ],
      serveStale: {
        enabled: true,
        staleWhileRevalidate: 86400,
        staleIfError: 604800,
      },
    };
  }

  // ─── Origin Shield Configuration ───────────────────────────────

  generateOriginShieldConfig(options: { shieldRegions?: string[]; shieldToOriginRatio?: number } = {}): Record<string, any> {
    const shieldRegions = options.shieldRegions || ['us-east-1', 'eu-west-1', 'ap-southeast-1'];
    return {
      enabled: true,
      shieldRegions,
      shieldToOriginRatio: options.shieldToOriginRatio || 3,
      shieldPolicies: shieldRegions.map(region => ({
        region,
        shieldEndpoint: `shield-${region}.sukit.dev`,
        originEndpoint: `origin-${region}.sukit.dev`,
        maxCacheSize: '100GB',
        maxFileSize: '500MB',
        popularityThreshold: 5,
        evictionPolicy: 'LRU',
        maxAge: 86400,
      })),
      shieldingRules: [
        { match: '/static/*', shield: 'all-regions', priority: 1 },
        { match: '/images/*', shield: 'all-regions', priority: 2 },
        { match: '/fonts/*', shield: 'closest-region', priority: 3 },
        { match: '/api/*', shield: 'none', priority: 10 },
      ],
      performance: {
        shieldHitRatio: '85-95%',
        originOffload: '70-80%',
        p95LatencyImprovement: '40-60%',
      },
      fallback: {
        onShieldFailure: 'bypass-to-origin',
        healthCheckInterval: 10,
        maxRetries: 3,
      },
    };
  }

  getExtendedMetrics() {
    return {
      ...this.getMetrics(),
      pwaEnabled: this.config.enablePwa,
      lazyLoadingEnabled: this.config.enableLazyLoading,
      webpDelivery: this.config.enableWebpDelivery,
      avifDelivery: this.config.enableAvifDelivery,
      blurhashEnabled: this.config.enableBlurhash,
      rumEnabled: this.config.enableRum,
      rumSampleRate: this.config.rumSampleRate,
      cacheWarmingEnabled: this.config.enableCacheWarming,
      bundleMonitoringEnabled: this.config.enableBundleMonitoring,
      imageCdnEnabled: this.config.enableImageCdn,
      edgeCachingEnabled: this.config.enableEdgeCaching,
      performanceBudget: this.config.performanceBudget,
    };
  }
}
