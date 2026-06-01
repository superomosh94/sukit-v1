import manifest from "../manifest.json";
const chatModule = {
    manifest: manifest,
    async activate(kernel) {
        kernel.log.info("[Chat] Activating...");
    },
    async deactivate(kernel) {
        kernel.log.info("[Chat] Deactivating...");
    },
};
export default chatModule;
export { ChatWidget } from "./widget";
export { ChatSettings } from "./settings";
export { handleMessage, handleUpload } from "./api";
//# sourceMappingURL=index.js.map