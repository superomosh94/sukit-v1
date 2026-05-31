import type { Module, KernelForModule } from "@sukit/core";
import manifest from "../manifest.json";

const chatModule: Module = {
  manifest: manifest as any,

  async activate(kernel: KernelForModule) {
    kernel.log.info("[Chat] Activating...");
  },

  async deactivate(kernel: KernelForModule) {
    kernel.log.info("[Chat] Deactivating...");
  },
};

export default chatModule;

export { ChatWidget } from "./widget";
export { ChatSettings } from "./settings";
export { handleMessage, handleUpload } from "./api";
