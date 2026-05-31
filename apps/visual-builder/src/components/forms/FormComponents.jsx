import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Eye, EyeOff, Check, AlertCircle, Upload, Calendar } from 'lucide-react';

export const Form = ({ children, onSubmit, method = 'POST', action, encType, className, ...props }) => {
    const handleSubmit = async (e) => { e.preventDefault(); await onSubmit?.(e); };
    return <form onSubmit={handleSubmit} method={method} action={action} encType={encType} className={cn('space-y-4', className)} {...props}>{children}</form>;
};

export const Input = ({ type = 'text', label, name, value, onChange, onBlur, placeholder, required = false, disabled = false, error, helper, icon: Icon, className, ...props }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    return (
        <div className={cn('mb-4', className)}>
            {label && <label className="block text-sm font-medium mb-1 text-text-primary">{label}{required && <span className="text-danger-500 ml-1">*</span>}</label>}
            <div className="relative">
                {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2"><Icon size={18} className="text-text-secondary" /></div>}
                <input type={inputType} name={name} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} disabled={disabled} required={required}
                    className={cn('w-full px-3 py-2 border rounded-lg transition-colors bg-surface text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500', error ? 'border-red-500' : 'border-border', Icon && 'pl-10', isPassword && 'pr-10')} {...props} />
                {isPassword && <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-gray-600">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
            </div>
            {error && <p className="mt-1 text-sm text-danger-500 flex items-center gap-1"><AlertCircle size={14} /> {error}</p>}
            {helper && !error && <p className="mt-1 text-sm text-text-secondary">{helper}</p>}
        </div>
    );
};

export const Textarea = ({ label, name, value, onChange, rows = 4, placeholder, required = false, disabled = false, error, helper, className, ...props }) => (
    <div className={cn('mb-4', className)}>
        {label && <label className="block text-sm font-medium mb-1 text-text-primary">{label}{required && <span className="text-danger-500 ml-1">*</span>}</label>}
        <textarea name={name} value={value} onChange={onChange} rows={rows} placeholder={placeholder} disabled={disabled} required={required}
            className={cn('w-full px-3 py-2 border rounded-lg transition-colors resize-y bg-surface text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500', error ? 'border-red-500' : 'border-border')} {...props} />
        {error && <p className="mt-1 text-sm text-danger-500 flex items-center gap-1"><AlertCircle size={14} /> {error}</p>}
    </div>
);

export const Select = ({ label, name, value, onChange, options = [], placeholder = 'Select an option', required = false, disabled = false, error, helper, className, ...props }) => (
    <div className={cn('mb-4', className)}>
        {label && <label className="block text-sm font-medium mb-1 text-text-primary">{label}{required && <span className="text-danger-500 ml-1">*</span>}</label>}
        <select name={name} value={value} onChange={onChange} disabled={disabled} required={required}
            className={cn('w-full px-3 py-2 border rounded-lg transition-colors bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500', error ? 'border-red-500' : 'border-border')} {...props}>
            <option value="">{placeholder}</option>
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {error && <p className="mt-1 text-sm text-danger-500">{error}</p>}
    </div>
);

export const Checkbox = ({ label, name, checked, onChange, required = false, disabled = false, error, className, ...props }) => (
    <div className={cn('mb-3', className)}>
        <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name={name} checked={checked} onChange={onChange} disabled={disabled} required={required}
                className={cn('w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500', error && 'border-red-500')} {...props} />
            <span className="text-sm text-text-primary">{label}{required && <span className="text-danger-500 ml-1">*</span>}</span>
        </label>
        {error && <p className="mt-1 text-sm text-danger-500">{error}</p>}
    </div>
);

export const RadioGroup = ({ label, name, value, onChange, options = [], required = false, disabled = false, error, className, ...props }) => (
    <div className={cn('mb-4', className)}>
        {label && <label className="block text-sm font-medium mb-2 text-text-primary">{label}{required && <span className="text-danger-500 ml-1">*</span>}</label>}
        <div className="space-y-2">
            {options.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name={name} value={opt.value} checked={value === opt.value} onChange={onChange} disabled={disabled} className="w-4 h-4 text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm text-text-primary">{opt.label}</span>
                </label>
            ))}
        </div>
        {error && <p className="mt-1 text-sm text-danger-500">{error}</p>}
    </div>
);

export const Switch = ({ label, checked, onChange, disabled = false, className, ...props }) => (
    <label className={cn('flex items-center justify-between cursor-pointer', className)}>
        {label && <span className="text-sm text-text-primary">{label}</span>}
        <div className="relative">
            <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} className="sr-only peer" {...props} />
            <div className="w-11 h-6 bg-surface-light rounded-full peer peer-checked:bg-primary-600 peer-focus:ring-2 peer-focus:ring-primary-500 transition-colors" />
            <div className={cn('absolute left-1 top-1 w-4 h-4 bg-text-primary rounded-full transition-transform', checked && 'translate-x-5')} />
        </div>
    </label>
);

