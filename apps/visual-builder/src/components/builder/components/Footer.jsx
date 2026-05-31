import React from 'react';
import { Github, Twitter, Facebook, Linkedin, Instagram } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Footer = ({ 
    columns = [],
    copyright = '© 2024 Your Company. All rights reserved.',
    socialLinks = [],
    className 
}) => {
    const socialIcons = {
        github: Github,
        twitter: Twitter,
        facebook: Facebook,
        linkedin: Linkedin,
        instagram: Instagram
    };

    return (
        <footer className={cn('bg-surface border-t border-border py-12', className)}>
            <div className="container mx-auto px-4">
                {/* Footer Columns */}
                {columns.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        {columns.map((column, idx) => (
                            <div key={idx}>
                                <h3 className="font-semibold text-text-primary mb-4">{column.title}</h3>
                                <ul className="space-y-2">
                                    {column.links.map((link, linkIdx) => (
                                        <li key={linkIdx}>
                                            <a href={link.url} className="text-text-secondary hover:text-text-primary transition-colors">
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border">
                    <p className="text-sm text-text-secondary">{copyright}</p>
                    
                    {socialLinks.length > 0 && (
                        <div className="flex gap-4 mt-4 md:mt-0">
                            {socialLinks.map((social, idx) => {
                                const Icon = socialIcons[social.platform];
                                return Icon ? (
                                    <a 
                                        key={idx}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-text-secondary hover:text-primary-500 transition-colors"
                                    >
                                        <Icon className="w-5 h-5" />
                                    </a>
                                ) : null;
                            })}
                        </div>
                    )}
                </div>
            </div>
        </footer>
    );
};

Footer.displayName = 'Footer';
export default Footer;
