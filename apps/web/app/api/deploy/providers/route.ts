import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
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
  ]);
}
