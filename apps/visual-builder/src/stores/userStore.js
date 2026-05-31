import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
    persist(
        (set, get) => ({
            user: {
                id: 'user-1',
                name: 'John Doe',
                email: 'john@example.com',
                avatar: null,
                bio: 'Full-stack developer and designer',
                company: 'SuKit Inc.',
                website: 'https://johndoe.com',
                location: 'San Francisco, CA',
                twoFactorEnabled: false,
                plan: 'pro',
            },
            apiKeys: [
                { id: 'key-1', name: 'Production API Key', key: 'sk_live_abc123def456', createdAt: '2024-01-15', lastUsed: '2024-04-20' },
                { id: 'key-2', name: 'Development API Key', key: 'sk_test_xyz789ghi012', createdAt: '2024-02-10', lastUsed: '2024-04-18' },
            ],
            
            updateProfile: (profileData) => {
                set((state) => ({
                    user: { ...state.user, ...profileData }
                }));
            },
            
            updatePassword: async (passwordData) => {
                // API call would go here
                console.log('Password updated:', passwordData);
                return true;
            },
            
            enable2FA: () => {
                set((state) => ({
                    user: { ...state.user, twoFactorEnabled: true }
                }));
            },
            
            disable2FA: () => {
                set((state) => ({
                    user: { ...state.user, twoFactorEnabled: false }
                }));
            },
            
            createApiKey: (name) => {
                const newKey = {
                    id: `key-${Date.now()}`,
                    name,
                    key: `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
                    createdAt: new Date().toISOString().slice(0, 10),
                    lastUsed: null,
                };
                set((state) => ({
                    apiKeys: [...state.apiKeys, newKey]
                }));
                return newKey;
            },
            
            revokeApiKey: (id) => {
                set((state) => ({
                    apiKeys: state.apiKeys.filter(key => key.id !== id)
                }));
            },
        }),
        {
            name: 'sukit-user',
        }
    )
);
