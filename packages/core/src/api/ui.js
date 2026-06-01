import React from 'react';
export function createUIAPI() {
    const slots = new Map();
    return {
        registerSlot(slot, component, options = {}) {
            if (!slots.has(slot))
                slots.set(slot, []);
            const list = slots.get(slot);
            list.push({ component, options, id: `${slot}-${list.length}` });
            list.sort((a, b) => (a.options.position ?? 50) - (b.options.position ?? 50));
        },
        renderSlot(slot, props) {
            const components = slots.get(slot);
            if (!components)
                return null;
            return components.map(({ component: Component, id }) => React.createElement(Component, { ...props, key: id }));
        },
        getSlotComponents(slot) {
            return slots.get(slot) ?? [];
        },
    };
}
//# sourceMappingURL=ui.js.map