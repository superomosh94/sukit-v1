import React, { useState } from 'react';
import { Search, Filter, UserPlus, Trash2, Edit2, Shield, User, Mail, Calendar, MoreVertical, Check, X } from 'lucide-react';
import { cn } from '../utils/cn';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';

const UsersManager = () => {
    const [users, setUsers] = useState([
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active', joined: '2024-01-15', lastActive: '2024-01-20', avatar: null },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'editor', status: 'active', joined: '2024-01-16', lastActive: '2024-01-19', avatar: null },
        { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'user', status: 'inactive', joined: '2024-01-17', lastActive: '2024-01-18', avatar: null },
        { id: '4', name: 'Sarah Williams', email: 'sarah@example.com', role: 'editor', status: 'active', joined: '2024-01-18', lastActive: '2024-01-20', avatar: null },
    ]);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'user', password: '' });

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const handleSaveUser = () => {
        if (editingUser) {
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
        } else {
            const newUser = {
                id: Date.now().toString(),
                ...formData,
                status: 'active',
                joined: new Date().toISOString().slice(0, 10),
                lastActive: new Date().toISOString().slice(0, 10),
                avatar: null,
            };
            setUsers([newUser, ...users]);
        }
        setShowUserModal(false);
        setEditingUser(null);
        setFormData({ name: '', email: '', role: 'user', password: '' });
    };

    const handleDeleteUser = (id) => {
        setUsers(users.filter(u => u.id !== id));
        setSelectedUsers(selectedUsers.filter(sid => sid !== id));
    };

    const handleBulkDelete = () => {
        setUsers(users.filter(u => !selectedUsers.includes(u.id)));
        setSelectedUsers([]);
    };

    const handleToggleStatus = (id) => {
        setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    };

    const roleColors = {
        admin: 'text-purple-500 bg-purple-500/10',
        editor: 'text-blue-500 bg-blue-500/10',
        user: 'text-green-500 bg-green-500/10',
    };

    const statusColors = {
        active: 'text-success-500 bg-success-500/10',
        inactive: 'text-text-secondary bg-surface-light',
    };

    const stats = {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        inactive: users.filter(u => u.status === 'inactive').length,
        admins: users.filter(u => u.role === 'admin').length,
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Users Manager</h1>
                    <p className="text-text-secondary mt-1">Manage user accounts and permissions</p>
                </div>
                <div className="flex gap-3">
                    {selectedUsers.length > 0 && (
                        <Button variant="danger" onClick={handleBulkDelete} leftIcon={<Trash2 className="w-4 h-4" />}>
                            Delete ({selectedUsers.length})
                        </Button>
                    )}
                    <Button variant="primary" onClick={() => setShowUserModal(true)} leftIcon={<UserPlus className="w-4 h-4" />}>
                        Add User
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-text-secondary">Total Users</p>
                            <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
                        </div>
                        <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-text-secondary">Active</p>
                            <p className="text-2xl font-bold text-success-500">{stats.active}</p>
                        </div>
                        <div className="w-10 h-10 bg-success-500/20 rounded-lg flex items-center justify-center">
                            <Check className="w-5 h-5 text-success-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-text-secondary">Inactive</p>
                            <p className="text-2xl font-bold text-text-secondary">{stats.inactive}</p>
                        </div>
                        <div className="w-10 h-10 bg-surface-light rounded-lg flex items-center justify-center">
                            <X className="w-5 h-5 text-text-secondary" />
                        </div>
                    </div>
                </div>
                <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-text-secondary">Admins</p>
                            <p className="text-2xl font-bold text-purple-500">{stats.admins}</p>
                        </div>
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-purple-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="user">User</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-surface-light border-b border-border">
                        <tr>
                            <th className="px-4 py-3 text-left w-12">
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedUsers(filteredUsers.map(u => u.id));
                                        } else {
                                            setSelectedUsers([]);
                                        }
                                    }}
                                    className="rounded border-border"
                                />
                            </th>
                            <th className="px-4 py-3 text-left">User</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Role</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Joined</th>
                            <th className="px-4 py-3 text-left">Last Active</th>
                            <th className="px-4 py-3 text-left w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-surface-light">
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={(e) => {
                                            if (selectedUsers.includes(user.id)) {
                                                setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                            } else {
                                                setSelectedUsers([...selectedUsers, user.id]);
                                            }
                                        }}
                                        className="rounded border-border"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                                            <User className="w-4 h-4 text-primary-500" />
                                        </div>
                                        <span className="font-medium text-text-primary">{user.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                        <Mail className="w-3 h-3 text-text-secondary" />
                                        <span className="text-text-secondary">{user.email}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={cn('inline-block px-2 py-1 rounded-full text-xs font-medium', roleColors[user.role])}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={cn('inline-block px-2 py-1 rounded-full text-xs font-medium', statusColors[user.status])}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-text-secondary" />
                                        <span className="text-text-secondary">{user.joined}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-text-secondary">{user.lastActive}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditingUser(user); setFormData(user); setShowUserModal(true); }} className="p-1 rounded hover:bg-surface-light">
                                            <Edit2 className="w-4 h-4 text-text-secondary" />
                                        </button>
                                        <button onClick={() => handleToggleStatus(user.id)} className="p-1 rounded hover:bg-surface-light">
                                            {user.status === 'active' ? <X className="w-4 h-4 text-danger-500" /> : <Check className="w-4 h-4 text-success-500" />}
                                        </button>
                                        <button onClick={() => handleDeleteUser(user.id)} className="p-1 rounded hover:bg-danger-500/10">
                                            <Trash2 className="w-4 h-4 text-danger-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                    <User className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                    <p className="text-text-primary mb-2">No users found</p>
                    <p className="text-sm text-text-secondary">Try adjusting your search or add a new user</p>
                </div>
            )}

            {/* User Modal */}
            <Modal isOpen={showUserModal} onClose={() => { setShowUserModal(false); setEditingUser(null); setFormData({ name: '', email: '', role: 'user', password: '' }); }} title={editingUser ? 'Edit User' : 'Add User'} size="md">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Full Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Email Address</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                            required
                        />
                    </div>
                    {!editingUser && (
                        <div>
                            <label className="block text-sm text-text-secondary mb-1">Password</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                        >
                            <option value="user">User</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => { setShowUserModal(false); setEditingUser(null); }} fullWidth>Cancel</Button>
                    <Button variant="primary" onClick={handleSaveUser} fullWidth>{editingUser ? 'Save Changes' : 'Add User'}</Button>
                </div>
            </Modal>
        </div>
    );
};

export default UsersManager;