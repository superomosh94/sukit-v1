export function cn(...classes) {
  return classes
    .flatMap(c => {
      if (typeof c === 'string') return c;
      if (typeof c === 'object' && c !== null)
        return Object.entries(c).filter(([, v]) => v).map(([k]) => k);
      return [];
    })
    .filter(Boolean)
    .join(' ');
}
