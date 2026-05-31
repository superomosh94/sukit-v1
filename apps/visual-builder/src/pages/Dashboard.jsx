import React, { useState } from 'react';
import { FolderOpen, Box, Settings, TrendingUp, Plus, Upload, FileText, Palette, BarChart3 } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import RecentProjectsList from '../components/dashboard/RecentProjectsList';
import QuickActions from '../components/dashboard/QuickActions';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import GettingStarted from '../components/dashboard/GettingStarted';
import AnnouncementBanner from '../components/dashboard/AnnouncementBanner';
import NewProjectDialog from '../components/dashboard/NewProjectDialog';
import SiteAnalytics from '../components/dashboard/SiteAnalytics';

const Dashboard = () => {
  const [showNewProject, setShowNewProject] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [stats, setStats] = useState({ projects: 12, components: 45, templates: 8, usage: 89 });
  const [recentProjects, setRecentProjects] = useState([
    { id: 1, name: 'E-commerce Store', lastEdited: '2 hours ago', pages: 8 },
    { id: 2, name: 'Portfolio Website', lastEdited: '1 day ago', pages: 5 },
    { id: 3, name: 'Admin Dashboard', lastEdited: '3 days ago', pages: 12 },
  ]);
  const [activities, setActivities] = useState([
    { type: 'success', message: 'Project "E-commerce Store" deployed successfully', time: '2 hours ago' },
    { type: 'edit', message: 'Updated homepage layout', time: '5 hours ago' },
    { type: 'deploy', message: 'Published changes to production', time: '1 day ago' },
  ]);

  const handleCreateProject = (projectData) => {
    const newProject = { id: Date.now(), name: projectData.name, lastEdited: 'just now', pages: 0 };
    setRecentProjects([newProject, ...recentProjects]);
    setStats({ ...stats, projects: stats.projects + 1 });
  };

  return (
    <div className="p-6 space-y-6">
      {showBanner && (
        <AnnouncementBanner
          message="New update! Check out the new AI-powered component generator and Site Analytics."
          onDismiss={() => setShowBanner(false)}
        />
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-1">Welcome back! Here's what's happening with your projects.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
          <button
            onClick={() => setShowNewProject(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      {showAnalytics && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <SiteAnalytics />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Projects" value={stats.projects} icon={FolderOpen} trend="up" trendValue="2" color="primary" />
        <StatsCard title="Components" value={stats.components} icon={Box} trend="up" trendValue="5" color="secondary" />
        <StatsCard title="Templates" value={stats.templates} icon={Settings} color="warning" />
        <StatsCard title="Usage" value={`${stats.usage}%`} icon={TrendingUp} trend="up" trendValue="12%" color="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentProjectsList projects={recentProjects} />
          <ActivityFeed activities={activities} />
        </div>
        <div className="space-y-6">
          <QuickActions
            onNewProject={() => setShowNewProject(true)}
            onImport={() => console.log('Import')}
            onSettings={() => console.log('Settings')}
            onNewPage={() => console.log('New page')}
            onThemeDesign={() => console.log('Theme')}
            onComponentLibrary={() => console.log('Components')}
          />
          <GettingStarted />
        </div>
      </div>

      <NewProjectDialog
        isOpen={showNewProject}
        onClose={() => setShowNewProject(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
};

export default Dashboard;
