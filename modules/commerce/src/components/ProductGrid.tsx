'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useCommerceStore, type Product } from '../stores/commerceStore';
import { cn } from '../utils/cn';

interface ProductGridProps {
  siteId?: string;
  category?: string;
  limit?: number;
  className?: string;
}

export function ProductGrid({
  siteId,
  category,
  limit = 12,
  className,
}: ProductGridProps) {
  const products = useCommerceStore((s) => s.products);
  const setProducts = useCommerceStore((s) => s.setProducts);
  const addToCart = useCommerceStore((s) => s.addToCart);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (limit) params.set('limit', String(limit));
        const res = await fetch(`/api/commerce/${siteId}/products?${params}`);
        const data = await res.json();
        setProducts(data.products ?? []);
      } catch {}
      setLoading(false);
    };
    if (siteId) fetchProducts();
  }, [siteId, category, limit]);

  if (loading) {
    return (
      <div className={cn('grid grid-cols-3 gap-4', className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border bg-card p-4">
            <div className="aspect-square rounded-md bg-muted mb-3" />
            <div className="h-4 w-3/4 rounded bg-muted mb-2" />
            <div className="h-4 w-1/2 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-3 gap-4', className)}>
      {products.map((product) => (
        <div
          key={product.id}
          className="group relative rounded-lg border bg-card overflow-hidden transition-shadow hover:shadow-lg"
        >
          <div className="aspect-square overflow-hidden bg-muted">
            {product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="text-sm font-medium truncate">{product.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {product.description}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">
                  ${product.price.toFixed(2)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    ${product.compareAtPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <button
                onClick={() =>
                  addToCart({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    image: product.images[0] ?? '',
                  })
                }
                className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <ShoppingCart className="size-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
