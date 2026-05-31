import React, { useState } from 'react';
import { User, Mail, Calendar, MapPin, Briefcase, Edit2, Save, X } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const UserProfile = ({ 
    user, 
    onUpdate,
    editable = true,
    className 
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        location: user?.location || '',
        company: user?.company || '',
        website: user?.website || ''
    });

    const handleSave = () => {
        onUpdate?.(formData);
        setIsEditing(false);
    };

    const stats = [
        { label: 'Posts', value: user?.stats?.posts || 0 },
        { label: 'Comments', value: user?.stats?.comments || 0 },
        { label: 'Likes', value: user?.stats?.likes || 0 }
    ];

    return (
        <div className={cn('bg-surface border border-border rounded-lg overflow-hidden', className)}>
            {/* Cover Image */}
            <div className="h-32 bg-gradient-to-r from-primary-500 to-secondary-500" />
            
            {/* Avatar & Edit Button */}
            <div className="relative px-6">
                <div className="absolute -top-12">
                    <div className="w-24 h-24 rounded-full bg-surface border-4 border-surface overflow-hidden">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-primary-500/20 flex items-center justify-center">
                                <User className="w-10 h-10 text-primary-500" />
                            </div>
                        )}
                    </div>
                </div>
                {editable && !isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="absolute top-0 right-6 p-2 rounded-lg bg-surface border border-border hover:bg-surface-light"
                    >
                        <Edit2 className="w-4 h-4 text-text-secondary" />
                    </button>
                )}
                {isEditing && (
                    <div className="absolute top-0 right-6 flex gap-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="p-2 rounded-lg bg-surface border border-border hover:bg-surface-light"
                        >
                            <X className="w-4 h-4 text-text-secondary" />
                        </button>
                        <button
                            onClick={handleSave}
                            className="p-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600"
                        >
                            <Save className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* User Info */}
            <div className="px-6 pt-14 pb-4">
                {isEditing ? (
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Name"
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg"
                        />
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Bio"
                            rows={3}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg"
                        />
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="Location"
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg"
                        />
                        <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            placeholder="Company"
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg"
                        />
                        <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            placeholder="Website"
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg"
                        />
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-text-primary">{user?.name}</h2>
                        <p className="text-text-secondary mt-1">{user?.bio}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-text-secondary">
                            {user?.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {user.location}
                                </span>
                            )}
                            {user?.company && (
                                <span className="flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" />
                                    {user.company}
                                </span>
                            )}
                            {user?.email && (
                                <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {user.email}
                                </span>
                            )}
                            {user?.createdAt && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Joined {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Stats */}
            <div className="border-t border-border px-6 py-4">
                <div className="flex gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx}>
                            <div className="text-xl font-bold text-text-primary">{stat.value}</div>
                            <div className="text-sm text-text-secondary">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

UserProfile.displayName = 'UserProfile';
export default UserProfile;