export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
    .replace(/--+/g, "-");
}

export function slugifyUnique(text: string, existing: string[]): string {
  let slug = slugify(text);
  if (!existing.includes(slug)) return slug;
  let i = 1;
  while (existing.includes(`${slug}-${i}`)) i++;
  return `${slug}-${i}`;
}
