import React, { useState } from 'react';
import { Search, User, Mail, MapPin, Users } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const UserDirectory = ({ 
    users = [], 
    roles = [],
    showSearch = true,
    showFilters = true,
    layout = 'grid',
    className 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [viewMode, setViewMode] = useState(layout);

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'all' || user.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    const roleOptions = ['all', ...roles];

    if (viewMode === 'list') {
        return (
            <div className={cn('space-y-4', className)}>
                {/* Header */}
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    {showSearch && (
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
                    )}
                    {showFilters && roles.length > 0 && (
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm"
                        >
                            {roleOptions.map(role => (
                                <option key={role} value={role}>
                                    {role === 'all' ? 'All Roles' : role}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Users List */}
                <div className="space-y-2">
                    {filteredUsers.map((user, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg hover:border-primary-500 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5 text-primary-500" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-medium text-text-primary">{user.name}</h4>
                                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-text-secondary">
                                        <span className="flex items-center gap-1">
                                            <Mail className="w-3 h-3" />
                                            {user.email}
                                        </span>
                                        {user.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {user.location}
                                            </span>
                                        )}
                                        {user.role && (
                                            <span className="px-1.5 py-0.5 bg-primary-500/10 text-primary-500 rounded">
                                                {user.role}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button className="px-3 py-1 text-sm text-primary-500 hover:underline">
                                View Profile
                            </button>
                        </div>
                    ))}
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-text-secondary">
                        <Users className="w-12 h-12 mx-auto mb-3" />
                        <p>No users found</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={cn('space-y-4', className)}>
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                {showSearch && (
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
                )}
                {showFilters && roles.length > 0 && (
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm"
                    >
                        {roleOptions.map(role => (
                            <option key={role} value={role}>
                                {role === 'all' ? 'All Roles' : role}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user, idx) => (
                    <div key={idx} className="bg-surface border border-border rounded-lg p-4 text-center hover:border-primary-500 transition-colors">
                        <div className="w-20 h-20 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <User className="w-8 h-8 text-primary-500" />
                            )}
                        </div>
                        <h4 className="font-semibold text-text-primary mt-3">{user.name}</h4>
                        <p className="text-sm text-text-secondary">{user.email}</p>
                        {user.location && (
                            <p className="text-xs text-text-secondary mt-1">{user.location}</p>
                        )}
                        {user.role && (
                            <span className="inline-block mt-2 px-2 py-0.5 bg-primary-500/10 text-primary-500 text-xs rounded">
                                {user.role}
                            </span>
                        )}
                        <button className="w-full mt-3 py-1.5 border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-500 hover:text-white transition-colors">
                            View Profile
                        </button>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-text-secondary">
                    <Users className="w-12 h-12 mx-auto mb-3" />
                    <p>No users found</p>
                </div>
            )}
        </div>
    );
};

UserDirectory.displayName = 'UserDirectory';
export default UserDirectory;