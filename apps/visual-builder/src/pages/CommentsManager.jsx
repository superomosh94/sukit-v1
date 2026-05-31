import React, { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, AlertCircle, Trash2, Check, X, Eye } from 'lucide-react';
import { cn } from '../utils/cn';
import Button from '../components/shared/Button';

const CommentsManager = () => {
    const [comments, setComments] = useState([
        { id: '1', author: 'John Doe', email: 'john@example.com', content: 'Great article! Very informative.', post: 'Getting Started with SuKit', date: '2024-01-15', status: 'approved', avatar: null },
        { id: '2', author: 'Jane Smith', email: 'jane@example.com', content: 'When will the next update be released?', post: 'What\'s New in v2.0', date: '2024-01-16', status: 'pending', avatar: null },
        { id: '3', author: 'Mike Johnson', email: 'mike@example.com', content: 'This is spam content that should be removed.', post: 'Getting Started with SuKit', date: '2024-01-17', status: 'spam', avatar: null },
        { id: '4', author: 'Sarah Williams', email: 'sarah@example.com', content: 'Thank you for this tutorial!', post: 'Page Builder Guide', date: '2024-01-18', status: 'approved', avatar: null },
    ]);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedComments, setSelectedComments] = useState([]);
    const [viewingComment, setViewingComment] = useState(null);

    const statusColors = {
        approved: 'text-success-500 bg-success-500/10',
        pending: 'text-warning-500 bg-warning-500/10',
        spam: 'text-danger-500 bg-danger-500/10',
    };

    const filteredComments = comments.filter(comment => {
        const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              comment.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || comment.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleApprove = (id) => {
        setComments(comments.map(c => c.id === id ? { ...c, status: 'approved' } : c));
    };

    const handleReject = (id) => {
        setComments(comments.map(c => c.id === id ? { ...c, status: 'spam' } : c));
    };

    const handleDelete = (id) => {
        setComments(comments.filter(c => c.id !== id));
        setSelectedComments(selectedComments.filter(sid => sid !== id));
    };

    const handleBulkAction = (action) => {
        if (action === 'approve') {
            setComments(comments.map(c => selectedComments.includes(c.id) ? { ...c, status: 'approved' } : c));
        } else if (action === 'reject') {
            setComments(comments.map(c => selectedComments.includes(c.id) ? { ...c, status: 'spam' } : c));
        } else if (action === 'delete') {
            setComments(comments.filter(c => !selectedComments.includes(c.id)));
        }
        setSelectedComments([]);
    };

    const stats = {
        total: comments.length,
        approved: comments.filter(c => c.status === 'approved').length,
        pending: comments.filter(c => c.status === 'pending').length,
        spam: comments.filter(c => c.status === 'spam').length,
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Comments Manager</h1>
                    <p className="text-text-secondary mt-1">Moderate user comments across your site</p>
                </div>
                {selectedComments.length > 0 && (
                    <div className="flex gap-2">
                        <Button variant="success" size="sm" onClick={() => handleBulkAction('approve')} leftIcon={<Check className="w-4 h-4" />}>
                            Approve ({selectedComments.length})
                        </Button>
                        <Button variant="warning" size="sm" onClick={() => handleBulkAction('reject')} leftIcon={<X className="w-4 h-4" />}>
                            Reject ({selectedComments.length})
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleBulkAction('delete')} leftIcon={<Trash2 className="w-4 h-4" />}>
                            Delete ({selectedComments.length})
                        </Button>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-text-secondary">Total Comments</p>
                            <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
                        </div>
                        <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-primary-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-text-secondary">Approved</p>
                            <p className="text-2xl font-bold text-success-500">{stats.approved}</p>
                        </div>
                        <div className="w-10 h-10 bg-success-500/20 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-success-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-text-secondary">Pending</p>
                            <p className="text-2xl font-bold text-warning-500">{stats.pending}</p>
                        </div>
                        <div className="w-10 h-10 bg-warning-500/20 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-warning-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-text-secondary">Spam</p>
                            <p className="text-2xl font-bold text-danger-500">{stats.spam}</p>
                        </div>
                        <div className="w-10 h-10 bg-danger-500/20 rounded-lg flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-danger-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search comments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="spam">Spam</option>
                    </select>
                </div>
            </div>

            {/* Comments Table */}
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-surface-light border-b border-border">
                        <tr>
                            <th className="px-4 py-3 text-left w-12">
                                <input
                                    type="checkbox"
                                    checked={selectedComments.length === filteredComments.length && filteredComments.length > 0}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedComments(filteredComments.map(c => c.id));
                                        } else {
                                            setSelectedComments([]);
                                        }
                                    }}
                                    className="rounded border-border"
                                />
                            </th>
                            <th className="px-4 py-3 text-left">Author</th>
                            <th className="px-4 py-3 text-left">Comment</th>
                            <th className="px-4 py-3 text-left">Post</th>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredComments.map((comment) => (
                            <tr key={comment.id} className="hover:bg-surface-light">
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedComments.includes(comment.id)}
                                        onChange={(e) => {
                                            if (selectedComments.includes(comment.id)) {
                                                setSelectedComments(selectedComments.filter(id => id !== comment.id));
                                            } else {
                                                setSelectedComments([...selectedComments, comment.id]);
                                            }
                                        }}
                                        className="rounded border-border"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <div>
                                        <p className="font-medium text-text-primary">{comment.author}</p>
                                        <p className="text-xs text-text-secondary">{comment.email}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="text-text-secondary max-w-md truncate">{comment.content}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-text-primary">{comment.post}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-text-secondary">{comment.date}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={cn('inline-block px-2 py-1 rounded-full text-xs font-medium', statusColors[comment.status])}>
                                        {comment.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => setViewingComment(comment)} className="p-1 rounded hover:bg-surface-light">
                                            <Eye className="w-4 h-4 text-text-secondary" />
                                        </button>
                                        {comment.status !== 'approved' && (
                                            <button onClick={() => handleApprove(comment.id)} className="p-1 rounded hover:bg-surface-light">
                                                <Check className="w-4 h-4 text-success-500" />
                                            </button>
                                        )}
                                        {comment.status !== 'spam' && (
                                            <button onClick={() => handleReject(comment.id)} className="p-1 rounded hover:bg-surface-light">
                                                <X className="w-4 h-4 text-danger-500" />
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(comment.id)} className="p-1 rounded hover:bg-danger-500/10">
                                            <Trash2 className="w-4 h-4 text-danger-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredComments.length === 0 && (
                <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                    <p className="text-text-primary mb-2">No comments found</p>
                    <p className="text-sm text-text-secondary">Try adjusting your search or filter</p>
                </div>
            )}

            {/* View Comment Modal */}
            {viewingComment && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
                    <div className="bg-surface rounded-xl max-w-lg w-full">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h3 className="text-lg font-semibold text-text-primary">Comment Details</h3>
                            <button onClick={() => setViewingComment(null)} className="p-1 rounded hover:bg-surface-light">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm text-text-secondary">Author</label>
                                <p className="text-text-primary">{viewingComment.author}</p>
                                <p className="text-xs text-text-secondary">{viewingComment.email}</p>
                            </div>
                            <div>
                                <label className="text-sm text-text-secondary">Post</label>
                                <p className="text-text-primary">{viewingComment.post}</p>
                            </div>
                            <div>
                                <label className="text-sm text-text-secondary">Comment</label>
                                <p className="text-text-primary mt-1">{viewingComment.content}</p>
                            </div>
                            <div>
                                <label className="text-sm text-text-secondary">Date</label>
                                <p className="text-text-primary">{viewingComment.date}</p>
                            </div>
                            <div>
                                <label className="text-sm text-text-secondary">Status</label>
                                <span className={cn('inline-block ml-2 px-2 py-1 rounded-full text-xs font-medium', statusColors[viewingComment.status])}>
                                    {viewingComment.status}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3 p-4 border-t border-border">
                            <Button variant="outline" onClick={() => setViewingComment(null)} fullWidth>Close</Button>
                            {viewingComment.status !== 'approved' && (
                                <Button variant="success" onClick={() => { handleApprove(viewingComment.id); setViewingComment(null); }} fullWidth>
                                    Approve
                                </Button>
                            )}
                            {viewingComment.status !== 'spam' && (
                                <Button variant="danger" onClick={() => { handleReject(viewingComment.id); setViewingComment(null); }} fullWidth>
                                    Mark as Spam
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommentsManager;