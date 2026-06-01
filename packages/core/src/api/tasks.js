let _adapter = null;
export function setTasksAdapter(adapter) {
    _adapter = adapter;
}
export function createTasksAPI(adapter) {
    const a = () => adapter ?? _adapter;
    return {
        async enqueue(task) {
            return a().enqueue(task);
        },
        async schedule(task) {
            return a().schedule(task);
        },
        async status(taskId) {
            return a().getStatus(taskId);
        },
        async cancel(taskId) {
            return a().cancel(taskId);
        },
    };
}
