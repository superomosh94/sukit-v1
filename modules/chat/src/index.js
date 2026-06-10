import manifest from '../manifest.json';
export { useChatStore } from './stores/chatStore';
export { TrainingConfig } from './components/TrainingConfig';
export { LeadCapture } from './components/LeadCapture';
export { ChatAnalytics } from './components/ChatAnalytics';
export { ConversationList } from './components/ConversationList';
const chatModule = {
    manifest: manifest,
    async activate(kernel) {
        kernel.log.info('[Chat] Activating...');
    },
    async deactivate(kernel) {
        kernel.log.info('[Chat] Deactivating...');
    },
};
export default chatModule;
export { ChatWidget } from './widget';
export { ChatSettings } from './settings';
//# sourceMappingURL=index.js.map