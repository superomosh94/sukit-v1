import React from 'react';
import ComponentCard from './ComponentCard';
import { useComponentStore } from '../../stores/componentStore';

/**
 * FavoritesList displays only the favorited components.
 */
const FavoritesList = () => {
  const { components, favorites, viewMode, toggleFavorite } = useComponentStore();
  const favoritedComponents = components.filter(c => favorites.includes(c.id));

  if (favoritedComponents.length === 0) {
    return <p className="text-text-secondary">No favorites yet.</p>;
  }

  return (
    <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
      {favoritedComponents.map(c => (
        <ComponentCard
          key={c.id}
          component={c}
          onPreview={useComponentStore.getState().setSelectedComponent}
          onAdd={() => console.log('Add to canvas', c)}
          isFavorite={true}
          onToggleFavorite={() => toggleFavorite(c.id)}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
};

export default FavoritesList;
