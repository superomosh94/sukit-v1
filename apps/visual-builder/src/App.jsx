// src/App.jsx
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import PageBuilder from './pages/PageBuilder';
import ComponentLibrary from './pages/ComponentLibrary';
import ThemeDesigner from './pages/ThemeDesigner';
import Settings from './pages/Settings';
import SettingsGeneral from './pages/Settings/General';
import SettingsEditor from './pages/Settings/Editor';
import SettingsSEO from './pages/Settings/SEO';
import SettingsPerformance from './pages/Settings/Performance';
import SettingsTeam from './pages/Settings/Team';
import SettingsIntegrations from './pages/Settings/Integrations';
import SettingsSecurity from './pages/Settings/Security';
import { DeveloperWindow } from './pages/DeveloperWindow';
import Account from './pages/Account';
import PluginMarketplace from './pages/PluginMarketplace';
import ProjectManager from './pages/ProjectManager';
import FormBuilder from './pages/FormBuilder';
import PopupBuilder from './pages/PopupBuilder';
import TemplateLibrary from './pages/TemplateLibrary';
import CodeEditor from './pages/CodeEditor';
import MediaLibrary from './pages/MediaLibrary';
import CommentsManager from './pages/CommentsManager';
import UsersManager from './pages/UsersManager';
import Deployment from './pages/Deployment';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PagesManager from './pages/PagesManager';
import PostsManager from './pages/PostsManager';
import ComponentsManager from './pages/ComponentsManager';
import Marketplace from './pages/Marketplace';
import Tools from './pages/Tools';
import { useThemeStore } from './stores/themeStore';
import { injectThemeCSS } from './utils/themeUtils';

function App() {
  const theme = useThemeStore();
  const isDark = useThemeStore((s) => s.isDark);

  useEffect(() => {
    injectThemeCSS(theme);
  }, [theme]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <HashRouter>
      <Routes>
        {/* Auth & fullscreen routes (no layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/developer" element={<DeveloperWindow />} />

        {/* Main routes with layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/builder" element={<PageBuilder />} />
          <Route path="/library" element={<ComponentLibrary />} />
          <Route path="/theme" element={<ThemeDesigner />} />
          <Route path="/settings" element={<Settings />}>
            <Route index element={<SettingsGeneral />} />
            <Route path="general" element={<SettingsGeneral />} />
            <Route path="editor" element={<SettingsEditor />} />
            <Route path="seo" element={<SettingsSEO />} />
            <Route path="performance" element={<SettingsPerformance />} />
            <Route path="team" element={<SettingsTeam />} />
            <Route path="integrations" element={<SettingsIntegrations />} />
            <Route path="security" element={<SettingsSecurity />} />
          </Route>
          <Route path="/account" element={<Account />} />
          <Route path="/plugins" element={<PluginMarketplace />} />
          <Route path="/projects" element={<ProjectManager />} />
          <Route path="/forms" element={<FormBuilder />} />
          <Route path="/popups" element={<PopupBuilder />} />
          <Route path="/templates" element={<TemplateLibrary />} />
          <Route path="/code" element={<CodeEditor />} />
          <Route path="/media" element={<MediaLibrary />} />
          <Route path="/comments" element={<CommentsManager />} />
          <Route path="/users" element={<UsersManager />} />
          <Route path="/deploy" element={<Deployment />} />
          <Route path="/pages" element={<PagesManager />} />
          <Route path="/posts" element={<PostsManager />} />
          <Route path="/components" element={<ComponentsManager />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/tools" element={<Tools />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
