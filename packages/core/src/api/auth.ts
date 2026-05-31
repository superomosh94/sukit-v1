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

  return {
    async login(email: string, password: string): Promise<Session> {
      if (!a()) throw new Error('Auth adapter not configured');
      return a()!.login(email, password);
    },

    async logout(): Promise<void> {
      if (!a()) return;
      return a()!.logout('');
    },

    async user(): Promise<User | null> {
      if (!a()) return null;
      return a()!.getUser('');
    },

    isAuthenticated(): boolean {
      return false;
    },

    hasRole(_role: string, _siteId?: string): boolean {
      return false;
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
