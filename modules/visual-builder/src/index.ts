import type { Module, KernelForModule } from "@sukit/core";
import manifest from "../manifest.json";

const visualBuilderModule: Module = {
  manifest: manifest as any,

  async activate(kernel: KernelForModule) {
    kernel.log.info("[VisualBuilder] Activating...");

    const blocks = await import("./blocks");
    blocks.registerAll(kernel);

    kernel.events.on("page:beforeSave", async ({ pageId, content }) => {
      kernel.log.debug(`Page ${pageId} about to save`);
    });

    kernel.events.on("page:afterSave", async ({ pageId, content }) => {
      kernel.log.debug(`Page ${pageId} saved`);
    });
  },

  async deactivate(kernel: KernelForModule) {
    kernel.log.info("[VisualBuilder] Deactivating...");
    const blockTypes = [
      "container", "section", "row", "column", "grid", "stack",
      "heading", "paragraph", "text", "link", "list", "quote", "code",
      "accordion", "tabs", "carousel", "card", "table", "testimonial",
      "pricing", "faq", "menu", "breadcrumb", "back-to-top",
      "image", "gallery", "video", "icon", "avatar", "map", "divider", "spacer",
      "form", "button",
    ];
    blockTypes.forEach((type) => kernel.blocks.unregister(type));
  },
};

export default visualBuilderModule;
