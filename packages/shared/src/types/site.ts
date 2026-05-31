export interface GlobalColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  heading: string;
  link: string;
  linkHover: string;
  muted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface GlobalTypography {
  headingFont: string;
  bodyFont: string;
  headingWeight: number;
  bodyWeight: number;
  baseSize: string;
  scaleRatio: number;
  lineHeight: number;
}

export interface ThemeSettings {
  globalColors: GlobalColors;
  globalTypography: GlobalTypography;
  globalSpacing?: string;
  borderRadius?: string;
  buttonStyle?: 'rounded' | 'pill' | 'flat';
  containerWidth?: string;
  darkMode?: boolean;
  customCSS?: string;
}

export interface Domain {
  id: string;
  siteId: string;
  domain: string;
  verified: boolean;
  sslEnabled: boolean;
  isPrimary: boolean;
  createdAt: string;
}

export interface SiteSettings {
  theme: ThemeSettings;
  analytics?: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    customHead?: string;
  };
  performance?: {
    lazyLoadImages?: boolean;
    minifyCSS?: boolean;
    minifyJS?: boolean;
  };
  security?: {
    enableCaptcha?: boolean;
    captchaSiteKey?: string;
    allowedIPs?: string[];
  };
  maintenance?: {
    enabled: boolean;
    message?: string;
  };
}

export interface Site {
  id: string;
  name: string;
  domain?: string;
  settings: SiteSettings;
  userId: string;
  createdAt: string;
  updatedAt: string;
  pages?: any[];
  media?: any[];
}
