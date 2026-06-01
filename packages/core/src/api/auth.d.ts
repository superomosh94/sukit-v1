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
export declare function setAuthAdapter(adapter: AuthAdapter): void;
export declare function createAuthAPI(adapter?: AuthAdapter): {
  login(email: string, password: string): Promise<Session>;
  logout(): Promise<void>;
  user(): Promise<User | null>;
  isAuthenticated(): boolean;
  hasRole(_role: string, _siteId?: string): boolean;
  register(email: string, password: string, name?: string): Promise<User>;
};
export type AuthAPI = ReturnType<typeof createAuthAPI>;
//# sourceMappingURL=auth.d.ts.map
