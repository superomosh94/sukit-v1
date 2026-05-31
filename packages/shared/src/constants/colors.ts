export const DEFAULT_COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  accent: '#F59E0B',
  background: '#FFFFFF',
  text: '#111827',
  heading: '#111827',
  link: '#3B82F6',
  linkHover: '#2563EB',
  muted: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

export const THEME_COLORS = {
  light: {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  },
  dark: {
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
  },
} as const;

export const COLOR_PALETTE = [
  { name: 'Slate', shades: ['#64748B', '#475569', '#334155', '#1E293B'] },
  { name: 'Gray', shades: ['#6B7280', '#4B5563', '#374151', '#1F2937'] },
  { name: 'Zinc', shades: ['#71717A', '#52525B', '#3F3F46', '#27272A'] },
  { name: 'Red', shades: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B'] },
  { name: 'Orange', shades: ['#F97316', '#EA580C', '#C2410C', '#9A3412'] },
  { name: 'Amber', shades: ['#F59E0B', '#D97706', '#B45309', '#92400E'] },
  { name: 'Yellow', shades: ['#EAB308', '#CA8A04', '#A16207', '#854D0E'] },
  { name: 'Green', shades: ['#22C55E', '#16A34A', '#15803D', '#166534'] },
  { name: 'Emerald', shades: ['#10B981', '#059669', '#047857', '#065F46'] },
  { name: 'Teal', shades: ['#14B8A6', '#0D9488', '#0F766E', '#115E59'] },
  { name: 'Cyan', shades: ['#06B6D4', '#0891B2', '#0E7490', '#155E75'] },
  { name: 'Blue', shades: ['#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF'] },
  { name: 'Indigo', shades: ['#6366F1', '#4F46E5', '#4338CA', '#3730A3'] },
  { name: 'Violet', shades: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'] },
  { name: 'Purple', shades: ['#A855F7', '#9333EA', '#7E22CE', '#6B21A8'] },
  { name: 'Pink', shades: ['#EC4899', '#DB2777', '#BE185D', '#9D174D'] },
] as const;
