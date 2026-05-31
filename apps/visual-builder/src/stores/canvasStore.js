import { create } from 'zustand';

export const useCanvasStore = create((set, get) => ({
    zoom: 100,
    device: 'desktop',
    gridSize: 8,
    snapToGrid: false,
    showGrid: true,
    panOffset: { x: 0, y: 0 },
    
    setZoom: (zoom) => set({ zoom: Math.min(400, Math.max(25, zoom)) }),
    zoomIn: () => get().setZoom(get().zoom + 25),
    zoomOut: () => get().setZoom(get().zoom - 25),
    resetZoom: () => set({ zoom: 100 }),
    setDevice: (device) => set({ device }),
    setGridSize: (gridSize) => set({ gridSize: Math.min(50, Math.max(4, gridSize)) }),
    setSnapToGrid: (snapToGrid) => set({ snapToGrid }),
    setShowGrid: (showGrid) => set({ showGrid }),
    toggleGrid: () => set(state => ({ showGrid: !state.showGrid })),
    toggleSnap: () => set(state => ({ snapToGrid: !state.snapToGrid })),
    setPanOffset: (panOffset) => set({ panOffset }),
    resetPan: () => set({ panOffset: { x: 0, y: 0 } }),
}));
