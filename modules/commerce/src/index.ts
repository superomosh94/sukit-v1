import type { Module, KernelForModule } from '@sukit/core';
import manifest from '../manifest.json';

export { useCommerceStore } from './stores/commerceStore';
export type {
  Product,
  CartItem,
  Order,
  Address,
  CheckoutStep,
} from './stores/commerceStore';
export { ProductGrid } from './components/ProductGrid';
export { CartDrawer } from './components/CartDrawer';
export { CheckoutForm } from './components/CheckoutForm';
export { OrderHistory } from './components/OrderHistory';
export { PaymentConfig } from './components/PaymentConfig';

const commerceModule: Module = {
  manifest: manifest as any,

  async activate(kernel: KernelForModule) {
    kernel.log.info('[Commerce] Activating...');

    kernel.blocks.register({
      type: 'productGrid',
      name: 'Product Grid',
      description: 'E-commerce product listing grid',
      category: 'widgets',
      icon: 'ShoppingBag',
      component: () => null,
      schema: {},
      defaultProps: {},
      defaultStyles: {},
    });
  },

  async deactivate(kernel: KernelForModule) {
    kernel.log.info('[Commerce] Deactivating...');
    kernel.blocks.unregister('productGrid');
  },
};

export default commerceModule;
