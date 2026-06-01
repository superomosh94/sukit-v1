import type { Module, KernelForModule } from '@sukit/core';
import manifest from '../manifest.json';
const m: Module = {
  manifest: manifest as any,
  async activate(k) {
    k.log.info('[Testimonials] Activating...');
  },
  async deactivate(k) {
    k.log.info('[Testimonials] Deactivating...');
  },
};
export default m;
export { TestimonialsDashboard } from './pages/TestimonialsDashboard';
export { TestimonialCard } from './components/TestimonialCard';
export { TestimonialCarousel } from './components/TestimonialCarousel';
export { useTestimonials } from './hooks/useTestimonials';
export { useTestimonialStore } from './stores/testimonialStore';
