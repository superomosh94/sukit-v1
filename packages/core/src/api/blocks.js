import React from 'react';
export function createBlocksAPI() {
    const blocks = new Map();
    return {
        register(block) {
            blocks.set(block.type, block);
        },
        unregister(type) {
            blocks.delete(type);
        },
        get(type) {
            return blocks.get(type);
        },
        getAll() {
            return Array.from(blocks.values());
        },
        getByCategory(category) {
            return this.getAll().filter((b) => b.category === category);
        },
        render(block) {
            const def = blocks.get(block.blockType);
            if (!def)
                return null;
            return React.createElement(def.component, block.props);
        },
    };
}
//# sourceMappingURL=blocks.js.map