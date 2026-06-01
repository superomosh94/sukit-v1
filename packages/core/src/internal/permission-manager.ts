export interface PermissionRecord {
  moduleId: string;
  permission: string;
  level: 'always' | 'once';
  grantedAt: number;
  expiresAt?: number;
  grantedBy?: string;
}

export interface PermissionTemplate {
  id: string;
  name: string;
  permissions: string[];
}

export interface PermissionGroup {
  id: string;
  label: string;
  permissions: string[];
}

export class PermissionManager {
  private granted = new Map<string, Map<string, PermissionRecord>>();
  private templates = new Map<string, PermissionTemplate>();
  private groups = new Map<string, PermissionGroup>();
  private auditLog: Array<{
    moduleId: string;
    permission: string;
    action: string;
    timestamp: number;
    by?: string;
  }> = [];
  private cacheEnabled = true;
  private cache = new Map<string, { result: boolean; expiresAt: number }>();
  private persistenceAdapter: {
    save(records: PermissionRecord[]): Promise<void>;
    load(): Promise<PermissionRecord[]>;
  } | null = null;
  private dependencyGraph = new Map<string, string[]>();

  /* --- Core --- */
  async check(moduleId: string, permission: string): Promise<boolean> {
    if (this.cacheEnabled) {
      const key = `${moduleId}:${permission}`;
      const cached = this.cache.get(key);
      if (cached && cached.expiresAt > Date.now()) return cached.result;
    }

    const result = this.granted.get(moduleId)?.has(permission) ?? false;

    if (this.cacheEnabled) {
      this.cache.set(`${moduleId}:${permission}`, {
        result,
        expiresAt: Date.now() + 5000,
      });
    }
    return result;
  }

  async request(
    moduleId: string,
    permission: string,
    reason: string
  ): Promise<boolean> {
    const existing = this.granted.get(moduleId)?.get(permission);
    if (existing && (!existing.expiresAt || existing.expiresAt > Date.now()))
      return true;

    this.grant(moduleId, permission, 'once', undefined, 'system');
    this.auditLog.push({
      moduleId,
      permission,
      action: 'granted',
      timestamp: Date.now(),
      by: 'system',
    });
    return true;
  }

  grant(
    moduleId: string,
    permission: string,
    level: 'always' | 'once',
    expiresAt?: number,
    grantedBy?: string
  ): void {
    if (!this.granted.has(moduleId)) {
      this.granted.set(moduleId, new Map());
    }
    this.granted.get(moduleId)!.set(permission, {
      moduleId,
      permission,
      level,
      grantedAt: Date.now(),
      expiresAt,
      grantedBy,
    });
    this.cache.delete(`${moduleId}:${permission}`);
    this.persist();
  }

  revoke(moduleId: string, permission: string): void {
    this.granted.get(moduleId)?.delete(permission);
    this.cache.delete(`${moduleId}:${permission}`);
    this.auditLog.push({
      moduleId,
      permission,
      action: 'revoked',
      timestamp: Date.now(),
    });
    this.persist();
  }

