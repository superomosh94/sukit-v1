let _adapter = null;
export function setAuthAdapter(adapter) {
    _adapter = adapter;
}
export function createAuthAPI(adapter) {
    const a = () => adapter ?? _adapter;
    return {
        async login(email, password) {
            if (!a())
                throw new Error('Auth adapter not configured');
            return a().login(email, password);
        },
        async logout() {
            if (!a())
                return;
            return a().logout('');
        },
        async user() {
            if (!a())
                return null;
            return a().getUser('');
        },
        isAuthenticated() {
            return false;
        },
        hasRole(_role, _siteId) {
            return false;
        },
        async register(email, password, name) {
            if (!a())
                throw new Error('Auth adapter not configured');
            return a().createUser(email, password, name);
        },
    };
}
