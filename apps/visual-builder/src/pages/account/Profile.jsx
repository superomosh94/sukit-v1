import React, { useState } from 'react';
import { User, Mail, Camera, Save, Briefcase, Globe } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';

const Profile = () => {
    const { user, updateProfile } = useUserStore();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.bio || '',
        company: user?.company || '',
        website: user?.website || '',
        location: user?.location || '',
    });
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar);
    const [saved, setSaved] = useState(false);

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setAvatarPreview(event.target.result);
                setFormData(prev => ({ ...prev, avatar: event.target.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        updateProfile(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-text-primary">Profile Information</h3>
            </div>

            <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-primary-500/20 flex items-center justify-center overflow-hidden">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-10 h-10 text-primary-500" />
                        )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-1 bg-primary-500 rounded-full cursor-pointer hover:bg-primary-600 transition-colors">
                        <Camera className="w-3 h-3 text-white" />
                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                </div>

                {/* Form Fields */}
                <div className="flex-1 space-y-4">
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Full Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm text-text-secondary mb-1">Bio</label>
                <textarea
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    rows={3}
                    placeholder="Tell us about yourself..."
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-text-secondary mb-1">Company</label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => handleChange('company', e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm text-text-secondary mb-1">Website</label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => handleChange('website', e.target.value)}
                            placeholder="https://example.com"
                            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm text-text-secondary mb-1">Location</label>
                <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="City, Country"
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>

            <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
                {saved ? 'Saved!' : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
        </div>
    );
};

export default Profile;
