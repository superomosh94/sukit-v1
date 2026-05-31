export type BlockCategory =
  | 'content'
  | 'media'
  | 'layout'
  | 'forms'
  | 'widgets'
  | 'advanced';

export interface BlockSchema {
  type: string;
  properties: Record<string, BlockPropSchema>;
  required?: string[];
}

export interface BlockPropSchema {
  type: 'text' | 'number' | 'boolean' | 'select' | 'image' | 'color' | 'richText' | 'code' | 'object' | 'array';
  label: string;
  default?: any;
  options?: { label: string; value: any }[];
  placeholder?: string;
  description?: string;
  required?: boolean;
}

export interface BlockProps {
  [key: string]: any;
}

export interface BlockStyles {
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  borderRadius?: string;
  boxShadow?: string;
  border?: string;
  opacity?: number;
  width?: string;
  height?: string;
  [key: string]: any;
}

export interface BlockAnimation {
  enter?: {
    type: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'rotateIn' | 'typewriter';
    duration?: number;
    delay?: number;
    easing?: string;
  };
  hover?: {
    type: 'scale' | 'lift' | 'glow' | 'color' | 'border' | 'shadow' | 'ripple' | 'rgbShift' | 'pixelate';
    scale?: number;
    duration?: number;
  };
}

export interface BlockRegistration {
  type: string;
  name: string;
  description: string;
  category: BlockCategory;
  icon: string;
  component: React.ComponentType<any>;
  schema: BlockSchema;
  defaultProps: BlockProps;
  defaultStyles: BlockStyles;
  defaultAnimation?: BlockAnimation;
  supportsChildren?: boolean;
  editable?: boolean;
}

export interface Block {
  id: string;
  columnId: string;
  blockType: string;
  sortOrder: number;
  props: BlockProps;
  styles: BlockStyles;
  responsive?: Record<string, { styles?: BlockStyles; props?: BlockProps; visible?: boolean }>;
  animation?: BlockAnimation;
  children?: Block[];
}
