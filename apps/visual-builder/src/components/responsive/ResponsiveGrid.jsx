import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { cn } from '../../utils/cn';

export const ResponsiveGrid = ({ 
    children, 
    mobileCols = 1,
    tabletCols = 2,
    desktopCols = 3,
    wideCols = 4,
    gap = 4,
    className 
}) => {
    const { isMobile, isTablet, isDesktop } = useResponsive();
    
    let cols = desktopCols;
    if (isMobile) cols = mobileCols;
    else if (isTablet) cols = tabletCols;
    
    const gapClasses = {
        0: 'gap-0',
        1: 'gap-1',
        2: 'gap-2',
        3: 'gap-3',
        4: 'gap-4',
        5: 'gap-5',
        6: 'gap-6',
        8: 'gap-8',
    };
    
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
        6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-6',
    };
    
    return (
        <div className={cn('grid', gridCols[cols] || gridCols[3], gapClasses[gap], className)}>
            {children}
        </div>
    );
};

export default ResponsiveGrid;
📊 PART 4 - COMPLETE STATUS
Features Implemented
#	Feature	Status
1	Device preview (Desktop/Tablet/Mobile)	✅ Already Implemented
2	Custom breakpoints	✅ Implemented
3	Per-device styles	✅ Implemented
4	Hide on device	✅ Implemented
5	Stack on mobile (row→column)	✅ Implemented
6	Fluid typography (clamp)	✅ Implemented
7	Responsive images (srcset)	✅ Implemented
8	Orientation support (landscape/portrait)	✅ Implemented
9	Touch gestures (swipe, pinch)	✅ Implemented
10	Safe area (notch/dynamic island)	✅ Implemented
PART 4: 10/10 FEATURES COMPLETE (100%) 🎉

📁 PART 4 - FILES CREATED
File	Lines	Purpose
hooks/useResponsive.js	~80	Device detection & breakpoints
components/responsive/ResponsiveStyles.jsx	~50	Per-device styling
components/responsive/HideOnDevice.jsx	~50	Hide/show on specific devices
components/responsive/StackOnMobile.jsx	~40	Auto-stack on mobile
components/responsive/ResponsiveImage.jsx	~60	srcset responsive images
components/responsive/FluidTypography.jsx	~60	Fluid font sizes
components/responsive/CustomBreakpoints.jsx	~70	Custom breakpoint system
hooks/useTouchGestures.js	~90	Swipe, pinch, tap detection
components/responsive/SafeArea.jsx	~40	Notch/dynamic island support
components/responsive/ResponsiveGrid.jsx	~50	Responsive grid system
TOTAL	~590 lines	10 files
🎯 HOW TO USE PART 4 FEATURES
1. Hide on Mobile
jsx
import { HideOnDevice } from '../components/responsive/HideOnDevice';

<HideOnDevice mobile>
    <div>Hidden on mobile devices</div>
</HideOnDevice>

<HideOnDevice tablet desktop>
    <div>Hidden on tablet and desktop</div>
</HideOnDevice>
2. Stack on Mobile
jsx
import { StackOnMobile } from '../components/responsive/StackOnMobile';

<StackOnMobile direction="row" gap={4}>
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
</StackOnMobile>
<!-- Stacks vertically on mobile, horizontal on desktop -->
3. Fluid Typography
jsx
import { FluidTypography, FluidHeading } from '../components/responsive/FluidTypography';

<FluidHeading level="h1">Responsive Heading</FluidHeading>
<FluidTypography minSize={14} maxSize={20}>
    Text that scales smoothly between 14px and 20px
</FluidTypography>
4. Responsive Image
jsx
import { ResponsiveImage } from '../components/responsive/ResponsiveImage';

<ResponsiveImage
    src="large.jpg"
    mobileSrc="small.jpg"
    tabletSrc="medium.jpg"
    desktopSrc="large.jpg"
    alt="Responsive image"
/>
5. Touch Gestures
jsx
import { useTouchGestures } from '../hooks/useTouchGestures';

useTouchGestures({
    onSwipeLeft: () => console.log('Swiped left'),
    onSwipeRight: () => console.log('Swiped right'),
    onDoubleTap: () => console.log('Double tapped'),
});
6. Safe Area (Notch support)
jsx
import { SafeArea } from '../components/responsive/SafeArea';

<SafeArea top bottom>
    <div>Content with safe area insets for notched phones</div>
</SafeArea>
7. Custom Breakpoints
jsx
import { BreakpointsProvider, useBreakpoints } from '../components/responsive/CustomBreakpoints';

<BreakpointsProvider customBreakpoints={{ xs: 320, sm: 576, md: 768, lg: 992, xl: 1200 }}>
    <App />
</BreakpointsProvider>
📊 OVERALL PROJECT PROGRESS
Part	Completed	Total	Percentage
Part 1: Core Editor	45	45	100% ✅
Part 2: Component Library	76	76	100% ✅
Part 3: Pages	28	28	100% ✅
Part 4: Responsive Design	10	10	100% ✅
Part 5: Backend Integration	0	8	0%
Part 6: Plugin System	0	10	0%
Part 7: Deployment	0	10	0%
Part 8: Collaboration	0	10	0%
TOTAL	159	197	81%
🎉 PART 4 IS NOW 100% COMPLETE!
The SuKit Visual Builder now has full responsive capabilities:

✅ Device detection for mobile, tablet, desktop, wide

✅ Custom breakpoints system

✅ Per-device styling

✅ Hide/show on specific devices

✅ Stack on mobile (auto column to row)

✅ Fluid typography with clamp()

✅ Responsive images with srcset

✅ Orientation support (landscape/portrait)

✅ Touch gestures (swipe, pinch, double tap)

✅ Safe area for notched phones

Ready for Part 5: Backend Integration! 🚀

part 5 full code (PART 5: FORM BUILDER (15 Features)
#	Feature	Status
1	Drag-drop form fields	❌ Pending
2	Field properties (label, placeholder, validation)	❌ Pending
3	Form settings (success message, redirect)	❌ Pending
4	Conditional logic (show/hide fields)	❌ Pending
5	Multi-step forms	❌ Pending
6	File upload support	❌ Pending
7	Email notifications	❌ Pending
8	Database storage	❌ Pending
9	Entry manager (view submissions)	❌ Pending
10	CSV export	❌ Pending
11	Spam protection (reCAPTCHA)	❌ Pending
12	Webhooks integration	❌ Pending
13	Confirmation modal	❌ Pending
14	Form analytics (views, conversion)	❌ Pending
15	Pre-built form templates	❌ Pending)
🚀 PART 5: FORM BUILDER - COMPLETE IMPLEMENTATION
I'll implement all 15 form builder features to 100%.

📦 BATCH 1: FORM BUILDER CORE SYSTEM