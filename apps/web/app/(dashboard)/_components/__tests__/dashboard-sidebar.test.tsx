import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { DashboardSidebar } from '../dashboard-sidebar';
import { mockUsePathname } from '@/vitest.setup';

vi.mock('next/link', () => ({
  default: ({ children, href, className }: any) =>
    React.createElement('a', { href, className }, children),
}));

describe('DashboardSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue('/sites');
  });

  it('renders the SUKIT logo and brand', () => {
    render(React.createElement(DashboardSidebar));
    expect(screen.getByText('SUKIT')).toBeInTheDocument();
  });

  it('renders all top-level navigation groups', () => {
    render(React.createElement(DashboardSidebar));
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Sites')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Popups')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('Deploy')).toBeInTheDocument();
    expect(screen.getByText('Tools')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders all Sites child navigation items', async () => {
    render(React.createElement(DashboardSidebar));
    expect(await screen.findByText('All Sites')).toBeInTheDocument();
    expect(screen.getByText('Builder')).toBeInTheDocument();
    expect(screen.getByText('Themes')).toBeInTheDocument();
    expect(screen.getByText('Pages')).toBeInTheDocument();
    expect(screen.getByText('Media')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getByText('Backups')).toBeInTheDocument();
    expect(screen.getByText('Trash')).toBeInTheDocument();
  });

  it('renders bottom links (Back to Site, Visit Blog)', () => {
    render(React.createElement(DashboardSidebar));
    expect(screen.getByText('Back to Site')).toBeInTheDocument();
    expect(screen.getByText('Visit Blog')).toBeInTheDocument();
  });

  it('Sites child links point to correct hrefs', async () => {
    render(React.createElement(DashboardSidebar));
    await screen.findByText('All Sites');
    const sitesLinks = screen.getAllByRole('link');
    const sitesChildren = [
      { label: 'All Sites', href: '/sites' },
      { label: 'Builder', href: '/builder' },
      { label: 'Themes', href: '/themes' },
      { label: 'Pages', href: '/sites/pages' },
      { label: 'Media', href: '/sites/media' },
      { label: 'Team', href: '/team' },
      { label: 'Backups', href: '/backups' },
      { label: 'Trash', href: '/sites/trash' },
    ];
    for (const child of sitesChildren) {
      const link = sitesLinks.find(
        (l) => l.textContent?.includes(child.label)
      );
      expect(link).toBeDefined();
      expect(link).toHaveAttribute('href', child.href);
    }
  });

  it('highlights the active route', async () => {
    render(React.createElement(DashboardSidebar));
    const activeLink = (await screen.findByText('All Sites')).closest('a');
    expect(activeLink?.className).toContain('bg-accent');
  });

  it('toggles expand/collapse for Sites section', async () => {
    render(React.createElement(DashboardSidebar));
    await screen.findByText('All Sites');
    const sitesHeading = screen.getByText('Sites');
    const toggleBtn = sitesHeading.closest('div')?.parentElement
      ?.querySelector('button');
    expect(toggleBtn).toBeTruthy();
    const initialTitle = toggleBtn!.getAttribute('title');
    fireEvent.click(toggleBtn!);
    const newTitle = toggleBtn!.getAttribute('title');
    expect(newTitle).not.toBe(initialTitle);
  });

  it('expands parent group when its child is active', async () => {
    mockUsePathname.mockReturnValue('/builder');
    render(React.createElement(DashboardSidebar));
    expect(await screen.findByText('Builder')).toBeInTheDocument();
  });

  it('renders all Content child items', () => {
    render(React.createElement(DashboardSidebar));
    expect(screen.getByText('Posts')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('Comments')).toBeInTheDocument();
    expect(screen.getByText('Forms')).toBeInTheDocument();
  });

  it('renders all Popup child items', () => {
    render(React.createElement(DashboardSidebar));
    expect(screen.getByText('All Popups')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('renders all Developer child items', () => {
    render(React.createElement(DashboardSidebar));
    expect(screen.getByText('Code Editor')).toBeInTheDocument();
    expect(screen.getByText('Modules')).toBeInTheDocument();
    expect(screen.getByText('Blocks')).toBeInTheDocument();
    expect(screen.getByText('Module Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Plugins')).toBeInTheDocument();
    expect(screen.getByText('Plugin Registry')).toBeInTheDocument();
    expect(screen.getByText('Webhooks')).toBeInTheDocument();
  });

  it('renders all Deploy child items', () => {
    render(React.createElement(DashboardSidebar));
    expect(screen.getByText('Providers')).toBeInTheDocument();
    expect(screen.getByText('CI/CD')).toBeInTheDocument();
    expect(screen.getByText('Secrets')).toBeInTheDocument();
  });

  it('renders all Tools child items', () => {
    render(React.createElement(DashboardSidebar));
    expect(screen.getByText('Audit Log')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('SEO')).toBeInTheDocument();
    expect(screen.getByText('Cron Jobs')).toBeInTheDocument();
  });

  it('renders all Settings child items', () => {
    render(React.createElement(DashboardSidebar));
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Widgets')).toBeInTheDocument();
    expect(screen.getByText('API Keys')).toBeInTheDocument();
  });
});

describe('DashboardSidebar nav item links', () => {
  it('all Sites child hrefs are unique', () => {
    render(React.createElement(DashboardSidebar));
    const links = screen.getAllByRole('link');
    const sitesHrefs = [
      '/sites', '/builder', '/themes', '/sites/pages',
      '/sites/media', '/team', '/backups', '/sites/trash',
    ];
    const found = links
      .map((l) => l.getAttribute('href'))
      .filter((h) => h && sitesHrefs.includes(h));
    const unique = new Set(found);
    expect(unique.size).toBe(sitesHrefs.length);
  });

  it('Dashboard link points to /dashboard', () => {
    render(React.createElement(DashboardSidebar));
    const links = screen.getAllByRole('link');
    const dashLink = links.find((l) => l.textContent === 'Dashboard');
    expect(dashLink).toHaveAttribute('href', '/dashboard');
  });
});
