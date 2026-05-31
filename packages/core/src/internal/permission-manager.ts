export interface PermissionRecord {
  moduleId: string;
  permission: string;
  level: "always" | "once";
}

export class PermissionManager {
  private granted = new Map<string, Map<string, string>>();

  async check(moduleId: string, permission: string): Promise<boolean> {
    return this.granted.get(moduleId)?.has(permission) ?? false;
  }

  async request(moduleId: string, permission: string, reason: string): Promise<boolean> {
    if (this.granted.get(moduleId)?.has(permission)) return true;
    this.grant(moduleId, permission, "once");
    return true;
  }

  grant(moduleId: string, permission: string, level: "always" | "once"): void {
    if (!this.granted.has(moduleId)) {
      this.granted.set(moduleId, new Map());
    }
    this.granted.get(moduleId)!.set(permission, level);
  }

  revoke(moduleId: string, permission: string): void {
    this.granted.get(moduleId)?.delete(permission);
  }

  revokeAll(moduleId: string): void {
    this.granted.delete(moduleId);
  }

  getPermissions(moduleId: string): Map<string, string> {
    return new Map(this.granted.get(moduleId) ?? []);
  }
}