export const Slider = ({ label, value, onChange, min = 0, max = 100, step = 1, showValue = true, className, ...props }) => {
    const percentage = ((value - min) / (max - min)) * 100;
    return (
        <div className={cn('mb-4', className)}>
            {label && <div className="flex justify-between mb-1"><label className="text-sm font-medium text-text-primary">{label}</label>{showValue && <span className="text-sm text-text-secondary">{value}</span>}</div>}
            <div className="relative">
                <input type="range" value={value} onChange={onChange} min={min} max={max} step={step}
                    className="w-full h-2 bg-surface-light rounded-lg appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)` }} {...props} />
            </div>
        </div>
    );
};

export const DatePicker = ({ label, value, onChange, placeholder = 'Select a date', required = false, error, className, ...props }) => (
    <div className={cn('mb-4', className)}>
        {label && <label className="block text-sm font-medium mb-1 text-text-primary">{label}{required && <span className="text-danger-500 ml-1">*</span>}</label>}
        <div className="relative">
            <input type="date" value={value} onChange={onChange}
                className={cn('w-full px-3 py-2 border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500', error ? 'border-red-500' : 'border-border')} {...props} />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" size={18} />
        </div>
        {error && <p className="mt-1 text-sm text-danger-500">{error}</p>}
    </div>
);

export const FileUpload = ({ label, name, value, onChange, accept = 'image/*', multiple = false, maxSize = 5 * 1024 * 1024, required = false, error, className, ...props }) => {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([]);
    const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true); else if (e.type === 'dragleave') setDragActive(false); };
    const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); handleFiles(Array.from(e.dataTransfer.files)); };
    const handleFileInput = (e) => handleFiles(Array.from(e.target.files));
    const handleFiles = (newFiles) => { const valid = newFiles.filter(f => f.size <= maxSize); const list = multiple ? [...files, ...valid] : valid; setFiles(list); onChange?.(multiple ? list : list[0]); };
    const removeFile = (index) => { const list = files.filter((_, i) => i !== index); setFiles(list); onChange?.(multiple ? list : list[0]); };
    return (
        <div className={cn('mb-4', className)}>
            {label && <label className="block text-sm font-medium mb-1 text-text-primary">{label}{required && <span className="text-danger-500 ml-1">*</span>}</label>}
            <div className={cn('border-2 border-dashed rounded-lg p-6 text-center transition-colors', dragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-border', error && 'border-red-500')}
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
                <Upload className="mx-auto mb-2 text-text-secondary" size={32} />
                <p className="text-sm text-text-secondary">Drag & drop files here or</p>
                <label className="inline-block mt-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg cursor-pointer hover:bg-primary-700">
                    Browse Files
                    <input type="file" name={name} accept={accept} multiple={multiple} onChange={handleFileInput} className="hidden" {...props} />
                </label>
                <p className="mt-2 text-xs text-text-secondary">Max file size: {maxSize / (1024 * 1024)}MB</p>
            </div>
            {files.length > 0 && <div className="mt-2 space-y-1">{files.map((file, i) => (
                <div key={i} className="flex items-center justify-between text-sm p-2 bg-surface-light rounded">
                    <span className="truncate">{file.name}</span>
                    <button type="button" onClick={() => removeFile(i)} className="text-danger-500 hover:text-red-600">Remove</button>
                </div>
            ))}</div>}
            {error && <p className="mt-1 text-sm text-danger-500">{error}</p>}
        </div>
    );
};

export const Rating = ({ value = 0, onChange, max = 5, size = 'md', readonly = false, className, ...props }) => {
    const [hover, setHover] = useState(0);
    const sizeClasses = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
    return (
        <div className={cn('flex gap-1', className)} {...props}>
            {[...Array(max)].map((_, i) => {
                const rv = i + 1;
                return <button key={i} type="button" onClick={() => !readonly && onChange?.(rv)} onMouseEnter={() => !readonly && setHover(rv)} onMouseLeave={() => !readonly && setHover(0)}
                    className={cn(!readonly && 'cursor-pointer', readonly && 'cursor-default')}>
                    <svg className={cn(sizeClasses[size], (hover >= rv || value >= rv) ? 'text-yellow-400 fill-current' : 'text-text-secondary fill-current')} viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                </button>;
            })}
        </div>
    );
};

export const Captcha = ({ siteKey, onChange, className, ...props }) => {
    const [isVerified, setIsVerified] = useState(false);
    const handleVerify = () => { setIsVerified(true); onChange?.('verified_token'); };
    return (
        <div className={cn('mb-4', className)} {...props}>
            <div className="bg-surface border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center text-white font-bold">RC</div>
                        <span className="text-sm text-text-primary">reCAPTCHA</span>
                    </div>
                    {!isVerified ? (
                        <button type="button" onClick={handleVerify} className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700">I'm not a robot</button>
                    ) : (
                        <div className="flex items-center gap-1 text-success-500"><Check size={16} /><span className="text-sm">Verified</span></div>
                    )}
                </div>
            </div>
        </div>
    );
};
