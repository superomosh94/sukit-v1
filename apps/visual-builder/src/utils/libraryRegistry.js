export const libraryComponents = {
    layout: [
        { id: 'grid', name: 'Grid', icon: 'Grid', component: 'Grid', defaultProps: { columns: 3, gap: 4, children: [] } },
        { id: 'flexbox', name: 'Flexbox', icon: 'Layout', component: 'Flexbox', defaultProps: { direction: 'row', justify: 'start', align: 'stretch', gap: 4, children: [] } },
        { id: 'stack', name: 'Stack', icon: 'Layers', component: 'Stack', defaultProps: { direction: 'vertical', spacing: 4, children: [] } },
        { id: 'divider', name: 'Divider', icon: 'Minus', component: 'Divider', defaultProps: { orientation: 'horizontal', thickness: 1, spacing: 4 } },
        { id: 'spacer', name: 'Spacer', icon: 'Expand', component: 'Spacer', defaultProps: { size: 4, orientation: 'vertical' } },
        { id: 'header', name: 'Header', icon: 'Layout', component: 'Header', defaultProps: { variant: 'default', sticky: false } },
        { id: 'footer', name: 'Footer', icon: 'Layout', component: 'Footer', defaultProps: { variant: 'default', columns: 4 } },
        { id: 'sidebar', name: 'Sidebar', icon: 'PanelLeft', component: 'Sidebar', defaultProps: { position: 'left', width: 320, collapsed: false } },
    ],
    typography: [
        { id: 'rich-text', name: 'Rich Text', icon: 'FileText', component: 'RichText', defaultProps: { placeholder: 'Write something...', toolbar: true } },
        { id: 'link', name: 'Link', icon: 'Link', component: 'Link', defaultProps: { href: '#', target: '_self', underline: true } },
        { id: 'list', name: 'List', icon: 'List', component: 'List', defaultProps: { ordered: false, items: ['Item 1', 'Item 2', 'Item 3'] } },
        { id: 'quote', name: 'Quote', icon: 'Quote', component: 'Quote', defaultProps: { variant: 'default', children: 'This is a beautiful quote...' } },
        { id: 'code-block', name: 'Code Block', icon: 'Code', component: 'CodeBlock', defaultProps: { code: '// Your code here', language: 'javascript' } },
        { id: 'drop-cap', name: 'Drop Cap', icon: 'Type', component: 'DropCap', defaultProps: { size: 'lg', children: 'Once upon a time...' } },
    ],
    forms: [
        { id: 'form', name: 'Form', icon: 'FormInput', component: 'Form', defaultProps: { method: 'POST', children: [] } },
        { id: 'input', name: 'Input', icon: 'Input', component: 'Input', defaultProps: { type: 'text', placeholder: 'Enter text...', required: false } },
        { id: 'textarea', name: 'Textarea', icon: 'AlignLeft', component: 'Textarea', defaultProps: { rows: 4, placeholder: 'Enter multi-line text...' } },
        { id: 'select', name: 'Select', icon: 'ChevronDown', component: 'Select', defaultProps: { options: [{ value: 'option1', label: 'Option 1' }, { value: 'option2', label: 'Option 2' }] } },
        { id: 'checkbox', name: 'Checkbox', icon: 'CheckSquare', component: 'Checkbox', defaultProps: { label: 'Checkbox Label', checked: false } },
        { id: 'radio-group', name: 'Radio Group', icon: 'Circle', component: 'RadioGroup', defaultProps: { options: [{ value: 'option1', label: 'Option 1' }, { value: 'option2', label: 'Option 2' }] } },
        { id: 'switch', name: 'Switch', icon: 'ToggleLeft', component: 'Switch', defaultProps: { label: 'Toggle Switch', checked: false } },
        { id: 'slider', name: 'Slider', icon: 'Sliders', component: 'Slider', defaultProps: { min: 0, max: 100, value: 50 } },
        { id: 'date-picker', name: 'Date Picker', icon: 'Calendar', component: 'DatePicker', defaultProps: {} },
        { id: 'file-upload', name: 'File Upload', icon: 'Upload', component: 'FileUpload', defaultProps: { accept: 'image/*', multiple: false } },
        { id: 'rating', name: 'Rating', icon: 'Star', component: 'Rating', defaultProps: { max: 5, value: 0 } },
        { id: 'captcha', name: 'Captcha', icon: 'Shield', component: 'Captcha', defaultProps: {} },
    ],
    data: [
        { id: 'table', name: 'Table', icon: 'Table', component: 'Table', defaultProps: { columns: [{ key: 'name', label: 'Name' }, { key: 'value', label: 'Value' }], data: [{ name: 'Item 1', value: 100 }] } },
        { id: 'chart', name: 'Chart', icon: 'BarChart', component: 'Chart', defaultProps: { type: 'bar', data: { labels: ['Jan', 'Feb', 'Mar'], datasets: [{ label: 'Sales', data: [10, 20, 30] }] } } },
        { id: 'calendar', name: 'Calendar', icon: 'Calendar', component: 'Calendar', defaultProps: {} },
        { id: 'accordion', name: 'Accordion', icon: 'ChevronsUpDown', component: 'Accordion', defaultProps: { items: [{ title: 'Section 1', content: 'Content 1' }, { title: 'Section 2', content: 'Content 2' }] } },
        { id: 'tabs', name: 'Tabs', icon: 'Files', component: 'Tabs', defaultProps: { tabs: [{ id: 'tab1', label: 'Tab 1', content: 'Content 1' }, { id: 'tab2', label: 'Tab 2', content: 'Content 2' }] } },
        { id: 'carousel', name: 'Carousel', icon: 'Images', component: 'Carousel', defaultProps: { items: ['<div>Slide 1</div>', '<div>Slide 2</div>'] } },
        { id: 'timeline', name: 'Timeline', icon: 'Clock', component: 'Timeline', defaultProps: { events: [{ date: '2024-01-01', title: 'Event 1', description: 'Description 1' }] } },
    ],
    navigation: [
        { id: 'menu', name: 'Menu', icon: 'Menu', component: 'Menu', defaultProps: { items: [{ id: 'home', label: 'Home', href: '/' }, { id: 'about', label: 'About', href: '/about' }] } },
        { id: 'mega-menu', name: 'Mega Menu', icon: 'Layout', component: 'MegaMenu', defaultProps: { items: [] } },
        { id: 'breadcrumb', name: 'Breadcrumb', icon: 'Link', component: 'Breadcrumb', defaultProps: { items: [{ label: 'Home', href: '/' }, { label: 'Products', href: '/products' }] } },
        { id: 'pagination', name: 'Pagination', icon: 'MoreHorizontal', component: 'Pagination', defaultProps: { currentPage: 1, totalPages: 10 } },
        { id: 'back-to-top', name: 'Back to Top', icon: 'ArrowUp', component: 'BackToTop', defaultProps: { position: 'bottom-right' } },
        { id: 'social-icons', name: 'Social Icons', icon: 'Share2', component: 'SocialIcons', defaultProps: { links: { twitter: 'https://twitter.com/', facebook: 'https://facebook.com/' } } },
    ],
};

export const getComponentById = (id) => {
    for (const category of Object.values(libraryComponents)) {
        const found = category.find(c => c.id === id);
        if (found) return found;
    }
    return null;
};

export const getAllComponents = () => {
    return Object.values(libraryComponents).flat();
};

export const getComponentsByCategory = (category) => {
    return libraryComponents[category] || [];
};

export default { libraryComponents, getComponentById, getAllComponents, getComponentsByCategory };
