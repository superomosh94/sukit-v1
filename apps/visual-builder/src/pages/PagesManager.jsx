import React, { useState } from 'react';
import { FileText, Search, Plus, Edit2, Trash2, Copy, Eye, MoreHorizontal, Star, RotateCcw, Home } from 'lucide-react';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';
import { cn } from '../utils/cn';

const PagesManager = () => {
  const [pages, setPages] = useState([
    { id: '1', title: 'Home', slug: '/', status: 'published', template: 'Default', updatedAt: '2 hours ago', author: 'John', isHomepage: true },
    { id: '2', title: 'About Us', slug: '/about', status: 'published', template: 'Default', updatedAt: '1 day ago', author: 'John', isHomepage: false },
    { id: '3', title: 'Contact', slug: '/contact', status: 'draft', template: 'Default', updatedAt: '3 days ago', author: 'Jane', isHomepage: false },
    { id: '4', title: 'Pricing', slug: '/pricing', status: 'published', template: 'Landing', updatedAt: '1 week ago', author: 'Jane', isHomepage: false },
    { id: '5', title: 'FAQ', slug: '/faq', status: 'draft', template: 'Default', updatedAt: '2 weeks ago', author: 'John', isHomepage: false },
  ]);
  const [trash, setTrash] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [formData, setFormData] = useState({ title: '', slug: '', template: 'Default', status: 'draft' });

  const filtered = pages.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (editingPage) {
      setPages(pages.map(p => p.id === editingPage.id ? { ...p, ...formData } : p));
    } else {
      setPages([...pages, { ...formData, id: Date.now().toString(), updatedAt: 'just now', author: 'You', isHomepage: false }]);
    }
    setShowModal(false);
    setEditingPage(null);
    setFormData({ title: '', slug: '', template: 'Default', status: 'draft' });
  };

  const handleDelete = (id) => {
    const page = pages.find(p => p.id === id);
    if (page) {
      setTrash([...trash, { ...page, deletedAt: new Date().toISOString() }]);
      setPages(pages.filter(p => p.id !== id));
    }
  };

  const handleRestore = (id) => {
    const page = trash.find(p => p.id === id);
    if (page) {
      const { deletedAt, ...rest } = page;
      setPages([...pages, rest]);
      setTrash(trash.filter(p => p.id !== id));
    }
  };

  const handleSetHomepage = (id) => {
    setPages(pages.map(p => ({ ...p, isHomepage: p.id === id })));
  };

  const handleDuplicate = (page) => {
    const dup = { ...page, id: Date.now().toString(), title: `${page.title} (Copy)`, slug: `${page.slug}-copy`, updatedAt: 'just now', isHomepage: false };
    setPages([...pages, dup]);
  };

  const statusColors = {
    published: 'text-success-500 bg-success-500/10',
    draft: 'text-warning-500 bg-warning-500/10',
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Pages</h1>
          <p className="text-text-secondary mt-1">Manage your website pages</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTrash(!showTrash)} leftIcon={<Trash2 className="w-4 h-4" />}>
            Trash {trash.length > 0 && `(${trash.length})`}
          </Button>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> New Page
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input
          type="text"
          placeholder="Search pages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Trash Bin */}
      {showTrash && trash.length > 0 && (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-surface-light border-b border-border flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-text-secondary" />
            <span className="text-sm font-medium text-text-primary">Trash Bin</span>
            <span className="text-xs text-text-secondary">({trash.length} pages)</span>
          </div>
          <div className="divide-y divide-border">
            {trash.map((page) => (
              <div key={page.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-text-secondary" />
                  <span className="text-sm text-text-primary">{page.title}</span>
                  <span className="text-xs text-text-secondary">{page.slug}</span>
                </div>
                <button
                  onClick={() => handleRestore(page.id)}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-primary-500/10 text-primary-500 rounded hover:bg-primary-500/20"
                >
                  <RotateCcw className="w-3 h-3" />
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-light border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Page</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Slug</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Template</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Updated</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Author</th>
              <th className="px-4 py-3 w-32"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(page => (
              <tr key={page.id} className="hover:bg-surface-light">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center relative">
                      <FileText className="w-4 h-4 text-primary-500" />
                      {page.isHomepage && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center">
                          <Star className="w-2 h-2 text-white" />
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-text-primary">{page.title}</span>
                      {page.isHomepage && (
                        <span className="ml-2 text-xs bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-full">Homepage</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-secondary text-sm">{page.slug}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[page.status]}`}>
                    {page.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary text-sm">{page.template}</td>
                <td className="px-4 py-3 text-text-secondary text-sm">{page.updatedAt}</td>
                <td className="px-4 py-3 text-text-secondary text-sm">{page.author}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleSetHomepage(page.id)}
                      className={`p-1.5 rounded hover:bg-surface-light ${page.isHomepage ? 'text-amber-500' : 'text-text-secondary'}`}
                      title={page.isHomepage ? 'Homepage' : 'Set as Homepage'}
                    >
                      <Home className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDuplicate(page)} className="p-1.5 rounded hover:bg-surface-light" title="Duplicate">
                      <Copy className="w-3.5 h-3.5 text-text-secondary" />
                    </button>
                    <button onClick={() => { setEditingPage(page); setFormData(page); setShowModal(true); }} className="p-1.5 rounded hover:bg-surface-light" title="Edit">
                      <Edit2 className="w-3.5 h-3.5 text-text-secondary" />
                    </button>
                    <button onClick={() => handleDelete(page.id)} className="p-1.5 rounded hover:bg-danger-500/10" title="Move to Trash">
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
          <p className="text-text-primary mb-1">No pages found</p>
          <p className="text-sm text-text-secondary">Create your first page to get started</p>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingPage(null); setFormData({ title: '', slug: '', template: 'Default', status: 'draft' }); }} title={editingPage ? 'Edit Page' : 'New Page'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Page Title</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">URL Slug</label>
            <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary" placeholder="/my-page" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Template</label>
              <select value={formData.template} onChange={(e) => setFormData({ ...formData, template: e.target.value })} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary">
                <option>Default</option>
                <option>Landing</option>
                <option>Blog</option>
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
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
          <Button variant="primary" onClick={handleSave} className="flex-1">{editingPage ? 'Save Changes' : 'Create Page'}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default PagesManager;
