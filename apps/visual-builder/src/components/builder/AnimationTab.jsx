import React, { useState } from 'react';
import { Sparkles, Play, RefreshCw } from 'lucide-react';

export const AnimationTab = ({ component, onUpdate }) => {
    const [previewAnimation, setPreviewAnimation] = useState(null);

    const entranceAnimations = [
        { id: 'none', name: 'None' },
        { id: 'fade', name: 'Fade In' },
        { id: 'fade-up', name: 'Fade Up' },
        { id: 'fade-down', name: 'Fade Down' },
        { id: 'fade-left', name: 'Fade Left' },
        { id: 'fade-right', name: 'Fade Right' },
        { id: 'zoom', name: 'Zoom In' },
        { id: 'zoom-out', name: 'Zoom Out' },
        { id: 'bounce', name: 'Bounce' },
        { id: 'slide-up', name: 'Slide Up' },
        { id: 'slide-down', name: 'Slide Down' },
        { id: 'slide-left', name: 'Slide Left' },
        { id: 'slide-right', name: 'Slide Right' },
        { id: 'rotate', name: 'Rotate' },
        { id: 'flip', name: 'Flip' }
    ];

    const hoverAnimations = [
        { id: 'none', name: 'None' },
        { id: 'scale', name: 'Scale' },
        { id: 'scale-up', name: 'Scale Up' },
        { id: 'scale-down', name: 'Scale Down' },
        { id: 'lift', name: 'Lift' },
        { id: 'glow', name: 'Glow' },
        { id: 'shadow', name: 'Shadow' },
        { id: 'rotate', name: 'Rotate' },
        { id: 'shake', name: 'Shake' },
        { id: 'bounce', name: 'Bounce' }
    ];

    const scrollAnimations = [
        { id: 'none', name: 'None' },
        { id: 'fade', name: 'Fade In' },
        { id: 'slide-up', name: 'Slide Up' },
        { id: 'slide-down', name: 'Slide Down' },
        { id: 'zoom', name: 'Zoom In' },
        { id: 'parallax', name: 'Parallax' }
    ];

    const easingOptions = [
        { id: 'linear', name: 'Linear' },
        { id: 'ease', name: 'Ease' },
        { id: 'ease-in', name: 'Ease In' },
        { id: 'ease-out', name: 'Ease Out' },
        { id: 'ease-in-out', name: 'Ease In Out' },
        { id: 'bounce', name: 'Bounce' }
    ];

    const handleAnimationChange = (type, value) => {
        onUpdate({
            animations: {
                ...component.animations,
                [type]: value
            }
        });
    };

    const handleDurationChange = (value) => {
        onUpdate({
            animations: {
                ...component.animations,
                duration: value
            }
        });
    };

    const handleDelayChange = (value) => {
        onUpdate({
            animations: {
                ...component.animations,
                delay: value
            }
        });
    };

    const handleEasingChange = (value) => {
        onUpdate({
            animations: {
                ...component.animations,
                easing: value
            }
        });
    };

    const preview = () => {
        const element = document.getElementById(`component-${component.id}`);
        if (element) {
            element.classList.add('animate-preview');
            setTimeout(() => element.classList.remove('animate-preview'), 1000);
        }
    };

    return (
        <div className="space-y-4">
            {/* Preview Button */}
            <button
                onClick={preview}
                className="w-full flex items-center justify-center gap-2 py-2 bg-surface-light rounded-lg text-text-primary hover:bg-surface-light/80 transition-colors"
            >
                <Play className="w-4 h-4" />
                Preview Animation
            </button>
            
            {/* Entrance Animation */}
            <div>
                <label className="block text-sm text-text-secondary mb-1">Entrance Animation</label>
                <select
                    value={component.animations?.entrance || 'none'}
                    onChange={(e) => handleAnimationChange('entrance', e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    {entranceAnimations.map(anim => (
                        <option key={anim.id} value={anim.id}>{anim.name}</option>
                    ))}
                </select>
            </div>
            
            {/* Hover Animation */}
            <div>
                <label className="block text-sm text-text-secondary mb-1">Hover Animation</label>
                <select
                    value={component.animations?.hover || 'none'}
                    onChange={(e) => handleAnimationChange('hover', e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    {hoverAnimations.map(anim => (
                        <option key={anim.id} value={anim.id}>{anim.name}</option>
                    ))}
                </select>
            </div>
            
            {/* Scroll Animation */}
            <div>
                <label className="block text-sm text-text-secondary mb-1">Scroll Animation</label>
                <select
                    value={component.animations?.scroll || 'none'}
                    onChange={(e) => handleAnimationChange('scroll', e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    {scrollAnimations.map(anim => (
                        <option key={anim.id} value={anim.id}>{anim.name}</option>
                    ))}
                </select>
                {component.animations?.scroll !== 'none' && (
                    <div className="mt-2">
                        <label className="block text-xs text-text-secondary mb-1">Scroll Offset (%)</label>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={component.animations?.scrollOffset || 50}
                            onChange={(e) => handleAnimationChange('scrollOffset', parseInt(e.target.value))}
                            className="w-full h-2 bg-surface-light rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                )}
            </div>
            
            {/* Duration */}
            <div>
                <label className="block text-sm text-text-secondary mb-1">Duration (ms)</label>
                <input
                    type="range"
                    min={100}
                    max={2000}
                    step={100}
                    value={component.animations?.duration || 300}
                    onChange={(e) => handleDurationChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-surface-light rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-text-secondary mt-1">
                    <span>100ms</span>
                    <span>{component.animations?.duration || 300}ms</span>
                    <span>2000ms</span>
                </div>
            </div>
            
            {/* Delay */}
            <div>
                <label className="block text-sm text-text-secondary mb-1">Delay (ms)</label>
                <input
                    type="range"
                    min={0}
                    max={1000}
                    step={50}
                    value={component.animations?.delay || 0}
                    onChange={(e) => handleDelayChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-surface-light rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-text-secondary mt-1">
                    <span>0ms</span>
                    <span>{component.animations?.delay || 0}ms</span>
                    <span>1000ms</span>
                </div>
            </div>
            
            {/* Easing */}
            <div>
                <label className="block text-sm text-text-secondary mb-1">Easing</label>
                <select
                    value={component.animations?.easing || 'ease'}
                    onChange={(e) => handleEasingChange(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    {easingOptions.map(easing => (
                        <option key={easing.id} value={easing.id}>{easing.name}</option>
                    ))}
                </select>
            </div>
            
            {/* Loop */}
            <div className="flex items-center justify-between">
                <label className="text-sm text-text-secondary">Loop Animation</label>
                <button
                    onClick={() => handleAnimationChange('loop', !component.animations?.loop)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        component.animations?.loop ? 'bg-primary-500' : 'bg-surface-light'
                    }`}
                >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${
                        component.animations?.loop ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`} />
                </button>
            </div>
            
            <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-3">
                <p className="text-xs text-text-secondary">
                    💡 Animation Tip: Entrance animations trigger when the component first appears.
                    Hover animations trigger on mouse over. Scroll animations trigger when scrolling into view.
                </p>
            </div>
        </div>
    );
};
