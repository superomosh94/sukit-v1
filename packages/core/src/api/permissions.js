export function createPermissionsAPI(manager, moduleId) {
    return {
        async check(permission) {
            return manager.check(moduleId ?? "", permission);
        },
        async request(permission, reason) {
            return manager.request(moduleId ?? "", permission, reason);
        },
    };
}
