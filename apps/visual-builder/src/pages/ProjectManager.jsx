import React, { useState } from 'react';
import { FolderOpen, Plus, Search, Grid3X3, List, Clock, MoreHorizontal } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import Button from '../components/shared/Button';

const ProjectManager = () => {
  const { projects } = useProjectStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const filteredProjects = (projects || []).filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">My Projects</h1>
          <p className="text-text-secondary mt-1">Manage your SuKit projects</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-1" /> New Project
          </Button>
        </div>
      </header>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            aria-label="Search projects"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-surface text-text-secondary'} transition-colors`}>
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-surface text-text-secondary'} transition-colors`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="w-16 h-16 mx-auto text-text-secondary mb-4" />
          <p className="text-text-secondary text-lg">No projects yet</p>
          <p className="text-text-secondary text-sm mt-1">Create your first project to get started</p>
          <Button variant="primary" className="mt-4">
            <Plus className="w-4 h-4 mr-1" /> Create Project
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(project => (
            <div key={project.id} className="bg-surface border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="h-32 bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                <FolderOpen className="w-12 h-12 text-primary-300" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-text-primary truncate">{project.name}</h3>
                <p className="text-sm text-text-secondary mt-1 line-clamp-2">{project.description || 'No description'}</p>
                <div className="flex items-center justify-between mt-4 text-xs text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {project.updatedAt || 'Recently'}
                  </span>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-surface-light rounded">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProjects.map(project => (
            <div key={project.id} className="bg-surface border border-border rounded-lg p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FolderOpen className="w-5 h-5 text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-text-primary truncate">{project.name}</h3>
                <p className="text-xs text-text-secondary">{project.updatedAt || 'Recently updated'}</p>
              </div>
              <span className="text-xs text-text-secondary bg-surface-light px-2 py-1 rounded">{project.type || 'Page'}</span>
              <button className="p-1 hover:bg-surface-light rounded">
                <MoreHorizontal className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProjectManager;
