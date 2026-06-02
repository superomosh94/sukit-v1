import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const templates = await prisma.siteTemplate.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      thumbnail: true,
    },
  });

  const config = {
    templates:
      templates.length > 0
        ? templates.map((t) => ({
            id: t.id,
            name: t.name,
            desc: t.description,
            category: t.category,
            thumbnail: t.thumbnail,
          }))
        : [
            {
              id: 'blank',
              name: 'Blank',
              desc: 'Start from scratch',
              category: 'custom',
            },
            {
              id: 'landing',
              name: 'Landing Page',
              desc: 'Single-page marketing site',
              category: 'marketing',
            },
            {
              id: 'business',
              name: 'Business',
              desc: 'Multi-page business site',
              category: 'business',
            },
            {
              id: 'portfolio',
              name: 'Portfolio',
              desc: 'Showcase your work',
              category: 'portfolio',
            },
            {
              id: 'blog',
              name: 'Blog',
              desc: 'Blog with articles',
              category: 'blog',
            },
            {
              id: 'saas',
              name: 'SaaS',
              desc: 'Software product landing page',
              category: 'saas',
            },
          ],
    webhookEvents: [
      { value: 'site:created', label: 'Site Created' },
      { value: 'site:updated', label: 'Site Updated' },
      { value: 'site:deleted', label: 'Site Deleted' },
      { value: 'page:created', label: 'Page Created' },
      { value: 'page:published', label: 'Page Published' },
      { value: 'page:updated', label: 'Page Updated' },
      { value: 'page:deleted', label: 'Page Deleted' },
      { value: 'media:uploaded', label: 'Media Uploaded' },
      { value: 'module:installed', label: 'Module Installed' },
      { value: 'module:uninstalled', label: 'Module Uninstalled' },
      { value: 'form:submitted', label: 'Form Submitted' },
      { value: 'user:registered', label: 'User Registered' },
      { value: 'backup:completed', label: 'Backup Completed' },
      { value: 'deploy:started', label: 'Deploy Started' },
      { value: 'deploy:success', label: 'Deploy Succeeded' },
      { value: 'deploy:failed', label: 'Deploy Failed' },
      { value: '*', label: 'All Events' },
    ],
    webhookPlatforms: [
      { id: 'slack', name: 'Slack', color: '#4A154B', icon: 'slack' },
      { id: 'discord', name: 'Discord', color: '#5865F2', icon: 'discord' },
      { id: 'teams', name: 'Microsoft Teams', color: '#0072C6', icon: 'teams' },
      { id: 'zapier', name: 'Zapier', color: '#FF4A00', icon: 'zapier' },
      { id: 'make', name: 'Make (Integromat)', color: '#6D28D9', icon: 'make' },
      { id: 'custom', name: 'Custom', color: '#6B7280', icon: 'custom' },
    ],
    deployProviders: [
      {
        id: 'vercel',
        name: 'Vercel',
        description:
          'Zero-config deployment from Git. Auto SSL, preview URLs, and serverless functions.',
        docs: 'https://vercel.com/docs',
      },
      {
        id: 'netlify',
        name: 'Netlify',
        description:
          'Continuous deployment from Git with branch previews, form handling, and edge functions.',
        docs: 'https://netlify.com/docs',
      },
      {
        id: 'cloudflare',
        name: 'Cloudflare Pages',
        description:
          'Edge-deployed static sites with automatic HTTPS, DDoS protection, and Workers integration.',
        docs: 'https://pages.cloudflare.com',
      },
      {
        id: 'github-pages',
        name: 'GitHub Pages',
        description:
          'Free static site hosting directly from GitHub repositories.',
        docs: 'https://pages.github.com',
      },
      {
        id: 'aws-s3',
        name: 'AWS S3 + CloudFront',
        description: 'Host on AWS S3 with CloudFront CDN.',
        docs: 'https://aws.amazon.com/s3',
      },
      {
        id: 'docker',
        name: 'Docker / Self-Hosted',
        description:
          'Containerized deployment via Docker on your own infrastructure.',
        docs: 'https://docker.com',
      },
    ],
    marketplaceCategories: [
      { value: 'ecommerce', label: 'E-Commerce' },
      { value: 'seo', label: 'SEO' },
      { value: 'analytics', label: 'Analytics' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'forms', label: 'Forms' },
      { value: 'social', label: 'Social Media' },
      { value: 'media', label: 'Media' },
      { value: 'builder', label: 'Builder' },
      { value: 'management', label: 'Management' },
      { value: 'ai', label: 'AI' },
      { value: 'chat', label: 'Chat' },
      { value: 'calendar', label: 'Calendar' },
      { value: 'payment', label: 'Payment' },
      { value: 'tool', label: 'Tool' },
      { value: 'other', label: 'Other' },
    ],
    priceModels: [
      { value: 'free', label: 'Free' },
      { value: 'one-time', label: 'One-Time' },
      { value: 'subscription', label: 'Subscription' },
      { value: 'tiered', label: 'Tiered' },
    ],
    paymentMethods: [
      { id: 'stripe', label: 'Credit Card', icon: 'stripe' },
      { id: 'paypal', label: 'PayPal', icon: 'paypal' },
      { id: 'paddle', label: 'Paddle', icon: 'paddle' },
    ],
    popularTags: [
      'analytics',
      'contact-form',
      'social-media',
      'payment',
      'ai',
      'chat',
      'calendar',
      'maps',
      'newsletter',
    ],
    apiKeyPermissions: [
      { value: 'read', label: 'Read', desc: 'View module info and stats' },
      { value: 'write', label: 'Write', desc: 'Update module metadata' },
      {
        value: 'publish',
        label: 'Publish',
        desc: 'Submit new versions and publish',
      },
    ],
    system: {
      version: '1.0.0',
      node: process.version,
      platform: process.platform,
      arch: process.arch,
    },
  };

  return NextResponse.json(config);
}
