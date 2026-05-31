import React, { useState, useEffect } from 'react';
import { RefreshCw, Shield } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Captcha = ({ 
    onVerify,
    siteKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', // Test key
    className 
}) => {
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [challenge, setChallenge] = useState(null);

    const generateChallenge = () => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const operators = ['+', '-', '*'];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        let answer;
        
        switch (operator) {
            case '+': answer = num1 + num2; break;
            case '-': answer = num1 - num2; break;
            case '*': answer = num1 * num2; break;
            default: answer = num1 + num2;
        }
        
        return { question: `${num1} ${operator} ${num2}`, answer };
    };

    useEffect(() => {
        setChallenge(generateChallenge());
    }, []);

    const handleVerify = (e) => {
        e.preventDefault();
        const userAnswer = parseInt(e.target.answer.value);
        
        setIsLoading(true);
        
        setTimeout(() => {
            if (userAnswer === challenge.answer) {
                setIsVerified(true);
                onVerify?.(true);
            } else {
                setChallenge(generateChallenge());
                onVerify?.(false);
            }
            setIsLoading(false);
        }, 500);
    };

    if (isVerified) {
        return (
            <div className="flex items-center gap-2 text-success-500 text-sm">
                <Shield className="w-4 h-4" />
                Verified
            </div>
        );
    }

    return (
        <div className={cn('bg-surface border border-border rounded-lg p-4', className)}>
            <form onSubmit={handleVerify} className="space-y-3">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary-500" />
                    <span className="text-sm text-text-primary">Please verify you are human</span>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="bg-surface-light px-4 py-2 rounded-lg font-mono text-lg text-text-primary">
                        {challenge?.question} = ?
                    </div>
                    <input
                        type="number"
                        name="answer"
                        placeholder="Answer"
                        className="w-24 px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-center"
                        required
                        autoFocus
                    />
                    <button
                        type="button"
                        onClick={() => setChallenge(generateChallenge())}
                        className="p-2 rounded-lg hover:bg-surface-light"
                    >
                        <RefreshCw className="w-4 h-4 text-text-secondary" />
                    </button>
                </div>
                
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Verifying...' : 'Verify'}
                </button>
            </form>
        </div>
    );
};

Captcha.displayName = 'Captcha';
export default Captcha;
