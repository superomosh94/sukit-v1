import type { SukitKernel } from "@sukit/core";

export function registerAll(kernel: SukitKernel): void {
  const blockTypes = [
    { type: "container", name: "Container", category: "layout", icon: "Square" },
    { type: "section", name: "Section", category: "layout", icon: "Rows" },
    { type: "row", name: "Row", category: "layout", icon: "Columns2" },
    { type: "column", name: "Column", category: "layout", icon: "Columns3" },
    { type: "grid", name: "Grid", category: "layout", icon: "Grid3x3" },
    { type: "stack", name: "Stack", category: "layout", icon: "Layers" },
    { type: "divider", name: "Divider", category: "layout", icon: "SeparatorHorizontal" },
    { type: "spacer", name: "Spacer", category: "layout", icon: "Expand" },
    { type: "heading", name: "Heading", category: "content", icon: "Heading" },
    { type: "paragraph", name: "Paragraph", category: "content", icon: "Text" },
    { type: "text", name: "Rich Text", category: "content", icon: "FileText" },
    { type: "link", name: "Link", category: "content", icon: "Link" },
    { type: "list", name: "List", category: "content", icon: "List" },
    { type: "quote", name: "Quote", category: "content", icon: "Quote" },
    { type: "code", name: "Code", category: "content", icon: "Code" },
    { type: "accordion", name: "Accordion", category: "content", icon: "ChevronDown" },
    { type: "tabs", name: "Tabs", category: "content", icon: "FileStack" },
    { type: "carousel", name: "Carousel", category: "content", icon: "GalleryHorizontal" },
    { type: "card", name: "Card", category: "content", icon: "CreditCard" },
    { type: "table", name: "Table", category: "content", icon: "Table" },
    { type: "testimonial", name: "Testimonial", category: "content", icon: "MessageSquareQuote" },
    { type: "pricing", name: "Pricing Table", category: "content", icon: "DollarSign" },
    { type: "faq", name: "FAQ", category: "content", icon: "HelpCircle" },
    { type: "menu", name: "Menu", category: "content", icon: "Menu" },
    { type: "breadcrumb", name: "Breadcrumb", category: "content", icon: "ChevronRight" },
    { type: "back-to-top", name: "Back to Top", category: "content", icon: "ArrowUpToLine" },
    { type: "image", name: "Image", category: "media", icon: "Image" },
    { type: "gallery", name: "Gallery", category: "media", icon: "Images" },
    { type: "video", name: "Video", category: "media", icon: "Video" },
    { type: "icon", name: "Icon", category: "media", icon: "Smile" },
    { type: "avatar", name: "Avatar", category: "media", icon: "UserCircle" },
    { type: "map", name: "Map", category: "media", icon: "MapPin" },
    { type: "form", name: "Form", category: "forms", icon: "FileInput" },
    { type: "button", name: "Button", category: "forms", icon: "MousePointerClick" },
  ];

  blockTypes.forEach(({ type, name, category, icon }) => {
    kernel.blocks.register({
      type,
      name,
      description: `${name} block`,
      category: category as any,
      icon,
      component: PlaceholderBlock,
      schema: { type, properties: {} },
      defaultProps: {},
      defaultStyles: {},
    });
  });
}

function PlaceholderBlock({ type }: { type?: string }) {
  return <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-sm text-gray-500">{type ?? "Block"}</div>;
}
