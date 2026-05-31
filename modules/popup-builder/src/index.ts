import type { Module, KernelForModule } from "@sukit/core";
import manifest from "../manifest.json";

const popupBuilderModule: Module = {
  manifest: manifest as any,

  async activate(kernel: KernelForModule) {
    kernel.log.info("[PopupBuilder] Activating...");

    kernel.events.on("page:afterSave", async ({ pageId }) => {
      kernel.log.debug(`Checking popups for page ${pageId}`);
    });
  },

  async deactivate(kernel: KernelForModule) {
    kernel.log.info("[PopupBuilder] Deactivating...");
  },
};

export default popupBuilderModule;

export { PopupDashboard } from "./pages/PopupDashboard";
export { PopupEditor } from "./pages/PopupEditor";
export { PopupRenderer } from "./components/PopupRenderer";
export { PopupAnalytics } from "./components/PopupAnalytics";
export { usePopups, usePopupTriggers } from "./hooks/usePopup";
export { usePopupStore } from "./stores/popupStore";
