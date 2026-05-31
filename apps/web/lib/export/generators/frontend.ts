import { FileTree } from './file-tree';

export interface FrontendOptions {
  typescript: boolean;
  tailwind: boolean;
  routing: 'react-router';
  includeApiClient: boolean;
}

export interface PageData {
  slug: string;
  title: string;
  isHome: boolean;
  sections: SectionData[];
}

export interface SectionData {
  id: string;
  sectionType: string;
  settings: Record<string, unknown>;
  columns: ColumnData[];
}

export interface ColumnData {
  id: string;
  span: number;
  settings: Record<string, unknown>;
  blocks: BlockData[];
}

export interface BlockData {
  id: string;
  blockType: string;
  props: Record<string, unknown>;
  styles: Record<string, unknown>;
}

export interface SiteData {
  name: string;
  domain?: string;
  settings: Record<string, unknown>;
}

export class ReactViteGenerator {
  async generate(
    site: SiteData,
    pages: PageData[],
    options: FrontendOptions
  ): Promise<FileTree> {
    const files = new FileTree();

    files.add('package.json', this.packageJson());
    files.add('vite.config.ts', this.viteConfig());
    files.add('index.html', this.indexHtml());
    files.add('tsconfig.json', this.tsConfig());
    files.add('tsconfig.node.json', this.tsConfigNode());
    files.add('tailwind.config.js', this.tailwindConfig());
    files.add('postcss.config.js', this.postcssConfig());
    files.add('src/index.css', this.globalStyles());
    files.add('src/main.tsx', this.entryPoint());
    files.add('src/App.tsx', this.appComponent(pages));
    files.add('src/vite-env.d.ts', '/// <reference types="vite/client" />\n');

    for (const page of pages) {
      const name = this.componentName(page.slug);
      files.add(`src/pages/${name}.tsx`, this.pageComponent(page));
    }

    files.add('src/components/layouts/Layout.tsx', this.layout());
    files.add('src/components/layouts/Header.tsx', this.header(site));
    files.add('src/components/layouts/Footer.tsx', this.footer(site));

    const uniqueBlocks = this.collectUniqueBlocks(pages);
    for (const [type] of uniqueBlocks) {
      const sampleBlock = this.findBlockByType(pages, type);
      if (sampleBlock) {
        files.add(
          `src/components/blocks/${type}.tsx`,
          this.blockComponent(sampleBlock)
        );
      }
    }

    if (options.includeApiClient) {
      files.add('src/lib/api.ts', this.apiClient());
    }

    files.add('.env.example', this.envExample());
    files.add('.env', this.envDefault());
    files.add('Dockerfile', this.dockerfile());
    files.add('README.md', this.readme(site));

    return files;
  }

  private packageJson(): string {
    return JSON.stringify(
      {
        name: 'frontend',
        private: true,
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'tsc -b && vite build',
          preview: 'vite preview',
        },
        dependencies: {
          react: '^19.0.0',
          'react-dom': '^19.0.0',
          'react-router-dom': '^6.28.0',
          '@tanstack/react-query': '^5.62.0',
        },
        devDependencies: {
          '@vitejs/plugin-react': '^4.3.0',
          vite: '^6.0.0',
          typescript: '^5.6.0',
          '@types/react': '^19.0.0',
          '@types/react-dom': '^19.0.0',
          tailwindcss: '^3.4.0',
          postcss: '^8.4.0',
          autoprefixer: '^10.4.0',
        },
      },
      null,
      2
    );
  }

  private viteConfig(): string {
    return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { port: 5173, proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: true } } },
});
`;
  }

  private indexHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SUKIT App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
  }

  private tsConfig(): string {
    return JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          isolatedModules: true,
          moduleDetection: 'force',
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
          paths: { '@/*': ['./src/*'] },
        },
        include: ['src'],
      },
      null,
      2
    );
  }

  private tsConfigNode(): string {
    return JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          lib: ['ES2023'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          isolatedModules: true,
          moduleDetection: 'force',
          noEmit: true,
          strict: true,
        },
        include: ['vite.config.ts'],
      },
      null,
      2
    );
  }

  private tailwindConfig(): string {
    return `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
