import React from 'react';
import { cn } from '../../utils/cn';

export const ResponsiveStyles = ({ 
    children, 
    mobile: mobileStyles,
    tablet: tabletStyles,
    desktop: desktopStyles,
    wide: wideStyles,
    landscape: landscapeStyles,
    portrait: portraitStyles,
    className 
}) => {
    const getResponsiveClasses = () => {
        const classes = [];
        
        if (mobileStyles) {
            if (typeof mobileStyles === 'string') {
                classes.push(`sm:${mobileStyles}`);
            } else {
                Object.entries(mobileStyles).forEach(([key, value]) => {
                    classes.push(`sm:${key}-${value}`);
                });
            }
        }
        
        if (tabletStyles) {
            if (typeof tabletStyles === 'string') {
                classes.push(`md:${tabletStyles}`);
            } else {
                Object.entries(tabletStyles).forEach(([key, value]) => {
                    classes.push(`md:${key}-${value}`);
                });
            }
        }
        
        if (desktopStyles) {
            if (typeof desktopStyles === 'string') {
                classes.push(`lg:${desktopStyles}`);
            } else {
                Object.entries(desktopStyles).forEach(([key, value]) => {
                    classes.push(`lg:${key}-${value}`);
                });
            }
        }
        
        if (wideStyles) {
            if (typeof wideStyles === 'string') {
                classes.push(`xl:${wideStyles}`);
            } else {
                Object.entries(wideStyles).forEach(([key, value]) => {
                    classes.push(`xl:${key}-${value}`);
                });
            }
        }
        
        return classes.join(' ');
    };

    const orientationClasses = [];
    if (landscapeStyles) orientationClasses.push(`landscape:${landscapeStyles}`);
    if (portraitStyles) orientationClasses.push(`portrait:${portraitStyles}`);

    return (
        <div className={cn(getResponsiveClasses(), orientationClasses.join(' '), className)}>
            {children}
        </div>
    );
};

export default ResponsiveStyles;