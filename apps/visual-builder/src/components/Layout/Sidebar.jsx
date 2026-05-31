// src/components/Layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Image,
  MessageSquare,
  Palette,
  Puzzle,
  Users,
  Wrench,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Code2,
  Box,
  FormInput,
  Popcorn
} from 'lucide-react';

const Sidebar = ({ collapsed }) => {
  const menuItems = [
    {
      section: 'MAIN',
      items: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/pages', icon: FileText, label: 'Pages' },
        { path: '/posts', icon: FileText, label: 'Posts' },
        { path: '/media', icon: Image, label: 'Media' },
        { path: '/comments', icon: MessageSquare, label: 'Comments' }
      ]
    },
    {
      section: 'DESIGN',
      items: [
        { path: '/builder', icon: LayoutDashboard, label: 'Page Builder' },
        { path: '/components', icon: Box, label: 'Components' },
        { path: '/theme', icon: Palette, label: 'Theme Designer' },
        { path: '/templates', icon: FormInput, label: 'Templates' },
        { path: '/forms', icon: FormInput, label: 'Forms' },
        { path: '/popups', icon: Popcorn, label: 'Popups' }
      ]
    },
    {
      section: 'DEVELOP',
      items: [
        { path: '/code', icon: Code2, label: 'Code Editor' },
        { path: '/marketplace', icon: Puzzle, label: 'Plugins' }
      ]
    },
    {
      section: 'MANAGE',
      items: [
        { path: '/projects', icon: ShoppingBag, label: 'Projects' },
        { path: '/users', icon: Users, label: 'Users' },
        { path: '/tools', icon: Wrench, label: 'Tools' },
        { path: '/settings', icon: Settings, label: 'Settings' }
      ]
    }
  ];

  return (
    <aside className={`bg-surface border-r border-border transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} flex flex-col overflow-y-auto`}> 
      <div className="flex-1 py-4">
        {menuItems.map((section, idx) => (
          <div key={idx} className="mb-6">
            {!collapsed && (
              <div className="px-4 mb-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {section.section}
              </div>
            )}
            <div className="space-y-1">
              {section.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 mx-2 rounded-lg transition-colors ${
                      isActive ? 'bg-primary-500/20 text-primary-500' : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                    } ${collapsed ? 'justify-center' : ''}`
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Collapse Toggle */}
      <div className="p-3 border-t border-border">
        {collapsed ? (
          <button className="w-full flex justify-center p-2 rounded-lg hover:bg-surface-light transition-colors">
            <ChevronRight className="w-4 h-4 text-text-secondary" />
          </button>
        ) : (
          <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-surface-light transition-colors">
            <span className="text-sm text-text-secondary">Collapse</span>
            <ChevronLeft className="w-4 h-4 text-text-secondary" />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
