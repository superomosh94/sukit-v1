import type { SukitKernel } from "@sukit/core";

export function registerAll(kernel: SukitKernel): void {
  kernel.api.get("/api/builder/blocks", async () => {
    const blocks = kernel.blocks.getAll();
    return new Response(JSON.stringify(blocks), {
      headers: { "Content-Type": "application/json" },
    });
  });

  kernel.api.get("/api/builder/categories", async () => {
    const categories = kernel.blocks.getAll().map((b) => b.category);
    const unique = [...new Set(categories)];
    return new Response(JSON.stringify(unique), {
      headers: { "Content-Type": "application/json" },
    });
  });
}
