import { z } from "zod";

export const animationSchema = z.object({
  type: z.enum([
    "fadeIn",
    "slideUp",
    "slideLeft",
    "slideRight",
    "scaleIn",
    "rotateIn",
    "flipIn",
    "typewriter",
    "none",
  ]),
  duration: z.number().min(0).max(10000).default(300),
  delay: z.number().min(0).max(10000).default(0),
  easing: z.string().default("ease-out"),
  cascadeLevel: z.number().min(0).max(10).default(0),
});

export const responsiveOverridesSchema = z.record(
  z.string(),
  z.object({
    props: z.record(z.string(), z.unknown()).optional(),
    styles: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
    hidden: z.boolean().optional(),
  }),
);

export const blockSchema = z.object({
  id: z.string(),
  blockType: z.string(),
  sortKey: z.string(),
  props: z.record(z.string(), z.unknown()),
  styles: z.record(z.string(), z.union([z.string(), z.number()])),
  responsive: responsiveOverridesSchema,
  animation: animationSchema,
});

export const columnSchema = z.object({
  id: z.string(),
  sectionId: z.string(),
  gridRow: z.number(),
  gridCol: z.number(),
  span: z.number().min(1).max(12),
  sortKey: z.string(),
  settings: z.record(z.string(), z.unknown()),
  blocks: z.array(blockSchema),
});

export const sectionSchema = z.object({
  id: z.string(),
  pageId: z.string(),
  sectionType: z.string(),
  sortKey: z.string(),
  settings: z.record(z.string(), z.unknown()),
  responsive: responsiveOverridesSchema,
  columns: z.array(columnSchema),
});

export const pageSettingsSchema = z.object({
  headHtml: z.string().default(""),
  pageSettings: z.record(z.string(), z.unknown()).default({}),
  seoSettings: z.record(z.string(), z.unknown()).default({}),
});

export const pageSchema = z.object({
  id: z.string(),
  siteId: z.string(),
  title: z.string().min(1),
  slug: z.string(),
  isHome: z.boolean().default(false),
  pageSettings: pageSettingsSchema,
  sections: z.array(sectionSchema),
});

export const siteSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  domain: z.string().optional(),
});

export const siteSettingsSchema = z.object({
  theme: z.object({
    primaryColor: z.string().default("#0f172a"),
    secondaryColor: z.string().default("#64748b"),
    backgroundColor: z.string().default("#ffffff"),
    textColor: z.string().default("#0f172a"),
    fontFamily: z.string().default("Inter"),
    headingFont: z.string().default("Inter"),
    borderRadius: z.number().default(8),
  }),
  typography: z.record(z.string(), z.unknown()).default({}),
  seo: z.object({
    defaultTitle: z.string().default(""),
    defaultDescription: z.string().default(""),
    favicon: z.string().default(""),
  }),
  domain: z.object({
    custom: z.string().nullable().default(null),
    subdomain: z.string().default(""),
  }),
  code: z.object({
    head: z.string().default(""),
    body: z.string().default(""),
  }),
});

export function validateBlock(data: unknown) {
  return blockSchema.safeParse(data);
}

export function validateSection(data: unknown) {
  return sectionSchema.safeParse(data);
}

export function validatePage(data: unknown) {
  return pageSchema.safeParse(data);
}

export function validateSite(data: unknown) {
  return siteSchema.safeParse(data);
}
