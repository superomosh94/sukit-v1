import type { SukitKernel } from '@sukit/core';
import type {
  DocGenerationRequest,
  DocGenerationResult,
  DocumentSection,
  DocSectionType,
  ScreenshotData,
} from './types';

export class DocumentationGenerator {
  private kernel: SukitKernel;

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
  }

  // ─── Auto-Generated Documentation (Category 9.1) ──────────────

  async generateDocumentation(
    moduleId: string,
    request?: Partial<DocGenerationRequest>
  ): Promise<DocGenerationResult> {
    const defaultRequest: DocGenerationRequest = {
      moduleId,
      sections: [
        'readme',
        'installation',
        'configuration',
        'api',
        'blocks',
        'faq',
        'troubleshooting',
      ],
      includeChangelog: true,
      includeScreenshots: true,
    };

    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/docs/generate`,
      {
        method: 'POST',
        body: JSON.stringify(request || defaultRequest),
      }
    );
    return res.json();
  }

  async generateReadme(moduleId: string): Promise<DocumentSection> {
    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/docs/generate/readme`,
      {
        method: 'POST',
      }
    );
    return res.json();
  }

  async generateInstallationGuide(moduleId: string): Promise<DocumentSection> {
    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/docs/generate/installation`,
      {
        method: 'POST',
      }
    );
    return res.json();
  }

  async generateConfigurationGuide(moduleId: string): Promise<DocumentSection> {
    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/docs/generate/configuration`,
      {
        method: 'POST',
      }
    );
    return res.json();
  }

  async generateAPIReference(moduleId: string): Promise<DocumentSection> {
    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/docs/generate/api`,
      {
        method: 'POST',
      }
    );
    return res.json();
  }

  async generateFAQ(moduleId: string): Promise<{
    faq: { question: string; answer: string }[];
    section: DocumentSection;
  }> {
    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/docs/generate/faq`,
      {
        method: 'POST',
      }
    );
    return res.json();
  }

  async generateTroubleshooting(moduleId: string): Promise<DocumentSection> {
    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/docs/generate/troubleshooting`,
      {
        method: 'POST',
      }
    );
    return res.json();
  }

  async getDocumentation(moduleId: string): Promise<DocumentSection[]> {
    const res = await fetch(`/api/marketplace/modules/${moduleId}/docs`);
    return res.json();
  }

  async saveDocumentation(
    moduleId: string,
    sections: DocumentSection[]
  ): Promise<void> {
    await fetch(`/api/marketplace/modules/${moduleId}/docs`, {
      method: 'PUT',
      body: JSON.stringify({ sections }),
    });
  }

  // ─── Screenshot Management (Category 9.2) ──────────────────────

  async uploadScreenshot(
    file: File,
    caption?: string
  ): Promise<ScreenshotData> {
    const formData = new FormData();
    formData.append('screenshot', file);
    if (caption) formData.append('caption', caption);

    const res = await fetch('/api/marketplace/modules/docs/upload/screenshot', {
      method: 'POST',
      body: formData,
    });
    return res.json();
  }

  async getScreenshots(moduleId: string): Promise<ScreenshotData[]> {
    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/docs/screenshots`
    );
    return res.json();
  }

  async reorderScreenshots(
    moduleId: string,
    screenshotIds: string[]
  ): Promise<void> {
    await fetch(
      `/api/marketplace/modules/${moduleId}/docs/screenshots/reorder`,
      {
        method: 'PUT',
        body: JSON.stringify({ screenshotIds }),
      }
    );
  }

  async updateScreenshotCaption(
    screenshotId: string,
    caption: string
  ): Promise<void> {
    await fetch(`/api/marketplace/modules/docs/screenshots/${screenshotId}`, {
      method: 'PUT',
      body: JSON.stringify({ caption }),
    });
  }

  async deleteScreenshot(screenshotId: string): Promise<void> {
    await fetch(`/api/marketplace/modules/docs/screenshots/${screenshotId}`, {
      method: 'DELETE',
    });
  }

  async embedVideo(
    moduleId: string,
    url: string,
    type: 'youtube' | 'vimeo'
  ): Promise<ScreenshotData> {
    const res = await fetch(`/api/marketplace/modules/${moduleId}/docs/video`, {
      method: 'POST',
      body: JSON.stringify({ url, type }),
    });
    return res.json();
  }

  // ─── Documentation Editor (Category 9.3) ───────────────────────

  async saveMarkdown(
    moduleId: string,
    markdown: string,
    section: string
  ): Promise<void> {
    await fetch(
      `/api/marketplace/modules/${moduleId}/docs/section/${section}`,
      {
        method: 'PUT',
        body: JSON.stringify({ content: markdown }),
      }
    );
  }

  async renderMarkdown(
    markdown: string
  ): Promise<{
    html: string;
    toc: { id: string; title: string; level: number }[];
  }> {
    const res = await fetch('/api/marketplace/modules/docs/render', {
      method: 'POST',
      body: JSON.stringify({ markdown }),
    });
    return res.json();
  }

  async uploadImage(
    file: File
  ): Promise<{ url: string; width: number; height: number }> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/marketplace/modules/docs/upload/image', {
      method: 'POST',
      body: formData,
    });
    return res.json();
  }

  // ─── Preview ───────────────────────────────────────────────────

  async getPreview(moduleId: string): Promise<{
    rendered: string;
    sections: { type: string; title: string; wordCount: number }[];
  }> {
    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/docs/preview`
    );
    return res.json();
  }

  // ─── Export ────────────────────────────────────────────────────

  async exportDocumentation(
    moduleId: string,
    format: 'markdown' | 'html' | 'pdf'
  ): Promise<Blob> {
    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/docs/export?format=${format}`
    );
    return res.blob();
  }
}
