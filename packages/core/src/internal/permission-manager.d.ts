export interface PermissionRecord {
  moduleId: string;
  permission: string;
  level: 'always' | 'once';
}
export declare class PermissionManager {
  private granted;
  check(moduleId: string, permission: string): Promise<boolean>;
  request(
    moduleId: string,
    permission: string,
    reason: string
  ): Promise<boolean>;
  grant(moduleId: string, permission: string, level: 'always' | 'once'): void;
  revoke(moduleId: string, permission: string): void;
  revokeAll(moduleId: string): void;
  getPermissions(moduleId: string): Map<string, string>;
}
