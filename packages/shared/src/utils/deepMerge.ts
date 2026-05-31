export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const output = { ...target };
  for (const key of Object.keys(source)) {
    const val = source[key as keyof T];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      output[key as keyof T] = deepMerge(
        (target[key as keyof T] || {}) as Record<string, any>,
        val as Record<string, any>
      ) as any;
    } else {
      output[key as keyof T] = val as any;
    }
  }
  return output;
}
