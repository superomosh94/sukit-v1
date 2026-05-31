import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { cn } from '../../utils/cn';

export const HideOnDevice = ({ 
    children, 
    mobile = false,
    tablet = false,
    desktop = false,
    wide = false,
    landscape = false,
    portrait = false,
    className 
}) => {
    const { isMobile, isTablet, isDesktop, isLandscape, isPortrait } = useResponsive();
    
    let shouldHide = false;
    
    if (mobile && isMobile) shouldHide = true;
    if (tablet && isTablet) shouldHide = true;
    if (desktop && isDesktop) shouldHide = true;
    if (wide && isDesktop) shouldHide = true;
    if (landscape && isLandscape) shouldHide = true;
    if (portrait && isPortrait) shouldHide = true;
    
    if (shouldHide) return null;
    
    return <div className={className}>{children}</div>;
};

export const ShowOnDevice = ({ 
    children, 
    mobile = false,
    tablet = false,
    desktop = false,
    wide = false,
    className 
}) => {
    const { isMobile, isTablet, isDesktop } = useResponsive();
    
    let shouldShow = false;
    
    if (mobile && isMobile) shouldShow = true;
    if (tablet && isTablet) shouldShow = true;
    if (desktop && isDesktop) shouldShow = true;
    if (wide && isDesktop) shouldShow = true;
    
    if (!shouldShow) return null;
    
    return <div className={className}>{children}</div>;
};

export default HideOnDevice;