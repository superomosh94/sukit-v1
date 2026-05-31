import React, { useState, useEffect } from 'react';
import { Calendar, User, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const PostsLoop = ({ 
    posts = [], 
    layout = 'grid',
    columns = 3,
    showPagination = true,
    postsPerPage = 6,
    showAuthor = true,
    showDate = true,
    showCategories = true,
    className 
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [paginatedPosts, setPaginatedPosts] = useState([]);

    useEffect(() => {
        const start = (currentPage - 1) * postsPerPage;
        const end = start + postsPerPage;
        setPaginatedPosts(posts.slice(start, end));
    }, [posts, currentPage, postsPerPage]);

    const totalPages = Math.ceil(posts.length / postsPerPage);

    const gridCols = {
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    };

    if (layout === 'list') {
        return (
            <div className={cn('space-y-6', className)}>
                {paginatedPosts.map((post, idx) => (
                    <article key={idx} className="flex flex-col md:flex-row gap-4 bg-surface border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        {post.featuredImage && (
                            <img src={post.featuredImage} alt={post.title} className="w-full md:w-48 h-48 object-cover" />
                        )}
                        <div className="flex-1 p-4">
                            <h3 className="text-xl font-semibold text-text-primary hover:text-primary-500 transition-colors">
                                <a href={`/post/${post.slug}`}>{post.title}</a>
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-text-secondary">
                                {showDate && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(post.date).toLocaleDateString()}
                                    </span>
                                )}
                                {showAuthor && (
                                    <span className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {post.author}
                                    </span>
                                )}
                                {showCategories && post.categories && (
                                    <span className="flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        {post.categories.join(', ')}
                                    </span>
                                )}
                            </div>
                            <p className="text-text-secondary mt-3 line-clamp-3">{post.excerpt}</p>
                            <a href={`/post/${post.slug}`} className="inline-block mt-4 text-primary-500 hover:underline">
                                Read More →
                            </a>
                        </div>
                    </article>
                ))}
                
                {showPagination && totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-border text-text-secondary hover:bg-surface-light disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 text-text-primary">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-border text-text-secondary hover:bg-surface-light disabled:opacity-50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={cn('space-y-6', className)}>
            <div className={cn('grid gap-6', gridCols[columns])}>
                {paginatedPosts.map((post, idx) => (
                    <article key={idx} className="bg-surface border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group">
                        {post.featuredImage && (
                            <div className="relative overflow-hidden">
                                <img 
                                    src={post.featuredImage} 
                                    alt={post.title} 
                                    className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                                />
                            </div>
                        )}
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-text-primary hover:text-primary-500 transition-colors line-clamp-2">
                                <a href={`/post/${post.slug}`}>{post.title}</a>
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-secondary">
                                {showDate && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(post.date).toLocaleDateString()}
                                    </span>
                                )}
                                {showAuthor && (
                                    <span className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {post.author}
                                    </span>
                                )}
                            </div>
                            <p className="text-text-secondary mt-2 text-sm line-clamp-3">{post.excerpt}</p>
                            <a href={`/post/${post.slug}`} className="inline-block mt-3 text-sm text-primary-500 hover:underline">
                                Read More →
                            </a>
                        </div>
                    </article>
                ))}
            </div>
            
            {showPagination && totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-border text-text-secondary hover:bg-surface-light disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={cn(
                                'w-8 h-8 rounded-lg transition-colors',
                                currentPage === i + 1
                                    ? 'bg-primary-500 text-white'
                                    : 'border border-border text-text-secondary hover:bg-surface-light'
                            )}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-border text-text-secondary hover:bg-surface-light disabled:opacity-50"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

PostsLoop.displayName = 'PostsLoop';
export default PostsLoop;