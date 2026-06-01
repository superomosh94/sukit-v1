import { PermissionManager } from '../internal/permission-manager';

export function createPermissionsAPI(
  manager: PermissionManager,
  moduleId?: string
) {
  return {
    async check(permission: string): Promise<boolean> {
      return manager.check(moduleId ?? '', permission);
    },

    async request(permission: string, reason: string): Promise<boolean> {
      return manager.request(moduleId ?? '', permission, reason);
    },

    async batchCheck(permissions: string[]): Promise<Record<string, boolean>> {
      return manager.batchCheck(moduleId ?? '', permissions);
    },

    async checkRole(role: string, permission: string): Promise<boolean> {
      return manager.checkRole(role, permission);
    },

    defineRole(role: string, permissions: string[]): void {
      manager.defineRole(role, permissions);
    },

    getRolePermissions(role: string): string[] {
      return manager.getRolePermissions(role);
    },

    getAuditLog() {
      return manager.getAuditLog(moduleId);
    },

    applyDefaults(): void {
      if (moduleId) manager.applyDefaults(moduleId);
    },

    setDefaults(permissions: string[]): void {
      if (moduleId) manager.setDefaults(moduleId, permissions);
    },
  };
}

export type PermissionsAPI = ReturnType<typeof createPermissionsAPI>;
