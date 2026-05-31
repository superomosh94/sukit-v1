import React from 'react';
import { Facebook, Twitter, Linkedin, Github } from 'lucide-react';
import { cn } from '../../../utils/cn';

/**
 * SocialIcons component renders a set of social media icons.
 */
export const SocialIcons = () => (
  <div className={cn('flex space-x-3', 'social-icons')}>
    <Facebook className="w-5 h-5 text-gray-600 hover:text-gray-800 cursor-pointer" />
    <Twitter className="w-5 h-5 text-gray-600 hover:text-gray-800 cursor-pointer" />
    <Linkedin className="w-5 h-5 text-gray-600 hover:text-gray-800 cursor-pointer" />
    <Github className="w-5 h-5 text-gray-600 hover:text-gray-800 cursor-pointer" />
  </div>
);
