export class PermissionManager {
  private grantedPermissions = new Map<string, Set<string>>();

  grant(moduleId: string, action: string): void {
    if (!this.grantedPermissions.has(moduleId)) {
      this.grantedPermissions.set(moduleId, new Set());
    }
    this.grantedPermissions.get(moduleId)!.add(action);
  }

  revoke(moduleId: string, action: string): void {
    this.grantedPermissions.get(moduleId)?.delete(action);
  }

  revokeAll(moduleId: string): void {
    this.grantedPermissions.delete(moduleId);
  }

  check(moduleId: string, action: string): boolean {
    return this.grantedPermissions.get(moduleId)?.has(action) ?? false;
  }

  async request(moduleId: string, action: string): Promise<boolean> {
    if (this.check(moduleId, action)) return true;
    this.grant(moduleId, action);
    return true;
  }

  getGrantedPermissions(moduleId: string): string[] {
    return Array.from(this.grantedPermissions.get(moduleId) ?? []);
  }
}

export const permissionManager = new PermissionManager();
