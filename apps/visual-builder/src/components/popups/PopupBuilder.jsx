import React, { useState, useEffect, useRef } from 'react';
import { X, Move, Maximize2, Minimize2, Clock, MousePointer, Scroll, LogOut, Calendar, BarChart3, GitBranch, Mail, Save, Eye, Trash2, Copy } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import { Toast } from '../shared/Toast';

// Popup Types
const POPUP_TYPES = [
    { id: 'modal', name: 'Modal', icon: '📦', description: 'Center popup with overlay' },
    { id: 'slide-in', name: 'Slide In', icon: '📥', description: 'Slides from edge' },
    { id: 'floating-bar', name: 'Floating Bar', icon: '📏', description: 'Fixed bar on screen' },
    { id: 'fullscreen', name: 'Fullscreen', icon: '🖥️', description: 'Full screen takeover' },
];

// Animation Presets
const ANIMATIONS = {
    entrance: [
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
        { id: 'flip', name: 'Flip' },
    ],
    exit: [
        { id: 'fade', name: 'Fade Out' },
        { id: 'fade-up', name: 'Fade Up Out' },
        { id: 'fade-down', name: 'Fade Down Out' },
        { id: 'zoom', name: 'Zoom Out' },
        { id: 'bounce', name: 'Bounce Out' },
        { id: 'slide-up', name: 'Slide Up Out' },
        { id: 'slide-down', name: 'Slide Down Out' },
    ],
};

// Trigger Types
const TRIGGERS = [
    { id: 'time', name: 'Time Delay', icon: Clock, config: { delaySeconds: 5 } },
    { id: 'scroll', name: 'Scroll Percentage', icon: Scroll, config: { scrollPercent: 50 } },
    { id: 'exit', name: 'Exit Intent', icon: LogOut, config: {} },
    { id: 'click', name: 'On Click', icon: MousePointer, config: { selector: '' } },
];

// Pre-built Popup Templates
const POPUP_TEMPLATES = [
    { id: 'newsletter', name: 'Newsletter Signup', description: 'Email newsletter subscription', type: 'modal', content: { title: 'Subscribe to Newsletter', description: 'Get latest updates and offers', buttonText: 'Subscribe' } },
    { id: 'discount', name: 'Discount Offer', description: 'Promotional discount code', type: 'modal', content: { title: 'Special Offer!', description: 'Get 20% off your first purchase', buttonText: 'Claim Discount', discountCode: 'WELCOME20' } },
    { id: 'waitlist', name: 'Waitlist', description: 'Product launch waitlist', type: 'slide-in', content: { title: 'Join Waitlist', description: 'Be first to know when we launch', buttonText: 'Notify Me' } },
    { id: 'feedback', name: 'Feedback', description: 'User feedback survey', type: 'floating-bar', content: { title: 'How are we doing?', buttonText: 'Give Feedback' } },
    { id: 'cookie', name: 'Cookie Consent', description: 'GDPR cookie consent', type: 'floating-bar', content: { title: 'We use cookies', description: 'This site uses cookies for better experience', buttonText: 'Accept', declineText: 'Decline' } },
    { id: 'exit-intent', name: 'Exit Intent', description: 'Exit-intent popup', type: 'modal', content: { title: 'Wait! Before you go...', description: 'Get exclusive offers', buttonText: 'Stay Updated' } },
];

