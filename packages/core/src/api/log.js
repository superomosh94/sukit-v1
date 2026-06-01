export function createLogAPI(moduleId) {
    const prefix = moduleId ? `[${moduleId}]` : "[Kernel]";
    return {
        debug(message, meta) {
            console.debug(`${prefix} ${message}`, meta ?? "");
        },
        info(message, meta) {
            console.info(`${prefix} ${message}`, meta ?? "");
        },
        warn(message, meta) {
            console.warn(`${prefix} ${message}`, meta ?? "");
        },
        error(message, error) {
            console.error(`${prefix} ${message}`, error ?? "");
        },
        forModule(moduleId) {
            return createLogAPI(moduleId);
        },
    };
}
//# sourceMappingURL=log.js.map