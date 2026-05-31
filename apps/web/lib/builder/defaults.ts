import type { Section, Column, Block } from "./types";

export function createDefaultSection(type: string): Section {
  const col = createDefaultColumn();
  const section: Section = {
    id: crypto.randomUUID(),
    pageId: "",
    sectionType: type,
    sortKey: '',
    settings: {
      backgroundColor: "transparent",
      paddingTop: 60,
      paddingBottom: 60,
      paddingLeft: 16,
      paddingRight: 16,
      maxWidth: 1200,
    },
    responsive: {},
    columns: [col],
  };
  col.sectionId = section.id;
  return section;
}

export function createDefaultColumn(): Column {
  return {
    id: crypto.randomUUID(),
    sectionId: "",
    gridRow: 1,
    gridCol: 1,
    span: 12,
    sortKey: '',
    settings: {},
    blocks: [],
  };
}

export function createDefaultBlock(blockType: string): Block {
  return {
    id: crypto.randomUUID(),
    blockType,
    sortKey: '',
    props: {},
    styles: {},
    responsive: {},
    animation: {
      type: "none",
      duration: 300,
      delay: 0,
      easing: "ease-out",
      cascadeLevel: 0,
    },
  };
}

export function createDefaultParallaxSlide(): Section {
  const section = createDefaultSection("parallax");
  section.settings = {
    ...section.settings,
    minHeight: "100vh",
    backgroundAttachment: "fixed",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
  return section;
}