// Popup Preview Component
const PopupPreview = ({ popup, onClose, onAction }) => {
    const [isVisible, setIsVisible] = useState(true);
    const animationClass = popup.animation?.entrance ? `animate-${popup.animation.entrance}` : '';

    const getPositionStyle = () => {
        switch (popup.position) {
            case 'top-left': return { top: '20px', left: '20px', transform: 'none' };
            case 'top-right': return { top: '20px', right: '20px', transform: 'none' };
            case 'bottom-left': return { bottom: '20px', left: '20px', transform: 'none' };
            case 'bottom-right': return { bottom: '20px', right: '20px', transform: 'none' };
            case 'top-center': return { top: '20px', left: '50%', transform: 'translateX(-50%)' };
            case 'bottom-center': return { bottom: '20px', left: '50%', transform: 'translateX(-50%)' };
            default: return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
        }
    };

    const getSizeStyle = () => {
        if (popup.type === 'fullscreen') return { width: '100%', height: '100%' };
        if (popup.type === 'floating-bar') return { width: '100%', maxWidth: '600px' };
        return { width: popup.size?.width || 500, maxWidth: '90vw' };
    };

    if (!isVisible) return null;

    return (
        <div className={cn(
            'fixed z-50 bg-surface rounded-xl shadow-2xl',
            popup.type === 'modal' && 'shadow-2xl',
            popup.type === 'fullscreen' && 'rounded-none',
            animationClass
        )} style={{ ...getPositionStyle(), ...getSizeStyle() }}>
            {/* Close Button */}
            {popup.closeOptions?.showButton !== false && (
                <button
                    onClick={() => { setIsVisible(false); onClose?.(); }}
                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-surface-light transition-colors z-10"
                >
                    <X className="w-5 h-5 text-text-secondary" />
                </button>
            )}
            
            {/* Content */}
            <div className="p-6">
                {popup.content?.image && (
                    <img src={popup.content.image} alt="" className="w-full h-32 object-cover rounded-lg mb-4" />
                )}
                <h3 className="text-xl font-bold text-text-primary">{popup.content?.title}</h3>
                <p className="text-text-secondary mt-2">{popup.content?.description}</p>
                
                {popup.content?.discountCode && (
                    <div className="mt-4 p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg text-center">
                        <p className="text-sm text-text-secondary">Use code:</p>
                        <p className="text-xl font-bold text-primary-500">{popup.content.discountCode}</p>
                    </div>
                )}
                
                {popup.content?.inputPlaceholder && (
                    <input
                        type="email"
                        placeholder={popup.content.inputPlaceholder}
                        className="w-full mt-4 px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                    />
                )}
                
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={() => { setIsVisible(false); onAction?.('primary'); }}
                        className="flex-1 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        {popup.content?.buttonText || 'Submit'}
                    </button>
                    {popup.content?.declineText && (
                        <button
                            onClick={() => { setIsVisible(false); onAction?.('secondary'); }}
                            className="flex-1 py-2 border border-border rounded-lg text-text-secondary hover:bg-surface-light transition-colors"
                        >
                            {popup.content.declineText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Trigger Settings Component
const TriggerSettings = ({ triggers, onUpdate }) => {
    const handleToggle = (triggerId) => {
        const current = triggers?.[triggerId] || { enabled: false };
        onUpdate(triggerId, { ...current, enabled: !current.enabled });
    };

    const handleConfigChange = (triggerId, key, value) => {
        const current = triggers?.[triggerId] || { enabled: true };
        onUpdate(triggerId, { ...current, [key]: value });
    };

    const getTriggerIcon = (triggerId) => {
        const trigger = TRIGGERS.find(t => t.id === triggerId);
        const Icon = trigger?.icon;
        return Icon ? <Icon className="w-4 h-4" /> : null;
    };

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-text-primary">Triggers</h3>
            <div className="space-y-3">
                {TRIGGERS.map((trigger) => (
                    <div key={trigger.id} className="bg-surface border border-border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                {getTriggerIcon(trigger.id)}
                                <span className="text-sm text-text-primary">{trigger.name}</span>
                            </div>
                            <button
                                onClick={() => handleToggle(trigger.id)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${triggers?.[trigger.id]?.enabled ? 'bg-primary-500' : 'bg-surface-light'}`}
                            >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${triggers?.[trigger.id]?.enabled ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                        {triggers?.[trigger.id]?.enabled && trigger.config && (
                            <div className="mt-2 pt-2 border-t border-border">
                                {trigger.id === 'time' && (
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-text-secondary">Delay (seconds):</label>
                                        <input
                                            type="number"
                                            value={triggers[trigger.id]?.delaySeconds || trigger.config.delaySeconds}
                                            onChange={(e) => handleConfigChange(trigger.id, 'delaySeconds', parseInt(e.target.value))}
                                            className="w-20 px-2 py-1 bg-surface border border-border rounded text-sm"
                                        />
                                    </div>
                                )}
                                {trigger.id === 'scroll' && (
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-text-secondary">Scroll %:</label>
                                        <input
                                            type="range"
                                            min={0}
                                            max={100}
                                            value={triggers[trigger.id]?.scrollPercent || trigger.config.scrollPercent}
                                            onChange={(e) => handleConfigChange(trigger.id, 'scrollPercent', parseInt(e.target.value))}
                                            className="flex-1"
                                        />
                                        <span className="text-xs text-text-secondary w-8">
                                            {triggers[trigger.id]?.scrollPercent || trigger.config.scrollPercent}%
                                        </span>
                                    </div>
                                )}
                                {trigger.id === 'click' && (
                                    <div>
                                        <label className="block text-xs text-text-secondary mb-1">CSS Selector:</label>
                                        <input
                                            type="text"
                                            value={triggers[trigger.id]?.selector || ''}
                                            onChange={(e) => handleConfigChange(trigger.id, 'selector', e.target.value)}
                                            placeholder=".button, #element"
                                            className="w-full px-2 py-1 bg-surface border border-border rounded text-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Display Rules Component
const DisplayRules = ({ rules, onUpdate }) => {
    const handlePageRule = (value) => {
        onUpdate('pages', value);
    };

    const handleDeviceRule = (device, enabled) => {
        const current = rules?.devices || { desktop: true, tablet: true, mobile: true };
        onUpdate('devices', { ...current, [device]: enabled });
    };

    const handleUserRule = (userType, enabled) => {
        const current = rules?.users || { all: true, loggedIn: false, loggedOut: false };
        onUpdate('users', { ...current, [userType]: enabled });
    };

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-text-primary">Display Rules</h3>
            
            <div>
                <label className="block text-sm text-text-secondary mb-2">Show on Pages</label>
                <select
                    value={rules?.pages || 'all'}
                    onChange={(e) => handlePageRule(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                >
                    <option value="all">All Pages</option>
                    <option value="home">Home Only</option>
                    <option value="specific">Specific Pages</option>
                </select>
            </div>

            <div>
                <label className="block text-sm text-text-secondary mb-2">Devices</label>
                <div className="flex gap-3">
                    {['desktop', 'tablet', 'mobile'].map((device) => (
                        <label key={device} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rules?.devices?.[device] !== false}
                                onChange={(e) => handleDeviceRule(device, e.target.checked)}
                                className="w-4 h-4 rounded border-border text-primary-500"
                            />
                            <span className="text-sm text-text-primary capitalize">{device}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm text-text-secondary mb-2">User Status</label>
                <div className="space-y-2">
                    {[
                        { id: 'all', label: 'All Users' },
                        { id: 'loggedIn', label: 'Logged In Users' },
                        { id: 'loggedOut', label: 'Logged Out Users' },
                    ].map((userType) => (
                        <label key={userType.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rules?.users?.[userType.id] === true}
                                onChange={(e) => handleUserRule(userType.id, e.target.checked)}
                                className="w-4 h-4 rounded border-border text-primary-500"
                            />
                            <span className="text-sm text-text-primary">{userType.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Animation Selector Component
const AnimationSelector = ({ animation, onUpdate }) => {
    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-text-primary">Animations</h3>
            
            <div>
                <label className="block text-sm text-text-secondary mb-2">Entrance Animation</label>
                <select
                    value={animation?.entrance || 'fade'}
                    onChange={(e) => onUpdate('entrance', e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                >
                    {ANIMATIONS.entrance.map((anim) => (
                        <option key={anim.id} value={anim.id}>{anim.name}</option>
                    ))}
                </select>
            </div>
            
            <div>
                <label className="block text-sm text-text-secondary mb-2">Exit Animation</label>
                <select
                    value={animation?.exit || 'fade'}
                    onChange={(e) => onUpdate('exit', e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                >
                    {ANIMATIONS.exit.map((anim) => (
                        <option key={anim.id} value={anim.id}>{anim.name}</option>
                    ))}
                </select>
            </div>
            
            <div>
                <label className="block text-sm text-text-secondary mb-2">Duration (ms)</label>
                <input
                    type="range"
                    min={100}
                    max={2000}
                    step={100}
                    value={animation?.duration || 300}
                    onChange={(e) => onUpdate('duration', parseInt(e.target.value))}
                    className="w-full"
                />
                <div className="flex justify-between text-xs text-text-secondary">
                    <span>100ms</span>
                    <span>{animation?.duration || 300}ms</span>
                    <span>2000ms</span>
                </div>
            </div>
        </div>
    );
};

// Size Controls Component
const SizeControls = ({ size, onUpdate }) => {
    const presets = [
        { name: 'Small', width: 400, height: 300 },
        { name: 'Medium', width: 500, height: 400 },
        { name: 'Large', width: 600, height: 500 },
        { name: 'Custom', width: size?.width || 500, height: size?.height || 400 },
    ];

    const handlePresetSelect = (preset) => {
        if (preset.name !== 'Custom') {
            onUpdate('width', preset.width);
            onUpdate('height', preset.height);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-text-primary">Size</h3>
            
            <div className="flex gap-2">
                {presets.map((preset) => (
                    <button
                        key={preset.name}
                        onClick={() => handlePresetSelect(preset)}
                        className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary hover:border-primary-500 transition-colors"
                    >
                        {preset.name}
                    </button>
                ))}
            </div>
            
            <div className="flex gap-3">
                <div className="flex-1">
                    <label className="block text-xs text-text-secondary mb-1">Width (px)</label>
                    <input
                        type="number"
                        value={size?.width || 500}
                        onChange={(e) => onUpdate('width', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs text-text-secondary mb-1">Height (px)</label>
                    <input
                        type="number"
                        value={size?.height || 400}
                        onChange={(e) => onUpdate('height', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                    />
                </div>
            </div>
            
            <div>
                <label className="block text-xs text-text-secondary mb-1">Max Width (%)</label>
                <input
                    type="number"
                    value={size?.maxWidth || 90}
                    onChange={(e) => onUpdate('maxWidth', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                />
            </div>
        </div>
    );
};

// Position Controls Component
const PositionControls = ({ position, onUpdate }) => {
    const positions = [
        { id: 'center', name: 'Center', icon: '⬤' },
        { id: 'top-left', name: 'Top Left', icon: '◤' },
        { id: 'top-center', name: 'Top Center', icon: '▲' },
        { id: 'top-right', name: 'Top Right', icon: '◥' },
        { id: 'bottom-left', name: 'Bottom Left', icon: '◣' },
        { id: 'bottom-center', name: 'Bottom Center', icon: '▼' },
        { id: 'bottom-right', name: 'Bottom Right', icon: '◢' },
    ];

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-text-primary">Position</h3>
            
            <div className="grid grid-cols-3 gap-2">
                {positions.map((pos) => (
                    <button
                        key={pos.id}
                        onClick={() => onUpdate('position', pos.id)}
                        className={`p-3 rounded-lg border transition-all ${
                            position === pos.id
                                ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                                : 'border-border text-text-secondary hover:border-primary-500'
                        }`}
                    >
                        <div className="text-xl">{pos.icon}</div>
                        <p className="text-xs mt-1">{pos.name}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

// Close Options Component
const CloseOptions = ({ closeOptions, onUpdate }) => {
    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-text-primary">Close Options</h3>
            
            <div className="flex items-center justify-between">
                <div>
                    <label className="block text-sm text-text-secondary">Show Close Button</label>
                    <p className="text-xs text-text-secondary">Display X button on popup</p>
                </div>
                <button
                    onClick={() => onUpdate('showButton', !closeOptions?.showButton)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${closeOptions?.showButton !== false ? 'bg-primary-500' : 'bg-surface-light'}`}
                >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${closeOptions?.showButton !== false ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                </button>
            </div>
            
            <div className="flex items-center justify-between">
                <div>
                    <label className="block text-sm text-text-secondary">Close on Overlay Click</label>
                    <p className="text-xs text-text-secondary">Click outside to close</p>
                </div>
                <button
                    onClick={() => onUpdate('overlayClick', !closeOptions?.overlayClick)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${closeOptions?.overlayClick !== false ? 'bg-primary-500' : 'bg-surface-light'}`}
                >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${closeOptions?.overlayClick !== false ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                </button>
            </div>
            
            <div className="flex items-center justify-between">
                <div>
                    <label className="block text-sm text-text-secondary">Close on ESC Key</label>
                    <p className="text-xs text-text-secondary">Press ESC to close</p>
                </div>
                <button
                    onClick={() => onUpdate('escKey', !closeOptions?.escKey)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${closeOptions?.escKey !== false ? 'bg-primary-500' : 'bg-surface-light'}`}
                >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${closeOptions?.escKey !== false ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                </button>
            </div>
        </div>
    );
};

// Scheduling Component
const Scheduling = ({ schedule, onUpdate }) => {
    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-text-primary">Schedule</h3>
            
            <div className="flex items-center justify-between">
                <div>
                    <label className="block text-sm text-text-secondary">Enable Scheduling</label>
                    <p className="text-xs text-text-secondary">Show popup only during specified period</p>
                </div>
                <button
                    onClick={() => onUpdate('enabled', !schedule?.enabled)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${schedule?.enabled ? 'bg-primary-500' : 'bg-surface-light'}`}
                >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${schedule?.enabled ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                </button>
            </div>
            
            {schedule?.enabled && (
                <>
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Start Date</label>
                        <input
                            type="datetime-local"
                            value={schedule?.startDate || ''}
                            onChange={(e) => onUpdate('startDate', e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">End Date</label>
                        <input
                            type="datetime-local"
                            value={schedule?.endDate || ''}
                            onChange={(e) => onUpdate('endDate', e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                        />
                    </div>
                </>
            )}
        </div>
    );
};

// Analytics Component
const Analytics = ({ stats, onTimeframeChange }) => {
    const [timeframe, setTimeframe] = useState('7d');
    
    const handleTimeframeChange = (value) => {
        setTimeframe(value);
        onTimeframeChange?.(value);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-text-primary">Analytics</h3>
                <select
                    value={timeframe}
                    onChange={(e) => handleTimeframeChange(e.target.value)}
                    className="px-2 py-1 bg-surface border border-border rounded-lg text-sm"
                >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface border border-border rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-primary-500">{stats?.views || 0}</p>
                    <p className="text-sm text-text-secondary">Views</p>
                </div>
                <div className="bg-surface border border-border rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-success-500">{stats?.conversions || 0}</p>
                    <p className="text-sm text-text-secondary">Conversions</p>
                </div>
            </div>
            
            <div className="bg-surface border border-border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                    <p className="text-sm text-text-primary">Conversion Rate</p>
                    <p className="text-sm font-bold text-primary-500">{stats?.conversionRate || 0}%</p>
                </div>
                <div className="h-2 bg-surface-light rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(stats?.conversionRate || 0, 100)}%` }} />
                </div>
            </div>
            
            {/* Simple chart */}
            <div className="bg-surface border border-border rounded-lg p-4">
                <h4 className="text-sm font-medium text-text-primary mb-3">Performance Over Time</h4>
                <div className="space-y-2">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="text-xs text-text-secondary w-16">Day {i + 1}</span>
                            <div className="flex-1 h-6 bg-surface-light rounded overflow-hidden">
                                <div className="h-full bg-primary-500" style={{ width: `${Math.random() * 100}%` }} />
                            </div>
                            <span className="text-xs text-text-secondary w-8">{Math.floor(Math.random() * 50)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// A/B Testing Component
const ABTesting = ({ variants, onUpdate, onSelectWinner }) => {
    const [newVariant, setNewVariant] = useState({ name: '', content: {} });

    const addVariant = () => {
        if (newVariant.name) {
            onUpdate([...(variants || []), { ...newVariant, id: Date.now().toString(), views: 0, conversions: 0 }]);
            setNewVariant({ name: '', content: {} });
        }
    };

    const removeVariant = (id) => {
        onUpdate(variants.filter(v => v.id !== id));
    };

    const selectWinner = (id) => {
        const winner = variants.find(v => v.id === id);
        onSelectWinner?.(winner);
    };

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-text-primary">A/B Testing</h3>
            <p className="text-xs text-text-secondary">Test different popup variations</p>
            
            <div className="space-y-3">
                {(variants || []).map((variant) => (
                    <div key={variant.id} className="bg-surface border border-border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-text-primary">{variant.name}</span>
                            <div className="flex gap-2">
                                <button onClick={() => selectWinner(variant.id)} className="text-xs text-primary-500 hover:underline">
                                    Set as Winner
                                </button>
                                <button onClick={() => removeVariant(variant.id)} className="text-danger-500">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-4 text-xs text-text-secondary">
                            <span>Views: {variant.views || 0}</span>
                            <span>Conversions: {variant.conversions || 0}</span>
                            <span>Rate: {variant.views > 0 ? ((variant.conversions / variant.views) * 100).toFixed(1) : 0}%</span>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newVariant.name}
                    onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                    placeholder="Variant Name"
                    className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm"
                />
                <button onClick={addVariant} className="px-3 py-2 bg-primary-500 text-white rounded-lg text-sm">
                    Add Variant
                </button>
            </div>
        </div>
    );
};

// Integration Component
const Integrations = ({ integrations, onUpdate }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [newIntegration, setNewIntegration] = useState({ type: 'mailchimp', apiKey: '', listId: '' });

    const integrationsList = [
        { id: 'mailchimp', name: 'Mailchimp', icon: Mail, description: 'Add subscribers to Mailchimp list' },
        { id: 'convertkit', name: 'ConvertKit', icon: Mail, description: 'Add subscribers to ConvertKit' },
        { id: 'webhook', name: 'Webhook', icon: '🔗', description: 'Send data to custom URL' },
    ];

    const addIntegration = () => {
        if (newIntegration.apiKey) {
            onUpdate([...(integrations || []), { ...newIntegration, id: Date.now().toString() }]);
            setNewIntegration({ type: 'mailchimp', apiKey: '', listId: '' });
            setShowAddModal(false);
        }
    };

    const removeIntegration = (id) => {
        onUpdate(integrations.filter(i => i.id !== id));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-text-primary">Integrations</h3>
                <button onClick={() => setShowAddModal(true)} className="text-sm text-primary-500 hover:underline">
                    + Add Integration
                </button>
            </div>
            
            <div className="space-y-2">
                {(integrations || []).map((integration) => (
                    <div key={integration.id} className="flex items-center justify-between p-3 bg-surface border border-border rounded-lg">
                        <div>
                            <p className="font-medium text-text-primary">{integration.type}</p>
                            <p className="text-xs text-text-secondary">API Key: ••••••••</p>
                        </div>
                        <button onClick={() => removeIntegration(integration.id)} className="text-danger-500">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            
            {/* Add Integration Modal */}
            {showAddModal && (
                <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Integration" size="md">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-text-secondary mb-1">Service</label>
                            <select
                                value={newIntegration.type}
                                onChange={(e) => setNewIntegration({ ...newIntegration, type: e.target.value })}
                                className="w-full px-3 py-2 bg-surface border border-border rounded-lg"
                            >
                                <option value="mailchimp">Mailchimp</option>
                                <option value="convertkit">ConvertKit</option>
                                <option value="webhook">Webhook</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-text-secondary mb-1">API Key</label>
                            <input
                                type="password"
                                value={newIntegration.apiKey}
                                onChange={(e) => setNewIntegration({ ...newIntegration, apiKey: e.target.value })}
                                className="w-full px-3 py-2 bg-surface border border-border rounded-lg"
                            />
                        </div>
                        {(newIntegration.type === 'mailchimp' || newIntegration.type === 'convertkit') && (
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">List ID</label>
                                <input
                                    type="text"
                                    value={newIntegration.listId}
                                    onChange={(e) => setNewIntegration({ ...newIntegration, listId: e.target.value })}
                                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg"
                                />
                            </div>
                        )}
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setShowAddModal(false)} fullWidth>Cancel</Button>
                            <Button variant="primary" onClick={addIntegration} fullWidth>Add Integration</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// Template Selector Component
const TemplateSelector = ({ onSelect }) => {
    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-text-primary">Popup Templates</h3>
            <div className="grid grid-cols-2 gap-3">
                {POPUP_TEMPLATES.map((template) => (
                    <div
                        key={template.id}
                        onClick={() => onSelect(template)}
                        className="bg-surface border border-border rounded-lg p-3 cursor-pointer hover:border-primary-500 transition-colors"
                    >
                        <p className="font-medium text-text-primary">{template.name}</p>
                        <p className="text-xs text-text-secondary mt-1">{template.description}</p>
                        <p className="text-xs text-text-secondary mt-1">Type: {template.type}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Main Popup Builder Component
export const PopupBuilder = () => {
    const [popup, setPopup] = useState({
        id: 'default',
        name: 'New Popup',
        type: 'modal',
        size: { width: 500, height: 400, maxWidth: 90 },
        position: 'center',
        triggers: {
            time: { enabled: true, delaySeconds: 5 },
            scroll: { enabled: false, scrollPercent: 50 },
            exit: { enabled: false },
            click: { enabled: false },
        },
        rules: {
            pages: 'all',
            devices: { desktop: true, tablet: true, mobile: true },
            users: { all: true, loggedIn: false, loggedOut: false },
        },
        animation: { entrance: 'fade', exit: 'fade', duration: 300 },
        closeOptions: { showButton: true, overlayClick: true, escKey: true },
        schedule: { enabled: false },
        content: {
            title: 'Welcome!',
            description: 'This is your popup content. Customize it as needed.',
            buttonText: 'Get Started',
        },
        integrations: [],
        variants: [],
    });
    
    const [activeTab, setActiveTab] = useState('design');
    const [showPreview, setShowPreview] = useState(false);
    const [toast, setToast] = useState(null);
    const [stats, setStats] = useState({ views: 1247, conversions: 342, conversionRate: 27.4 });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const updatePopup = (key, value) => {
        setPopup({ ...popup, [key]: value });
        showToast('Popup updated', 'success');
    };

    const applyTemplate = (template) => {
        setPopup({
            ...popup,
            type: template.type,
            content: template.content,
            name: template.name,
        });
        showToast(`Applied ${template.name} template`, 'success');
    };

    const savePopup = () => {
        localStorage.setItem(`sukit-popup-${popup.id}`, JSON.stringify(popup));
        showToast('Popup saved successfully', 'success');
    };

    const tabs = [
        { id: 'design', label: 'Design' },
        { id: 'triggers', label: 'Triggers' },
        { id: 'display', label: 'Display Rules' },
        { id: 'animation', label: 'Animation' },
        { id: 'close', label: 'Close Options' },
        { id: 'schedule', label: 'Schedule' },
        { id: 'analytics', label: 'Analytics' },
        { id: 'ab-test', label: 'A/B Test' },
        { id: 'integrations', label: 'Integrations' },
        { id: 'templates', label: 'Templates' },
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-surface border-b border-border px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={popup.name}
                        onChange={(e) => updatePopup('name', e.target.value)}
                        className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-border focus:border-primary-500 focus:outline-none px-2 py-1"
                    />
                    <Button variant="outline" size="sm" onClick={savePopup} leftIcon={<Save className="w-4 h-4" />}>
                        Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowPreview(true)} leftIcon={<Eye className="w-4 h-4" />}>
                        Preview
                    </Button>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-surface-light">
                        <Copy className="w-4 h-4 text-text-secondary" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-danger-500/10">
                        <Trash2 className="w-4 h-4 text-danger-500" />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border px-4 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'text-primary-500 border-b-2 border-primary-500'
                                : 'text-text-secondary hover:text-text-primary'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - Settings */}
                <div className="w-96 border-r border-border overflow-y-auto p-4">
                    {activeTab === 'design' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-text-primary mb-3">Popup Type</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {POPUP_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => updatePopup('type', type.id)}
                                            className={`p-3 border rounded-lg text-left transition-all ${
                                                popup.type === type.id
                                                    ? 'border-primary-500 bg-primary-500/10'
                                                    : 'border-border hover:border-primary-500'
                                            }`}
                                        >
                                            <div className="text-2xl mb-1">{type.icon}</div>
                                            <p className="font-medium text-text-primary">{type.name}</p>
                                            <p className="text-xs text-text-secondary">{type.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <SizeControls
                                size={popup.size}
                                onUpdate={(key, value) => updatePopup('size', { ...popup.size, [key]: value })}
                            />
                            
                            <PositionControls
                                position={popup.position}
                                onUpdate={(key, value) => updatePopup('position', value)}
                            />
                        </div>
                    )}
                    
                    {activeTab === 'triggers' && (
                        <TriggerSettings triggers={popup.triggers} onUpdate={(id, config) => updatePopup('triggers', { ...popup.triggers, [id]: config })} />
                    )}
                    
                    {activeTab === 'display' && (
                        <DisplayRules rules={popup.rules} onUpdate={(key, value) => updatePopup('rules', { ...popup.rules, [key]: value })} />
                    )}
                    
                    {activeTab === 'animation' && (
                        <AnimationSelector animation={popup.animation} onUpdate={(key, value) => updatePopup('animation', { ...popup.animation, [key]: value })} />
                    )}
                    
                    {activeTab === 'close' && (
                        <CloseOptions closeOptions={popup.closeOptions} onUpdate={(key, value) => updatePopup('closeOptions', { ...popup.closeOptions, [key]: value })} />
                    )}
                    
                    {activeTab === 'schedule' && (
                        <Scheduling schedule={popup.schedule} onUpdate={(key, value) => updatePopup('schedule', { ...popup.schedule, [key]: value })} />
                    )}
                    
                    {activeTab === 'analytics' && (
                        <Analytics stats={stats} onTimeframeChange={(tf) => console.log('Timeframe changed:', tf)} />
                    )}
                    
                    {activeTab === 'ab-test' && (
                        <ABTesting
                            variants={popup.variants}
                            onUpdate={(variants) => updatePopup('variants', variants)}
                            onSelectWinner={(winner) => {
                                updatePopup('content', winner.content);
                                showToast(`Winner applied: ${winner.name}`, 'success');
                            }}
                        />
                    )}
                    
                    {activeTab === 'integrations' && (
                        <Integrations integrations={popup.integrations} onUpdate={(integrations) => updatePopup('integrations', integrations)} />
                    )}
                    
                    {activeTab === 'templates' && (
                        <TemplateSelector onSelect={applyTemplate} />
                    )}
                </div>
                
                {/* Right Panel - Content Editor */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-md mx-auto">
                        <h3 className="font-semibold text-text-primary mb-4">Content</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Title</label>
                                <input
                                    type="text"
                                    value={popup.content.title}
                                    onChange={(e) => updatePopup('content', { ...popup.content, title: e.target.value })}
                                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Description</label>
                                <textarea
                                    value={popup.content.description}
                                    onChange={(e) => updatePopup('content', { ...popup.content, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Button Text</label>
                                <input
                                    type="text"
                                    value={popup.content.buttonText}
                                    onChange={(e) => updatePopup('content', { ...popup.content, buttonText: e.target.value })}
                                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Image URL (optional)</label>
                                <input
                                    type="text"
                                    value={popup.content.image || ''}
                                    onChange={(e) => updatePopup('content', { ...popup.content, image: e.target.value })}
                                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Input Placeholder (optional)</label>
                                <input
                                    type="text"
                                    value={popup.content.inputPlaceholder || ''}
                                    onChange={(e) => updatePopup('content', { ...popup.content, inputPlaceholder: e.target.value })}
                                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg"
                                />
                            </div>
                            
                            {popup.type === 'modal' && (
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Discount Code (optional)</label>
                                    <input
                                        type="text"
                                        value={popup.content.discountCode || ''}
                                        onChange={(e) => updatePopup('content', { ...popup.content, discountCode: e.target.value })}
                                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                    <PopupPreview
                        popup={popup}
                        onClose={() => setShowPreview(false)}
                        onAction={(action) => {
                            setStats({
                                ...stats,
                                views: stats.views + 1,
                                conversions: stats.conversions + (action === 'primary' ? 1 : 0),
                                conversionRate: parseFloat(((stats.conversions + (action === 'primary' ? 1 : 0)) / (stats.views + 1) * 100).toFixed(1)),
                            });
                            setShowPreview(false);
                            showToast('Conversion tracked!', 'success');
                        }}
                    />
                </div>
            )}
            
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default PopupBuilder;