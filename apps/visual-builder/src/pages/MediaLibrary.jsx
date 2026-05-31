import React, { useState, useRef, useEffect } from 'react';
import { Search, Upload, Trash2, Edit2, Copy, Download, Grid3X3, LayoutList, Image, Video, File, Music, X, Folder, FolderPlus, Plus, RefreshCw, FileText, Zap } from 'lucide-react';
import { cn } from '../utils/cn';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';
import api from '../services/api';

const MediaLibrary = ({ siteId }) => {
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [optimizing, setOptimizing] = useState({});

    const [folders, setFolders] = useState([
        { id: 'folder1', name: 'Products', parentId: null },
        { id: 'folder2', name: 'Team', parentId: null },
    ]);

    useEffect(() => {
        if (!siteId) return;
        setLoading(true);
        setError('');
        api.getMedia(siteId)
            .then((data) => setMediaItems(Array.isArray(data) ? data : data?.media || []))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [siteId]);

    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedItems, setSelectedItems] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [previewItem, setPreviewItem] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [editingAltText, setEditingAltText] = useState('');
    const [showReplaceModal, setShowReplaceModal] = useState(false);
    const replaceFileInputRef = useRef(null);
    const fileInputRef = useRef(null);

    const filteredItems = mediaItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedFolder === null || item.folderId === selectedFolder)
    );

    const getFolderItems = (folderId) => mediaItems.filter(item => item.folderId === folderId);
    const getSubfolders = (parentId) => folders.filter(f => f.parentId === parentId);

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        const uploaded = [];
        for (const file of files) {
            try {
                const result = await api.uploadMedia(siteId, file);
                uploaded.push(result);
            } catch (err) {
                setError(`Upload failed for ${file.name}: ${err.message}`);
            }
        }
        if (uploaded.length) {
            setMediaItems([...uploaded, ...mediaItems]);
        }
        setShowUploadModal(false);
    };

    const handleReplaceFile = (e) => {
        const file = e.target.files[0];
        if (!file || !previewItem) return;
        setMediaItems(mediaItems.map(item =>
            item.id === previewItem.id
                ? { ...item, name: file.name, url: URL.createObjectURL(file), size: (file.size / 1024 / 1024).toFixed(2) + ' MB', date: new Date().toISOString().slice(0, 10) }
                : item
        ));
        setShowReplaceModal(false);
        setPreviewItem({ ...previewItem, name: file.name, url: URL.createObjectURL(file) });
    };

    const handleDelete = async (id) => {
        try {
            await api.deleteMedia(siteId, id);
            setMediaItems(mediaItems.filter(item => item.id !== id));
            setSelectedItems(selectedItems.filter(sid => sid !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleBulkDelete = async () => {
        try {
            for (const id of selectedItems) {
                await api.deleteMedia(siteId, id);
            }
            setMediaItems(mediaItems.filter(item => !selectedItems.includes(item.id)));
            setSelectedItems([]);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleOptimize = async (mediaId) => {
        setOptimizing((prev) => ({ ...prev, [mediaId]: true }));
        try {
            const result = await api.optimizeMedia(siteId, mediaId);
            setMediaItems(mediaItems.map(item =>
                item.id === mediaId ? { ...item, ...result, optimized: true, webpUrl: result.webpUrl, srcset: result.srcset } : item
            ));
        } catch (err) {
            setError(err.message);
        } finally {
            setOptimizing((prev) => ({ ...prev, [mediaId]: false }));
        }
    };

    const handleSaveAltText = () => {
        if (!previewItem) return;
        setMediaItems(mediaItems.map(item =>
            item.id === previewItem.id ? { ...item, altText: editingAltText } : item
        ));
        setPreviewItem({ ...previewItem, altText: editingAltText });
    };

    const handleCreateFolder = () => {
        if (!newFolderName.trim()) return;
        setFolders([...folders, { id: `folder_${Date.now()}`, name: newFolderName, parentId: selectedFolder }]);
        setNewFolderName('');
        setShowNewFolder(false);
    };

    const handleRenameFolder = (id, newName) => {
        setFolders(folders.map(f => f.id === id ? { ...f, name: newName } : f));
    };

    const handleDeleteFolder = (id) => {
        setFolders(folders.filter(f => f.id !== id));
        setMediaItems(mediaItems.map(item => item.folderId === id ? { ...item, folderId: null } : item));
        if (selectedFolder === id) setSelectedFolder(null);
    };

    const getFileIcon = (type) => {
        switch (type) {
            case 'image': return <Image className="w-8 h-8 text-primary-500" />;
            case 'video': return <Video className="w-8 h-8 text-secondary-500" />;
            case 'document': return <File className="w-8 h-8 text-warning-500" />;
            default: return <File className="w-8 h-8 text-text-secondary" />;
        }
    };

    return (
        <div className="flex h-full">
            {/* Folders Sidebar */}
            <div className="w-56 shrink-0 bg-surface border-r border-border p-3 space-y-2">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Folders</span>
                    <button onClick={() => setShowNewFolder(true)} className="p-1 rounded hover:bg-surface-light">
                        <FolderPlus className="w-3.5 h-3.5 text-text-secondary" />
                    </button>
                </div>

                <button
                    onClick={() => setSelectedFolder(null)}
                    className={cn(
                        'flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors',
                        selectedFolder === null ? 'bg-primary-500/20 text-primary-500' : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                    )}
                >
                    <Image className="w-4 h-4" />
                    All Media
                    <span className="ml-auto text-xs opacity-60">{mediaItems.length}</span>
                </button>

                {folders.map((folder) => (
                    <div key={folder.id} className="group">
                        <div className={cn(
                            'flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors cursor-pointer',
                            selectedFolder === folder.id ? 'bg-primary-500/20 text-primary-500' : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                        )}>
                            <Folder className="w-4 h-4 shrink-0" />
                            <span
                                className="flex-1 truncate"
                                onClick={() => setSelectedFolder(folder.id)}
                            >
                                {folder.name}
                            </span>
                            <span className="text-xs opacity-60">{getFolderItems(folder.id).length}</span>
                            <button
                                onClick={() => handleDeleteFolder(folder.id)}
                                className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-danger-500/10 rounded"
                            >
                                <Trash2 className="w-3 h-3 text-danger-500" />
                            </button>
                        </div>
                    </div>
                ))}

                {showNewFolder && (
                    <div className="flex gap-1">
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Folder name"
                            className="flex-1 px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                        />
                        <button onClick={handleCreateFolder} className="p-1 bg-primary-500 text-white rounded">
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {error && (
                    <div className="bg-danger-500/10 border border-danger-500/20 rounded-lg p-3">
                        <p className="text-sm text-danger-500">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-6 h-6 animate-spin text-primary-500" />
                    </div>
                ) : (
                <>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">Media Library</h1>
                        <p className="text-text-secondary mt-1">Manage your images, videos, and documents</p>
                    </div>
                    <div className="flex gap-3">
                        {selectedItems.length > 0 && (
                            <Button variant="danger" onClick={handleBulkDelete} leftIcon={<Trash2 className="w-4 h-4" />}>
                                Delete ({selectedItems.length})
                            </Button>
                        )}
                        <Button variant="primary" onClick={() => setShowUploadModal(true)} leftIcon={<Upload className="w-4 h-4" />}>
                            Upload Files
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search media..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-text-secondary hover:bg-surface-light'}`}
                        >
                            <Grid3X3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-text-secondary hover:bg-surface-light'}`}
                        >
                            <LayoutList className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className={cn(
                                    'group bg-surface border rounded-lg overflow-hidden cursor-pointer transition-all hover:border-primary-500 relative',
                                    selectedItems.includes(item.id) && 'border-primary-500 ring-2 ring-primary-500/20'
                                )}
                                onClick={() => {
                                    if (selectedItems.includes(item.id)) {
                                        setSelectedItems(selectedItems.filter(id => id !== item.id));
                                    } else {
                                        setSelectedItems([...selectedItems, item.id]);
                                    }
                                }}
                                onDoubleClick={() => { setPreviewItem(item); setEditingAltText(item.altText || ''); }}
                            >
                                <div className="aspect-square bg-surface-light flex items-center justify-center">
                                    {item.type === 'image' ? (
                                        <img src={item.url} alt={item.altText || item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        getFileIcon(item.type)
                                    )}
                                </div>
                                <div className="p-2">
                                    <p className="text-sm text-text-primary truncate">{item.name}</p>
                                    <p className="text-xs text-text-secondary">{item.size}</p>
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    {item.type === 'image' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOptimize(item.id); }}
                                            disabled={optimizing[item.id]}
                                            className="p-1 bg-black/50 rounded hover:bg-black/70"
                                            title={item.webpUrl ? 'Optimized' : 'Optimize image'}
                                        >
                                            <Zap className={`w-3 h-3 text-white ${optimizing[item.id] ? 'animate-pulse' : ''}`} />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setPreviewItem(item); setEditingAltText(item.altText || ''); }}
                                        className="p-1 bg-black/50 rounded hover:bg-black/70"
                                    >
                                        <Edit2 className="w-3 h-3 text-white" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                        className="p-1 bg-black/50 rounded hover:bg-black/70"
                                    >
                                        <Trash2 className="w-3 h-3 text-white" />
                                    </button>
                                </div>
                                {item.optimized && item.webpUrl && (
                                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        WebP
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-surface border border-border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-surface-light border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 text-left w-12">
                                        <input type="checkbox" className="rounded border-border" />
                                    </th>
                                    <th className="px-4 py-3 text-left">Preview</th>
                                    <th className="px-4 py-3 text-left">Name</th>
                                    <th className="px-4 py-3 text-left">Type</th>
                                    <th className="px-4 py-3 text-left">Size</th>
                                    <th className="px-4 py-3 text-left">Date</th>
                                    <th className="px-4 py-3 text-left w-20">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-surface-light cursor-pointer" onClick={() => { setPreviewItem(item); setEditingAltText(item.altText || ''); }}>
                                        <td className="px-4 py-3">
                                            <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => {}} className="rounded border-border" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="w-10 h-10 bg-surface-light rounded flex items-center justify-center">
                                                {item.type === 'image' ? (
                                                    <img src={item.url} alt={item.altText || item.name} className="w-full h-full rounded object-cover" />
                                                ) : getFileIcon(item.type)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-text-primary">{item.name}</td>
                                        <td className="px-4 py-3 text-text-secondary capitalize">{item.type}</td>
                                        <td className="px-4 py-3 text-text-secondary">{item.size}</td>
                                        <td className="px-4 py-3 text-text-secondary">{item.date}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2 items-center">
                                                {item.type === 'image' && (
                                                    <>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleOptimize(item.id); }}
                                                            disabled={optimizing[item.id]}
                                                            className="p-1 rounded hover:bg-primary-500/10"
                                                            title={item.webpUrl ? 'Optimized' : 'Optimize'}
                                                        >
                                                            <Zap className={`w-4 h-4 text-primary-500 ${optimizing[item.id] ? 'animate-pulse' : ''}`} />
                                                        </button>
                                                        {item.webpUrl && <span className="text-xs text-success-500">WebP</span>}
                                                    </>
                                                )}
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-1 rounded hover:bg-danger-500/10">
                                                    <Trash2 className="w-4 h-4 text-danger-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {filteredItems.length === 0 && (
                    <div className="text-center py-12">
                        <Image className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                        <p className="text-text-primary mb-2">No media found</p>
                        <p className="text-sm text-text-secondary">Upload your first image or document</p>
                    </div>
                )}

                <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Files" size="lg">
                    <div
                        className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary-500 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                        <p className="text-text-primary mb-2">Click or drag files to upload</p>
                        <p className="text-xs text-text-secondary">Supports images, videos, PDFs, and documents</p>
                        <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
                    </div>
                </Modal>

                {previewItem && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
                        <div className="bg-surface rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
                            <div className="flex items-center justify-between p-4 border-b border-border">
                                <h3 className="text-lg font-semibold text-text-primary">{previewItem.name}</h3>
                                <button onClick={() => setPreviewItem(null)} className="p-1 rounded hover:bg-surface-light">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                {previewItem.type === 'image' ? (
                                    <img src={previewItem.url} alt={previewItem.altText || previewItem.name} className="w-full rounded-lg" />
                                ) : (
                                    <div className="bg-surface-light rounded-lg p-8 text-center">
                                        {getFileIcon(previewItem.type)}
                                        <p className="mt-4 text-text-secondary">Preview not available</p>
                                    </div>
                                )}
                                <div className="mt-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-text-secondary">File Name:</span>
                                            <p className="text-text-primary">{previewItem.name}</p>
                                        </div>
                                        <div>
                                            <span className="text-text-secondary">File Size:</span>
                                            <p className="text-text-primary">{previewItem.size}</p>
                                        </div>
                                        {previewItem.width && (
                                            <div>
                                                <span className="text-text-secondary">Dimensions:</span>
                                                <p className="text-text-primary">{previewItem.width} x {previewItem.height}px</p>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-text-secondary">Uploaded:</span>
                                            <p className="text-text-primary">{previewItem.date}</p>
                                        </div>
                                    </div>

                                    {/* Alt Text Editor */}
                                    <div className="pt-3 border-t border-border">
                                        <label className="block text-sm text-text-secondary mb-1">Alt Text (Accessibility)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={editingAltText}
                                                onChange={(e) => setEditingAltText(e.target.value)}
                                                placeholder="Describe this image for accessibility"
                                                className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm"
                                            />
                                            <button
                                                onClick={handleSaveAltText}
                                                className="px-3 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>

                                    {/* Replace File */}
                                    <div className="pt-3 border-t border-border">
                                        <button
                                            onClick={() => setShowReplaceModal(true)}
                                            className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Replace File
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 p-4 border-t border-border">
                                <Button variant="outline" onClick={() => setPreviewItem(null)} fullWidth>Close</Button>
                                <Button variant="primary" onClick={() => {}} fullWidth>Insert into Page</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Replace File Modal */}
                {showReplaceModal && (
                    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
                        <div className="bg-surface rounded-xl max-w-md w-full p-6">
                            <h3 className="text-lg font-semibold text-text-primary mb-4">Replace File</h3>
                            <p className="text-sm text-text-secondary mb-4">Upload a new version of this file. The URL will stay the same.</p>
                            <div
                                className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary-500 transition-colors"
                                onClick={() => replaceFileInputRef.current?.click()}
                            >
                                <RefreshCw className="w-8 h-8 text-text-secondary mx-auto mb-2" />
                                <p className="text-sm text-text-primary">Click to select new file</p>
                                <input ref={replaceFileInputRef} type="file" onChange={handleReplaceFile} className="hidden" />
                            </div>
                            <div className="flex gap-3 mt-4">
                                <Button variant="outline" onClick={() => setShowReplaceModal(false)} fullWidth>Cancel</Button>
                            </div>
                        </div>
                    </div>
                )}
                </>
                )}
            </div>
        </div>
    );
};

export default MediaLibrary;
