import { PermissionManager } from '../internal/permission-manager';
export declare function createPermissionsAPI(
  manager: PermissionManager,
  moduleId?: string
): {
  check(permission: string): Promise<boolean>;
  request(permission: string, reason: string): Promise<boolean>;
};
export type PermissionsAPI = ReturnType<typeof createPermissionsAPI>;
