import React, { useState, useCallback } from 'react';
import { Search, Star, Clock, Grid, X } from 'lucide-react';

export interface BlockTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail?: string;
  tags: string[];
  isFavorite?: boolean;
  lastUsed?: Date;
  data: any;
}

export interface BlockTemplateLibraryProps {
  templates: BlockTemplate[];
  onSelectTemplate: (template: BlockTemplate) => void;
  onToggleFavorite: (id: string) => void;
  onSearch: (query: string) => void;
}

export function BlockTemplateLibrary({
  templates,
  onSelectTemplate,
  onToggleFavorite,
  onSearch,
}: BlockTemplateLibraryProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'recent'>(
    'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(templates.map((t) => t.category)));

  const filtered = templates.filter((t) => {
    if (activeTab === 'favorites' && !t.isFavorite) return false;
    if (
      searchQuery &&
      !t.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.tags.some((tag) => tag.includes(searchQuery))
    )
      return false;
    if (selectedCategory && t.category !== selectedCategory) return false;
    return true;
  });

  const recentTemplates = [...templates]
    .filter((t) => t.lastUsed)
    .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
    .slice(0, 10);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="Search blocks..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-muted rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 px-3 py-2 text-xs font-medium ${activeTab === 'all' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}
        >
          <Grid size={14} className="inline mr-1" />
          All
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 px-3 py-2 text-xs font-medium ${activeTab === 'favorites' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}
        >
          <Star size={14} className="inline mr-1" />
          Favorites
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`flex-1 px-3 py-2 text-xs font-medium ${activeTab === 'recent' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}
        >
          <Clock size={14} className="inline mr-1" />
          Recent
        </button>
      </div>

      {activeTab === 'recent' ? (
        <div className="flex-1 overflow-auto p-2">
          {recentTemplates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recently used blocks
            </p>
          ) : (
            recentTemplates.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onSelect={onSelectTemplate}
                onToggleFavorite={onToggleFavorite}
              />
            ))
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No blocks found
            </p>
          ) : (
            filtered.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onSelect={onSelectTemplate}
                onToggleFavorite={onToggleFavorite}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  onSelect,
  onToggleFavorite,
}: {
  template: BlockTemplate;
  onSelect: (t: BlockTemplate) => void;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <div
      className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer group transition-colors"
      onClick={() => onSelect(template)}
    >
      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt=""
            className="w-full h-full object-cover rounded"
          />
        ) : (
          template.name[0]
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{template.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {template.description}
        </p>
        <div className="flex gap-1 mt-0.5">
          {template.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[9px] px-1 py-0.5 bg-muted rounded text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(template.id);
        }}
        className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${template.isFavorite ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'}`}
      >
        <Star size={14} />
      </button>
    </div>
  );
}
