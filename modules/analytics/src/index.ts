import type { Module, KernelForModule } from "@sukit/core";
import manifest from "../manifest.json";

const analyticsModule: Module = {
  manifest: manifest as any,

  async activate(kernel: KernelForModule) {
    kernel.log.info("[Analytics] Activating...");

    kernel.settings.registerPanel({
      id: "analytics",
      label: "Analytics",
      icon: "BarChart3",
      component: () => <div>Analytics Settings</div>,
    });
  },

  async deactivate(kernel: KernelForModule) {
    kernel.log.info("[Analytics] Deactivating...");
  },
};

export default analyticsModule;
