import { PermissionManager } from "../internal/permission-manager";

export function createPermissionsAPI(manager: PermissionManager, moduleId?: string) {
  return {
    async check(permission: string): Promise<boolean> {
      return manager.check(moduleId ?? "", permission);
    },

    async request(permission: string, reason: string): Promise<boolean> {
      return manager.request(moduleId ?? "", permission, reason);
    },
  };
}

export type PermissionsAPI = ReturnType<typeof createPermissionsAPI>;
