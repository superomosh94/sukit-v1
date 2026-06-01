export class PermissionManager {
    granted = new Map();
    async check(moduleId, permission) {
        return this.granted.get(moduleId)?.has(permission) ?? false;
    }
    async request(moduleId, permission, reason) {
        if (this.granted.get(moduleId)?.has(permission))
            return true;
        this.grant(moduleId, permission, "once");
        return true;
    }
    grant(moduleId, permission, level) {
        if (!this.granted.has(moduleId)) {
            this.granted.set(moduleId, new Map());
        }
        this.granted.get(moduleId).set(permission, level);
    }
    revoke(moduleId, permission) {
        this.granted.get(moduleId)?.delete(permission);
    }
    revokeAll(moduleId) {
        this.granted.delete(moduleId);
    }
    getPermissions(moduleId) {
        return new Map(this.granted.get(moduleId) ?? []);
    }
}
