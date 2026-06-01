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
  preconnectOrigins: string[];
  criticalCSS: string;
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
  preconnectOrigins: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ],
  criticalCSS: '',
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
}
