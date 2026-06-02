import type { Session, User, Invitation } from '../types';

export interface AuthAdapter {
  login(email: string, password: string): Promise<Session>;
  logout(token: string): Promise<void>;
  getUser(userId: string): Promise<User | null>;
  createUser(email: string, password: string, name?: string): Promise<User>;
  assignRole(userId: string, siteId: string, role: string): Promise<void>;
  getUserRole(userId: string, siteId: string): Promise<string | null>;
  inviteUser(siteId: string, email: string, role: string): Promise<Invitation>;
  getSession(token: string): Promise<Session | null>;
}

let _adapter: AuthAdapter | null = null;

export function setAuthAdapter(adapter: AuthAdapter): void {
  _adapter = adapter;
}

export function createAuthAPI(adapter?: AuthAdapter) {
  const a = () => adapter ?? _adapter;

  let _currentToken: string | null = null;
  let _cachedUser: User | null = null;
  let _cachedRoles: Record<string, string> = {};
  let _loadPromise: Promise<void> | null = null;

  async function _loadSession(token: string): Promise<void> {
    _currentToken = token;
    if (!a()) return;
    try {
      const session = await a()!.getSession(token);
      if (session) {
        const user = await a()!.getUser(session.userId);
        _cachedUser = user;
        if (user) {
          const role = await a()!.getUserRole(user.id, '');
          if (role) _cachedRoles[''] = role;
        }
      }
    } catch {
      _currentToken = null;
      _cachedUser = null;
      _cachedRoles = {};
    }
  }

  return {
    async login(email: string, password: string): Promise<Session> {
      if (!a()) throw new Error('Auth adapter not configured');
      const session = await a()!.login(email, password);
      _currentToken = session.token;
      _loadPromise = _loadSession(session.token);
      return session;
    },

    async logout(token?: string): Promise<void> {
      const t = token ?? _currentToken;
      if (!a() || !t) {
        _currentToken = null;
        _cachedUser = null;
        _cachedRoles = {};
        return;
      }
      await a()!.logout(t);
      _currentToken = null;
      _cachedUser = null;
      _cachedRoles = {};
    },

    setToken(token: string): void {
      _loadPromise = _loadSession(token);
    },

    async user(): Promise<User | null> {
      if (_cachedUser) return _cachedUser;
      if (!_currentToken || !a()) return null;
      const session = await a()!.getSession(_currentToken);
      if (!session) {
        _currentToken = null;
        return null;
      }
      const user = await a()!.getUser(session.userId);
      _cachedUser = user;
      return user;
    },

    isAuthenticated(): boolean {
      return _currentToken !== null;
    },

    hasRole(role: string, siteId?: string): boolean {
      const key = siteId ?? '';
      return _cachedRoles[key] === role;
    },

    async register(
      email: string,
      password: string,
      name?: string
    ): Promise<User> {
      if (!a()) throw new Error('Auth adapter not configured');
      return a()!.createUser(email, password, name);
    },
  };
}

export type AuthAPI = ReturnType<typeof createAuthAPI>;
