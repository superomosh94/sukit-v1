import { useRef, useEffect } from 'react';

export const useTouchGestures = ({ 
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onDoubleTap,
    threshold = 50,
    onTap 
}) => {
    const touchStart = useRef({ x: 0, y: 0, distance: 0 });
    const touchEnd = useRef({ x: 0, y: 0 });
    const lastTap = useRef(0);
    
    useEffect(() => {
        const handleTouchStart = (e) => {
            const touch = e.touches[0];
            touchStart.current.x = touch.clientX;
            touchStart.current.y = touch.clientY;
            
            if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                touchStart.current.distance = Math.hypot(dx, dy);
            }
        };
        
        const handleTouchMove = (e) => {
            if (e.touches.length === 2 && onPinch) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const distance = Math.hypot(dx, dy);
                const scale = distance / touchStart.current.distance;
                onPinch(scale);
                touchStart.current.distance = distance;
                e.preventDefault();
            }
        };
        
        const handleTouchEnd = (e) => {
            const touch = e.changedTouches[0];
            touchEnd.current.x = touch.clientX;
            touchEnd.current.y = touch.clientY;
            
            const deltaX = touchEnd.current.x - touchStart.current.x;
            const deltaY = touchEnd.current.y - touchStart.current.y;
            
            if (Math.abs(deltaX) > threshold) {
                if (deltaX > 0 && onSwipeRight) onSwipeRight();
                if (deltaX < 0 && onSwipeLeft) onSwipeLeft();
            }
            
            if (Math.abs(deltaY) > threshold) {
                if (deltaY > 0 && onSwipeDown) onSwipeDown();
                if (deltaY < 0 && onSwipeUp) onSwipeUp();
            }
            
            // Double tap detection
            const now = Date.now();
            if (now - lastTap.current < 300 && onDoubleTap) {
                onDoubleTap(e);
            }
            lastTap.current = now;
            
            if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && onTap) {
                onTap(e);
            }
        };
        
        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
        
        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onPinch, onDoubleTap, onTap, threshold]);
};

export const usePinchToZoom = (elementRef, onZoom) => {
    const initialDistance = useRef(0);
    const initialZoom = useRef(1);
    
    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;
        
        const handleTouchStart = (e) => {
            if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                initialDistance.current = Math.hypot(dx, dy);
                initialZoom.current = parseFloat(element.style.transform?.replace(/[^0-9.]/g, '') || 1);
            }
        };
        
        const handleTouchMove = (e) => {
            if (e.touches.length === 2 && initialDistance.current > 0) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const distance = Math.hypot(dx, dy);
                const scale = (distance / initialDistance.current) * initialZoom.current;
                onZoom?.(Math.min(Math.max(scale, 0.5), 3));
                e.preventDefault();
            }
        };
        
        element.addEventListener('touchstart', handleTouchStart);
        element.addEventListener('touchmove', handleTouchMove);
        
        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
        };
    }, [elementRef, onZoom]);
};