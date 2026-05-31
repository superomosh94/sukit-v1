import React, { useState, useCallback } from 'react';
import { Upload, File, X, Image, FileText, AlertCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const FileUpload = ({ 
    label,
    accept = 'image/*,application/pdf',
    multiple = false,
    maxSize = 5242880, // 5MB
    onUpload,
    onChange,
    className 
}) => {
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) return <Image className="w-8 h-8 text-primary-500" />;
        if (type === 'application/pdf') return <FileText className="w-8 h-8 text-danger-500" />;
        return <File className="w-8 h-8 text-text-secondary" />;
    };

    const validateFile = (file) => {
        if (!accept.split(',').some(type => file.type.match(type.trim().replace('*', '.*')))) {
            return `File type ${file.type} not allowed`;
        }
        if (file.size > maxSize) {
            return `File size exceeds ${maxSize / 1024 / 1024}MB limit`;
        }
        return null;
    };

    const handleFiles = useCallback((newFiles) => {
        setError(null);
        const validFiles = [];
        const errors = [];

        const fileArray = Array.from(newFiles);
        for (const file of fileArray) {
            const validationError = validateFile(file);
            if (validationError) {
                errors.push(`${file.name}: ${validationError}`);
            } else {
                validFiles.push(file);
            }
        }

        if (errors.length > 0) {
            setError(errors.join(', '));
        }

        if (validFiles.length > 0) {
            const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
            setFiles(updatedFiles);
            onChange?.(updatedFiles);
            onUpload?.(validFiles);
        }
    }, [files, multiple, onChange, onUpload]);

    const removeFile = (index) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        onChange?.(newFiles);
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    return (
        <div className={cn('space-y-2', className)}>
            {label && <label className="block text-sm font-medium text-text-primary">{label}</label>}
            
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                    'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                    isDragging ? 'border-primary-500 bg-primary-500/5' : 'border-border hover:border-primary-500'
                )}
                onClick={() => document.getElementById('file-input').click()}
            >
                <Upload className="w-10 h-10 text-text-secondary mx-auto mb-3" />
                <p className="text-text-primary mb-1">Click or drag files to upload</p>
                <p className="text-xs text-text-secondary">
                    Accepted: {accept} (max {maxSize / 1024 / 1024}MB)
                </p>
                <input
                    id="file-input"
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                />
            </div>

            {error && (
                <div className="flex items-center gap-1 text-danger-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {files.length > 0 && (
                <div className="space-y-2 mt-2">
                    {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-surface border border-border rounded-lg">
                            <div className="flex items-center gap-3">
                                {getFileIcon(file.type)}
                                <div>
                                    <p className="text-sm text-text-primary">{file.name}</p>
                                    <p className="text-xs text-text-secondary">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeFile(idx)}
                                className="p-1 rounded hover:bg-surface-light"
                            >
                                <X className="w-4 h-4 text-text-secondary" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

FileUpload.displayName = 'FileUpload';
export default FileUpload;
