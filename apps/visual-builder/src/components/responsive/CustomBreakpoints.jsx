import React, { createContext, useContext, useState, useEffect } from 'react';

const BreakpointsContext = createContext();

export const useBreakpoints = () => {
    const context = useContext(BreakpointsContext);
    if (!context) {
        throw new Error('useBreakpoints must be used within BreakpointsProvider');
    }
    return context;
};

export const BreakpointsProvider = ({ 
    children, 
    customBreakpoints = {} 
}) => {
    const [breakpoints, setBreakpoints] = useState({
        xs: 480,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536,
        ...customBreakpoints,
    });
    
    const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');
    
    useEffect(() => {
        const updateBreakpoint = () => {
            const width = window.innerWidth;
            const sorted = Object.entries(breakpoints).sort((a, b) => b[1] - a[1]);
            
            for (const [name, bp] of sorted) {
                if (width >= bp) {
                    setCurrentBreakpoint(name);
                    break;
                }
            }
        };
        
        updateBreakpoint();
        window.addEventListener('resize', updateBreakpoint);
        return () => window.removeEventListener('resize', updateBreakpoint);
    }, [breakpoints]);
    
    const isBreakpoint = (breakpoint) => {
        const bpValue = breakpoints[breakpoint];
        if (!bpValue) return false;
        return window.innerWidth >= bpValue;
    };
    
    const isBetween = (start, end) => {
        const width = window.innerWidth;
        return width >= breakpoints[start] && width < breakpoints[end];
    };
    
    return (
        <BreakpointsContext.Provider value={{
            breakpoints,
            currentBreakpoint,
            isBreakpoint,
            isBetween,
            setBreakpoints,
        }}>
            {children}
        </BreakpointsContext.Provider>
    );
};

export default BreakpointsProvider;
📦 BATCH 3: TOUCH GESTURES & ORIENTATION