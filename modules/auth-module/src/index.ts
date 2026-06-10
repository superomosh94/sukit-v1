import type { Module, KernelForModule } from '@sukit/core';
import manifest from '../manifest.json';

export { SocialLoginButtons } from './components/SocialLoginButtons';
export { WebAuthnRegister } from './components/WebAuthnRegister';
export { LoginPage } from './pages/LoginPage';
export { RegisterPage } from './pages/RegisterPage';
export { PasswordResetPage } from './pages/PasswordResetPage';
export { TwoFactorSetupPage } from './pages/TwoFactorSetupPage';

const authModule: Module = {
  manifest: manifest as any,

  async activate(kernel: KernelForModule) {
    kernel.log.info('[Auth] Activating authentication module...');
  },

  async deactivate(kernel: KernelForModule) {
    kernel.log.info('[Auth] Deactivating authentication module...');
  },
};

export default authModule;
