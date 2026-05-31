import React, { useState } from 'react';
import { FileText, Search, Plus, Edit2, Trash2, Eye, Calendar, User, Tag, MoreHorizontal } from 'lucide-react';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';

const PostsManager = () => {
  const [posts, setPosts] = useState([
    { id: '1', title: 'Getting Started with SuKit', category: 'Tutorial', status: 'published', author: 'John', views: 1234, publishedAt: '2024-01-15' },
    { id: '2', title: 'Building Responsive Layouts', category: 'Design', status: 'published', author: 'Jane', views: 892, publishedAt: '2024-01-20' },
    { id: '3', title: 'Plugin Development Guide', category: 'Dev', status: 'draft', author: 'John', views: 0, publishedAt: null },
    { id: '4', title: 'Top 10 Design Tips', category: 'Design', status: 'published', author: 'Jane', views: 2156, publishedAt: '2024-02-01' },
    { id: '5', title: 'Deploying to Production', category: 'Dev', status: 'draft', author: 'John', views: 0, publishedAt: null },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({ title: '', category: 'General', status: 'draft', content: '' });

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (editingPost) {
      setPosts(posts.map(p => p.id === editingPost.id ? { ...p, ...formData } : p));
    } else {
      setPosts([{ ...formData, id: Date.now().toString(), author: 'You', views: 0, publishedAt: formData.status === 'published' ? new Date().toISOString().slice(0, 10) : null }, ...posts]);
    }
    setShowModal(false);
    setEditingPost(null);
    setFormData({ title: '', category: 'General', status: 'draft', content: '' });
  };

  const handleDelete = (id) => setPosts(posts.filter(p => p.id !== id));

  const totalViews = posts.reduce((sum, p) => sum + p.views, 0);

  const statusColors = {
    published: 'text-success-500 bg-success-500/10',
    draft: 'text-warning-500 bg-warning-500/10',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Posts</h1>
          <p className="text-text-secondary mt-1">Manage your blog posts and articles</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-1" /> New Post
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-sm text-text-secondary">Total Posts</p>
          <p className="text-2xl font-bold text-text-primary">{posts.length}</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-sm text-text-secondary">Published</p>
          <p className="text-2xl font-bold text-success-500">{posts.filter(p => p.status === 'published').length}</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-sm text-text-secondary">Total Views</p>
          <p className="text-2xl font-bold text-primary-500">{totalViews}</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input
          type="text"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-light border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Author</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Views</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Published</th>
              <th className="px-4 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(post => (
              <tr key={post.id} className="hover:bg-surface-light">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-primary-500" />
                    </div>
                    <span className="font-medium text-text-primary">{post.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-surface-light text-text-secondary px-2 py-1 rounded">{post.category}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[post.status]}`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary text-sm">{post.author}</td>
                <td className="px-4 py-3 text-text-secondary text-sm">{post.views.toLocaleString()}</td>
                <td className="px-4 py-3 text-text-secondary text-sm">{post.publishedAt || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingPost(post); setFormData(post); setShowModal(true); }} className="p-1.5 rounded hover:bg-surface-light">
                      <Edit2 className="w-3.5 h-3.5 text-text-secondary" />
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded hover:bg-danger-500/10">
                      <Trash2 className="w-3.5 h-3.5 text-danger-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <p className="text-text-primary mb-1">No posts found</p>
          <p className="text-sm text-text-secondary">Create your first blog post</p>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingPost(null); setFormData({ title: '', category: 'General', status: 'draft', content: '' }); }} title={editingPost ? 'Edit Post' : 'New Post'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Post Title</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary">
                <option>General</option>
                <option>Tutorial</option>
                <option>Design</option>
                <option>Dev</option>
                <option>News</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Content</label>
            <textarea rows={6} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary resize-y" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
          <Button variant="primary" onClick={handleSave} className="flex-1">{editingPost ? 'Save Changes' : 'Create Post'}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default PostsManager;
