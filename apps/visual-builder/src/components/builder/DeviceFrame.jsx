import React from 'react';
import { Smartphone, Tablet, Monitor } from 'lucide-react';

export const DeviceFrame = ({ device, children }) => {
    const frames = {
        desktop: {
            className: "w-full",
            frame: null
        },
        tablet: {
            className: "w-[768px] mx-auto",
            frame: (
                <div className="relative bg-black rounded-3xl p-4 shadow-2xl">
                    <div className="absolute top-1/2 left-4 -translate-y-1/2 w-2 h-2 bg-gray-600 rounded-full" />
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 w-2 h-2 bg-gray-600 rounded-full" />
                    {children}
                </div>
            )
        },
        mobile: {
            className: "w-[375px] mx-auto",
            frame: (
                <div className="relative bg-black rounded-3xl p-3 shadow-2xl">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-black rounded-b-2xl" />
                    <div className="absolute top-1/2 left-2 -translate-y-1/2 w-1 h-8 bg-gray-600 rounded-full" />
                    <div className="absolute top-1/2 right-2 -translate-y-1/2 w-1 h-8 bg-gray-600 rounded-full" />
                    {children}
                </div>
            )
        }
    };

    const current = frames[device] || frames.desktop;

    if (device === 'desktop') {
        return <div className={current.className}>{children}</div>;
    }

    return current.frame;
};