  revokeAll(moduleId: string): void {
    this.granted.delete(moduleId);
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${moduleId}:`)) this.cache.delete(key);
    }
    this.auditLog.push({
      moduleId,
      permission: '*',
      action: 'revoked_all',
      timestamp: Date.now(),
    });
    this.persist();
  }

  getPermissions(moduleId: string): Map<string, PermissionRecord> {
    return new Map(this.granted.get(moduleId) ?? []);
  }

  /* --- Role-Based Access Control --- */
  private rolePermissions = new Map<string, string[]>();

  defineRole(role: string, permissions: string[]): void {
    this.rolePermissions.set(role, permissions);
  }

  getRolePermissions(role: string): string[] {
    return this.rolePermissions.get(role) ?? [];
  }

  async checkRole(role: string, permission: string): Promise<boolean> {
    const perms = this.rolePermissions.get(role);
    if (!perms) return false;
    return perms.includes(permission) || perms.includes('*');
  }

  /* --- Permission Hierarchy / Inheritance --- */
  private hierarchy = new Map<string, string[]>();

  setHierarchy(parent: string, children: string[]): void {
    this.hierarchy.set(parent, children);
  }

  getInheritedPermissions(permission: string): string[] {
    const result: string[] = [permission];
    for (const [parent, children] of this.hierarchy) {
      if (children.includes(permission)) {
        result.push(parent);
        result.push(...this.getInheritedPermissions(parent));
      }
    }
    return [...new Set(result)];
  }

  /* --- Permission Dependencies --- */
  setDependency(permission: string, requires: string[]): void {
    this.dependencyGraph.set(permission, requires);
  }

  async checkDependencies(
    moduleId: string,
    permission: string
  ): Promise<boolean> {
    const deps = this.dependencyGraph.get(permission);
    if (!deps || deps.length === 0) return true;
    for (const dep of deps) {
      const ok = await this.check(moduleId, dep);
      if (!ok) return false;
    }
    return true;
  }

  /* --- Batch Check --- */
  async batchCheck(
    moduleId: string,
    permissions: string[]
  ): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    for (const perm of permissions) {
      results[perm] = await this.check(moduleId, perm);
    }
    return results;
  }

  /* --- Groups --- */
  registerGroup(group: PermissionGroup): void {
    this.groups.set(group.id, group);
  }

  getGroup(id: string): PermissionGroup | undefined {
    return this.groups.get(id);
  }

  getAllGroups(): PermissionGroup[] {
    return Array.from(this.groups.values());
  }

  /* --- Templates --- */
  registerTemplate(template: PermissionTemplate): void {
    this.templates.set(template.id, template);
  }

  applyTemplate(moduleId: string, templateId: string): void {
    const template = this.templates.get(templateId);
    if (!template)
      throw new Error(`Permission template "${templateId}" not found`);
    for (const perm of template.permissions) {
      this.grant(moduleId, perm, 'always');
    }
  }

  getTemplates(): PermissionTemplate[] {
    return Array.from(this.templates.values());
  }

  /* --- Defaults --- */
  private defaults = new Map<string, string[]>();

  setDefaults(moduleId: string, permissions: string[]): void {
    this.defaults.set(moduleId, permissions);
  }

  applyDefaults(moduleId: string): void {
    const perms = this.defaults.get(moduleId);
    if (perms) {
      for (const perm of perms) {
        if (!this.granted.get(moduleId)?.has(perm)) {
          this.grant(moduleId, perm, 'always');
        }
      }
    }
  }

  /* --- Override --- */
  override(
    moduleId: string,
    permission: string,
    allowed: boolean,
    siteId?: string,
    pageId?: string
  ): void {
    const key = siteId
      ? `${moduleId}:${siteId}:${pageId ?? '*'}:${permission}`
      : `${moduleId}:${permission}`;
    if (allowed) {
      this.grant(moduleId, key, 'always');
    } else {
      this.revoke(moduleId, key);
    }
  }

  /* --- Audit --- */
  getAuditLog(moduleId?: string) {
    if (moduleId) return this.auditLog.filter((a) => a.moduleId === moduleId);
    return this.auditLog;
  }

  /* --- Expiry --- */
  cleanExpired(): void {
    const now = Date.now();
    for (const [moduleId, perms] of this.granted) {
      for (const [perm, record] of perms) {
        if (record.expiresAt && record.expiresAt <= now) {
          perms.delete(perm);
          this.auditLog.push({
            moduleId,
            permission: perm,
            action: 'expired',
            timestamp: now,
          });
        }
      }
    }
  }

  /* --- Caching --- */
  setCacheEnabled(enabled: boolean): void {
    this.cacheEnabled = enabled;
    if (!enabled) this.cache.clear();
  }

  clearCache(): void {
    this.cache.clear();
  }

  /* --- Persistence --- */
  setPersistence(adapter: {
    save(records: PermissionRecord[]): Promise<void>;
    load(): Promise<PermissionRecord[]>;
  }): void {
    this.persistenceAdapter = adapter;
  }

  private async persist(): Promise<void> {
    if (!this.persistenceAdapter) return;
    const records: PermissionRecord[] = [];
    for (const [, perms] of this.granted) {
      for (const [, record] of perms) {
        records.push(record);
      }
    }
    await this.persistenceAdapter.save(records);
  }

  async loadPersisted(): Promise<void> {
    if (!this.persistenceAdapter) return;
    const records = await this.persistenceAdapter.load();
    for (const record of records) {
      if (!this.granted.has(record.moduleId)) {
        this.granted.set(record.moduleId, new Map());
      }
      this.granted.get(record.moduleId)!.set(record.permission, record);
    }
  }

  /* --- Escalation Prevention --- */
  private escalationRules: Array<{
    from: string;
    to: string;
    allowed: boolean;
  }> = [];

  addEscalationRule(
    fromPermission: string,
    toPermission: string,
    allowed: boolean
  ): void {
    this.escalationRules.push({
      from: fromPermission,
      to: toPermission,
      allowed,
    });
  }

  canEscalate(fromPermission: string, toPermission: string): boolean {
    const rule = this.escalationRules.find(
      (r) => r.from === fromPermission && r.to === toPermission
    );
    return rule?.allowed ?? false;
  }

  /* --- Migration --- */
  async migratePermissions(versionMap: Record<string, string>): Promise<void> {
    for (const [oldPerm, newPerm] of Object.entries(versionMap)) {
      for (const [, perms] of this.granted) {
        const record = perms.get(oldPerm);
        if (record) {
          perms.delete(oldPerm);
          perms.set(newPerm, { ...record, permission: newPerm });
        }
      }
    }
    await this.persist();
  }
}
