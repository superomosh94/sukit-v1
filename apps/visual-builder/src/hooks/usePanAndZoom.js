import { useState, useRef, useCallback } from 'react';

export const usePanAndZoom = (initialZoom = 100) => {
    const [zoom, setZoom] = useState(initialZoom);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const panStartRef = useRef({ x: 0, y: 0 });
    const canvasRef = useRef(null);

    const zoomIn = useCallback(() => {
        setZoom(prev => Math.min(prev + 25, 400));
    }, []);

    const zoomOut = useCallback(() => {
        setZoom(prev => Math.max(prev - 25, 25));
    }, []);

    const resetZoom = useCallback(() => {
        setZoom(100);
        setPan({ x: 0, y: 0 });
    }, []);

    const fitToScreen = useCallback(() => {
        resetZoom();
    }, [resetZoom]);

    const startPan = useCallback((e) => {
        if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
            setIsPanning(true);
            panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
            e.preventDefault();
        }
    }, [pan]);

    const onPan = useCallback((e) => {
        if (isPanning) {
            const newX = e.clientX - panStartRef.current.x;
            const newY = e.clientY - panStartRef.current.y;
            setPan({ x: newX, y: newY });
        }
    }, [isPanning]);

    const endPan = useCallback(() => {
        setIsPanning(false);
    }, []);

    const handleWheel = useCallback((e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            if (e.deltaY < 0) {
                zoomIn();
            } else {
                zoomOut();
            }
        }
    }, [zoomIn, zoomOut]);

    const getTransform = useCallback(() => {
        return `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`;
    }, [pan, zoom]);

    return {
        zoom,
        pan,
        isPanning,
        canvasRef,
        zoomIn,
        zoomOut,
        resetZoom,
        fitToScreen,
        startPan,
        onPan,
        endPan,
        handleWheel,
        getTransform
    };
};
