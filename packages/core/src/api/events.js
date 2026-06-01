export function createEventsAPI(bus) {
    return {
        on(event, handler) {
            return bus.on(event, handler);
        },
        once(event, handler) {
            bus.once(event, handler);
        },
        async emit(event, payload) {
            await bus.emit(event, payload);
        },
        off(event, handler) {
            bus.off(event, handler);
        },
    };
}
