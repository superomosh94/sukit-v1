import React, { useState } from 'react';
import { Star, Eye, MoreVertical, Copy, Layout, Type, Image, FormInput, Table, Menu, ShoppingBag, Package } from 'lucide-react';
import Tooltip from '../shared/Tooltip';
import { cn } from '../../utils/cn';

/**
 * ComponentCard displays a component preview with actions.
 * Supports "grid" and "list" view modes.
 */
const ComponentCard = ({
  component,
  onPreview,
  onAdd,
  isFavorite,
  onToggleFavorite,
  viewMode = 'grid',
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getCategoryIcon = (className = 'w-5 h-5 text-primary-500') => {
    switch (component.category) {
      case 'layout': return <Layout className={className} />;
      case 'typography': return <Type className={className} />;
      case 'media': return <Image className={className} />;
      case 'forms': return <FormInput className={className} />;
      case 'data': return <Table className={className} />;
      case 'navigation': return <Menu className={className} />;
      case 'ecommerce': return <ShoppingBag className={className} />;
      default: return <Package className={className} />;
    }
  };

  const CardContainer = ({ children }) => (
    <div className={cn(
      'bg-surface border border-border rounded-lg shadow-sm transition-colors hover:border-primary-500',
      viewMode === 'grid' ? 'p-4' : 'flex items-center p-3'
    )}>
      {children}
    </div>
  );

  // Grid layout
  if (viewMode === 'grid') {
    return (
      <CardContainer>
        <div className="flex justify-between items-start mb-2">
          <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center" aria-label={component.category}>{getCategoryIcon()}</div>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-text-secondary hover:text-text-primary rounded"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
        <h3 className="font-medium text-text-primary mb-1 truncate" title={component.name}>{component.name}</h3>
        <p className="text-sm text-text-secondary mb-3 line-clamp-2" title={component.description}>{component.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Tooltip content="Preview">
              <button onClick={() => onPreview(component)} className="p-1 text-text-secondary hover:text-primary-500 rounded">
                <Eye className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Add to Canvas">
              <button onClick={onAdd} className="p-1 text-text-secondary hover:text-primary-500 rounded">
                <Copy className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
          <Tooltip content={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}>
            <button
              onClick={() => onToggleFavorite(component.id)}
              className={cn('p-1 rounded', isFavorite ? 'text-primary-500' : 'text-text-secondary hover:text-primary-500')}
            >
              <Star className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
        {showMenu && (
          <div className="absolute mt-2 w-40 bg-surface border border-border rounded shadow-lg z-10">
            <ul className="py-1">
              <li>
                <button className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-surface-light">Edit</button>
              </li>
              <li>
                <button className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-surface-light">Delete</button>
              </li>
            </ul>
          </div>
        )}
      </CardContainer>
    );
  }

  // List layout
  return (
    <CardContainer>
      <div className="flex items-center w-full">
        <span className="text-2xl mr-4" aria-label={component.category}>{getCategoryIcon()}</span>
        <div className="flex-1">
          <h3 className="font-medium text-text-primary" title={component.name}>{component.name}</h3>
          <p className="text-sm text-text-secondary" title={component.description}>{component.description}</p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <Tooltip content="Preview">
            <button onClick={() => onPreview(component)} className="p-1 text-text-secondary hover:text-primary-500 rounded">
              <Eye className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip content="Add to Canvas">
            <button onClick={onAdd} className="p-1 text-text-secondary hover:text-primary-500 rounded">
              <Copy className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip content={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}>
            <button
              onClick={() => onToggleFavorite(component.id)}
              className={cn('p-1 rounded', isFavorite ? 'text-primary-500' : 'text-text-secondary hover:text-primary-500')}
            >
              <Star className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </CardContainer>
  );
};

export default ComponentCard;