`;
  }

  private postcssConfig(): string {
    return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
  }

  private globalStyles(): string {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
`;
  }

  private entryPoint(): string {
    return `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
`;
  }

  private appComponent(pages: PageData[]): string {
    const homePage = pages.find((p) => p.isHome) || pages[0];
    const otherPages = pages.filter((p) => p !== homePage);

    const lazyImports = otherPages
      .map((p) => {
        const name = this.componentName(p.slug);
        return `const ${name} = React.lazy(() => import('./pages/${name}'));`;
      })
      .join('\n');

    const otherRoutes = otherPages
      .map((p) => {
        const name = this.componentName(p.slug);
        return `      <Route path="/${p.slug}" element={<${name} />} />`;
      })
      .join('\n');

    const homeName = this.componentName(homePage.slug);
    return `import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layouts/Layout';
import { ${homeName} } from './pages/${homeName}';

${lazyImports}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<${homeName} />} />
${otherRoutes}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <h1 className="text-4xl font-bold">404</h1>
              <p className="text-gray-500">Page not found</p>
            </div>
          } />
        </Routes>
      </Suspense>
    </Layout>
  );
}
`;
  }

  private pageComponent(page: PageData): string {
    const name = this.componentName(page.slug);
    const blockTypes = new Set<string>();
    for (const s of page.sections) {
      for (const c of s.columns) {
        for (const b of c.blocks) {
          blockTypes.add(b.blockType);
        }
      }
    }

    const blockImports = Array.from(blockTypes)
      .map((t) => `import { ${t} } from '../components/blocks/${t}';`)
      .join('\n');

    const sectionsJsx = page.sections
      .map((s) => {
        const bg = (s.settings as any).backgroundColor || 'transparent';
        const pt = (s.settings as any).paddingTop ?? 40;
        const pb = (s.settings as any).paddingBottom ?? 40;
        const maxWidth = (s.settings as any).maxWidth || '1200px';

        const columnsJsx = s.columns
          .map((c) => {
            const span = c.span || 12;
            const blocksJsx = c.blocks
              .map(
                (b) =>
                  `          <${b.blockType} {...${JSON.stringify(b.props)}} />`
              )
              .join('\n');
            return `        <div className="col-span-${span}">
${blocksJsx}
        </div>`;
          })
          .join('\n');

        return `      <section style={{ backgroundColor: '${bg}', paddingTop: ${pt}, paddingBottom: ${pb} }}>
        <div style={{ maxWidth: '${maxWidth}', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16 }}>
${columnsJsx}
          </div>
        </div>
      </section>`;
      })
      .join('\n\n');

    return `import React from 'react';
${blockImports}

export const ${name}: React.FC = () => {
  return (
    <main>
${sectionsJsx}
    </main>
  );
};

export default ${name};
`;
  }

  private layout(): string {
    return `import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps { children: React.ReactNode }

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
`;
  }

  private header(site: SiteData): string {
    return `import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-gray-900 hover:text-gray-600 transition-colors">
          ${site.name}
        </Link>
        <nav className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
`;
  }

  private footer(site: SiteData): string {
    return `import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm text-gray-500">
          &copy; ${new Date().getFullYear()} ${site.name}. All rights reserved.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Built with SUKIT
        </p>
      </div>
    </footer>
  );
}
`;
  }

  private blockComponent(block: BlockData): string {
    const propsType = Object.keys(block.props)
      .map(
        (k) =>
          `  ${k}: ${typeof block.props[k] === 'string' ? 'string' : typeof block.props[k] === 'number' ? 'number' : typeof block.props[k] === 'boolean' ? 'boolean' : 'any'};`
      )
      .join('\n');

    return `import React from 'react';

export interface ${block.blockType}Props {
${propsType}
}

export const ${block.blockType}: React.FC<${block.blockType}Props> = (props) => {
  return (
    <div className="py-2">
      {props.content ? (
        typeof props.content === 'string' ? (
          <p>{props.content}</p>
        ) : (
          <div>{JSON.stringify(props.content)}</div>
        )
      ) : (
        <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-400">
          ${block.blockType}
        </div>
      )}
    </div>
  );
};
`;
  }

  private apiClient(): string {
    return `const API_BASE = import.meta.env.VITE_API_URL || '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('auth-token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = \`Bearer \${token}\`;

  const res = await fetch(\`\${API_BASE}/api\${path}\`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || \`HTTP \${res.status}\`);
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(path: string, data: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export default api;
`;
  }

  private envExample(): string {
    return `VITE_API_URL=http://localhost:3001
`;
  }

  private envDefault(): string {
    return 'VITE_API_URL=http://localhost:3001\n';
  }

  private dockerfile(): string {
    return `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;
  }

  private readme(site: SiteData): string {
    const slug = site.name.toLowerCase().replace(/\s+/g, '-');
    return `# ${site.name} - Frontend

React + Vite + TypeScript frontend generated by SUKIT.

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`

Opens at http://localhost:5173. API requests proxy to http://localhost:3001.

## Build

\`\`\`bash
npm run build
npm run preview
\`\`\`

## Docker

\`\`\`bash
docker build -t ${slug}-frontend .
docker run -p 80:80 ${slug}-frontend
\`\`\`
`;
  }

  private componentName(slug: string): string {
    return (
      slug
        .split(/[-_]/)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join('') + 'Page'
    );
  }

  private collectUniqueBlocks(pages: PageData[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const page of pages) {
      for (const s of page.sections) {
        for (const c of s.columns) {
          for (const b of c.blocks) {
            counts.set(b.blockType, (counts.get(b.blockType) || 0) + 1);
          }
        }
      }
    }
    return counts;
  }

  private findBlockByType(
    pages: PageData[],
    type: string
  ): BlockData | undefined {
    for (const page of pages) {
      for (const s of page.sections) {
        for (const c of s.columns) {
          for (const b of c.blocks) {
            if (b.blockType === type) return b;
          }
        }
      }
    }
    return undefined;
  }
}
