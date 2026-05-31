import React, { useState } from 'react';
import { cn } from '../../../utils/cn';

export const Form = ({ 
    children, 
    onSubmit,
    method = 'POST',
    action = '#',
    successMessage = 'Form submitted successfully!',
    redirectUrl = '',
    className 
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            if (onSubmit) {
                await onSubmit(data);
            }
            
            setSubmitted(true);
            if (redirectUrl) {
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 1500);
            }
        } catch (error) {
            setErrors({ form: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-success-500/10 border border-success-500/20 rounded-lg p-6 text-center">
                <div className="text-success-500 text-lg mb-2">✓</div>
                <p className="text-text-primary">{successMessage}</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} method={method} action={action} className={cn('space-y-4', className)}>
            {errors.form && (
                <div className="bg-danger-500/10 border border-danger-500/20 rounded-lg p-3 text-danger-500 text-sm">
                    {errors.form}
                </div>
            )}
            {children}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
                {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
        </form>
    );
};

Form.displayName = 'Form';
export default Form;
