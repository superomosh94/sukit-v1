/* src/utils/componentRegistry.js */
/**
 * Simple registry for built‑in UI components used in the SuKit visual builder.
 * Each component entry contains metadata required by the Component Library UI.
 */

let builtInComponents = [
  {
    id: 'button',
    name: 'Button',
    category: 'UI Elements',
    description: 'A simple clickable button.',
    code: `const Button = () => <button className="px-4 py-2 bg-blue-500 text-white rounded">Click Me</button>;`,
    preview: `<button className="px-4 py-2 bg-primary-500 text-white rounded">Button</button>`,
  },
  {
    id: 'heading',
    name: 'Heading',
    category: 'Typography',
    description: 'A heading element (h1).',
    code: `const Heading = () => <h1 className="text-2xl font-bold">Heading</h1>;`,
    preview: `<h1 className="text-2xl font-bold">Heading</h1>`,
  },
  {
    id: 'paragraph',
    name: 'Paragraph',
    category: 'Typography',
    description: 'A paragraph of text.',
    code: `const Paragraph = () => <p className="text-base text-gray-700">Lorem ipsum dolor sit amet.</p>;`,
    preview: `<p className="text-base text-text-primary">Paragraph</p>`,
  },
  {
    id: 'card',
    name: 'Card',
    category: 'Container',
    description: 'A simple card layout.',
    code: `const Card = () => (
  <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold mb-2">Card Title</h3>
    <p className="text-sm text-gray-600">Card content goes here.</p>
  </div>
);`,
    preview: `<div className="p-4 bg-surface border border-border rounded-lg shadow-sm">
  <h3 className="text-lg font-semibold mb-2">Card</h3>
</div>`,
  },
  {
    id: 'grid',
    name: 'Grid',
    category: 'Layout',
    description: 'CSS Grid layout container.',
    code: `const Grid = () => (
  <div className="grid grid-cols-3 gap-4 p-4">
    <div className="p-4 bg-blue-100 rounded text-center text-blue-700 font-semibold">1</div>
    <div className="p-4 bg-blue-100 rounded text-center text-blue-700 font-semibold">2</div>
    <div className="p-4 bg-blue-100 rounded text-center text-blue-700 font-semibold">3</div>
  </div>
);`,
    preview: `<div className="grid grid-cols-3 gap-4 p-4"></div>`,
  },
  {
    id: 'flexbox',
    name: 'Flexbox',
    category: 'Layout',
    description: 'Flexbox container.',
    code: `const Flexbox = () => (
  <div className="flex justify-between items-center p-4 bg-gray-50 border rounded-lg">
    <span className="font-medium text-gray-700">Left Item</span>
    <span className="font-medium text-gray-700">Right Item</span>
  </div>
);`,
    preview: `<div className="flex justify-between items-center p-4 bg-gray-50 border rounded-lg"></div>`,
  },
  {
    id: 'stack',
    name: 'Stack',
    category: 'Layout',
    description: 'Vertical layout stack.',
    code: `const Stack = () => (
  <div className="flex flex-col space-y-3 p-4">
    <div className="p-2 bg-indigo-50 border border-indigo-200 rounded text-indigo-700">Stack Item 1</div>
    <div className="p-2 bg-indigo-50 border border-indigo-200 rounded text-indigo-700">Stack Item 2</div>
    <div className="p-2 bg-indigo-50 border border-indigo-200 rounded text-indigo-700">Stack Item 3</div>
  </div>
);`,
    preview: `<div className="flex flex-col space-y-3 p-4"></div>`,
  },
  {
    id: 'divider',
    name: 'Divider',
    category: 'Layout',
    description: 'Horizontal rule separating content.',
    code: `const Divider = () => (
  <div className="p-4 space-y-2">
    <p className="text-sm text-gray-500">Above the divider</p>
    <hr className="border-t border-gray-300" />
    <p className="text-sm text-gray-500">Below the divider</p>
  </div>
);`,
    preview: `<hr className="border-t border-gray-300" />`,
  },
  {
    id: 'spacer',
    name: 'Spacer',
    category: 'Layout',
    description: 'Spacer element for layout padding.',
    code: `const Spacer = () => (
  <div className="p-4 bg-gray-50 rounded-lg">
    <div className="p-2 bg-gray-200 rounded text-center text-xs text-gray-500">Before Spacer</div>
    <div className="h-8" />
    <div className="p-2 bg-gray-200 rounded text-center text-xs text-gray-500">After Spacer (8px blank height)</div>
  </div>
);`,
    preview: `<div className="h-8" />`,
  },
  {
    id: 'header',
    name: 'Header',
    category: 'Layout',
    description: 'Responsive site header.',
    code: `const Header = () => (
  <header className="w-full bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between shadow-sm">
    <span className="text-lg font-bold text-gray-900">BrandLogo</span>
    <nav className="flex space-x-4 text-sm font-medium text-gray-600">
      <span className="hover:text-gray-900 cursor-pointer">Home</span>
      <span className="hover:text-gray-900 cursor-pointer">About</span>
      <span className="hover:text-gray-900 cursor-pointer">Contact</span>
    </nav>
  </header>
);`,
    preview: `<header className="w-full bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between shadow-sm"></header>`,
  },
  {
    id: 'footer',
    name: 'Footer',
    category: 'Layout',
    description: 'Standard site footer.',
    code: `const Footer = () => (
  <footer className="w-full bg-gray-900 text-gray-400 py-8 px-6 text-center text-sm border-t">
    <p>© 2026 Your Company. All rights reserved.</p>
    <div className="mt-2 flex justify-center space-x-4">
      <span className="hover:text-white cursor-pointer">Privacy Policy</span>
      <span className="hover:text-white cursor-pointer">Terms of Service</span>
    </div>
  </footer>
);`,
    preview: `<footer className="w-full bg-gray-900 text-gray-400 py-8 px-6 text-center text-sm border-t"></footer>`,
  },
  {
    id: 'sidebar',
    name: 'Sidebar',
    category: 'Layout',
    description: 'Collapsible sidebar container.',
    code: `const Sidebar = () => (
  <div className="flex h-48 border rounded-lg overflow-hidden bg-gray-50">
    <aside className="w-48 bg-white border-r p-4 flex flex-col space-y-2">
      <span className="font-semibold text-gray-800 text-xs uppercase tracking-wider">Navigation</span>
      <span className="p-2 hover:bg-gray-100 rounded text-sm text-gray-700 cursor-pointer">Dashboard</span>
      <span className="p-2 hover:bg-gray-100 rounded text-sm text-gray-700 cursor-pointer">Settings</span>
    </aside>
    <main className="flex-1 p-4 text-sm text-gray-500">Main Content Area</main>
  </div>
);`,
    preview: `<div className="flex h-48 border rounded-lg overflow-hidden bg-gray-50"></div>`,
  },
  {
    id: 'rich-text',
    name: 'RichText',
    category: 'Typography',
    description: 'WYSIWYG rich text editor.',
    code: `const RichText = () => (
  <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <div className="flex gap-2 border-b pb-2 mb-2">
      <span className="font-bold border px-2 py-0.5 rounded cursor-pointer hover:bg-gray-100">B</span>
      <span className="italic border px-2 py-0.5 rounded cursor-pointer hover:bg-gray-100">I</span>
      <span className="underline border px-2 py-0.5 rounded cursor-pointer hover:bg-gray-100">U</span>
    </div>
    <div className="text-gray-800 focus:outline-none min-h-[60px]" contentEditable>
      Format text dynamically using the WYSIWYG editor...
    </div>
  </div>
);`,
    preview: `<div className="p-4 bg-white border border-gray-200 rounded-lg">Rich Text Editor</div>`,
  },
  {
    id: 'link',
    name: 'Link',
    category: 'Typography',
    description: 'Anchor hyperlink.',
    code: `const Link = () => (
  <a href="#" className="text-blue-500 hover:text-blue-600 underline font-medium">
    Visit our website &rarr;
  </a>
);`,
    preview: `<a href="#" className="text-blue-500 underline">Link</a>`,
  },
  {
    id: 'list',
    name: 'List',
    category: 'Typography',
    description: 'Ordered or unordered list.',
    code: `const List = () => (
  <ul className="list-disc pl-5 space-y-1 text-gray-700">
    <li>First bullet point item</li>
    <li>Second bullet point item</li>
    <li>Third bullet point item</li>
  </ul>
);`,
    preview: `<ul className="list-disc pl-5 text-gray-700"><li>List Item</li></ul>`,
  },
  {
    id: 'quote',
    name: 'Quote',
    category: 'Typography',
    description: 'Stylized blockquote with citation.',
    code: `const Quote = () => (
  <div className="border-l-4 border-blue-500 pl-4 py-1 italic bg-gray-50 rounded-r text-gray-700">
    "The best way to predict the future is to invent it."
    <span className="block text-sm text-gray-500 mt-1 not-italic">— Alan Kay</span>
  </div>
);`,
    preview: `<div className="border-l-4 border-blue-500 pl-4 py-1 italic text-gray-700">Quote</div>`,
  },
  {
    id: 'code-block',
    name: 'CodeBlock',
    category: 'Typography',
    description: 'Code snippet card with line formatting.',
    code: 'const CodeBlock = () => (\n  <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto shadow-sm">\n    <div className="flex justify-between items-center text-xs text-gray-400 border-b border-gray-800 pb-2 mb-2">\n      <span>javascript</span>\n      <span className="cursor-pointer hover:text-white">Copy</span>\n    </div>\n    <pre><code>{\`const greet = () => {\n  console.log("Hello, World!");\n};\`}</code></pre>\n  </div>\n);',
    preview: `<div className="bg-gray-900 text-gray-100 rounded-lg p-2 font-mono text-xs">Code Block</div>`,
  },
  {
    id: 'drop-cap',
    name: 'DropCap',
    category: 'Typography',
    description: 'Paragraph starting with a large letter.',
    code: `const DropCap = () => (
  <p className="text-gray-700 leading-relaxed">
    <span className="float-left text-5xl font-bold text-blue-500 mr-2 leading-none">O</span>
    nce upon a time, in a codebase far away, developers began implementing beautiful drop caps to highlight the beginning of stories.
  </p>
);`,
    preview: `<p className="text-gray-700"><span className="text-2xl font-bold text-blue-500 mr-1">D</span>rop Cap</p>`,
  },
  {
    id: 'gallery',
    name: 'Gallery',
    category: 'Media',
    description: 'Image gallery layout.',
    code: `const Gallery = () => (
  <div className="grid grid-cols-3 gap-2">
    <div className="aspect-square bg-gray-200 rounded flex items-center justify-center text-gray-400 font-semibold">Img 1</div>
    <div className="aspect-square bg-gray-200 rounded flex items-center justify-center text-gray-400 font-semibold">Img 2</div>
    <div className="aspect-square bg-gray-200 rounded flex items-center justify-center text-gray-400 font-semibold">Img 3</div>
  </div>
);`,
    preview: `<div className="grid grid-cols-3 gap-2"></div>`,
  },
  {
    id: 'video',
    name: 'Video',
    category: 'Media',
    description: 'Standard video player component.',
    code: `const Video = () => (
  <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center text-white border">
    <div className="w-12 h-12 rounded-full bg-blue-500/80 hover:bg-blue-500 flex items-center justify-center cursor-pointer shadow">
      <svg className="w-6 h-6 fill-current text-white ml-1" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  </div>
);`,
    preview: `<div className="relative aspect-video bg-black rounded-lg"></div>`,
  },
  {
    id: 'audio',
    name: 'Audio',
    category: 'Media',
    description: 'Audio track player.',
    code: `const Audio = () => (
  <div className="bg-white border rounded-lg p-3 flex items-center gap-3 shadow-sm">
    <button className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 focus:outline-none">
      ▶
    </button>
    <div className="flex-1">
      <div className="text-xs font-semibold text-gray-800">Preview Track</div>
      <div className="w-full bg-gray-200 h-1 rounded-full mt-1">
        <div className="bg-blue-500 h-1 rounded-full w-1/3"></div>
      </div>
    </div>
  </div>
);`,
    preview: `<div className="bg-white border rounded-lg p-2">Audio Player</div>`,
  },
  {
    id: 'icon',
    name: 'Icon',
    category: 'Media',
    description: 'Lucide SVG icon container.',
    code: `const Icon = () => (
  <div className="text-blue-500 p-2 border inline-block rounded-lg hover:bg-blue-50 cursor-pointer">
    ★
  </div>
);`,
    preview: `<div className="text-blue-500 p-1">Icon</div>`,
  },
  {
    id: 'avatar',
    name: 'Avatar',
    category: 'Media',
    description: 'User avatar picture card.',
    code: `const Avatar = () => (
  <div className="flex items-center gap-2">
    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold border-2 border-white shadow-sm">
      JD
    </div>
    <span className="text-xs font-medium text-gray-700">John Doe</span>
  </div>
);`,
    preview: `<div className="w-8 h-8 rounded-full bg-blue-100"></div>`,
  },
  {
    id: 'map',
    name: 'Map',
    category: 'Media',
    description: 'Interactive Leaflet map container.',
    code: `const Map = () => (
  <div className="w-full h-32 bg-gray-100 border rounded-lg flex flex-col items-center justify-center text-gray-500 shadow-inner">
    <span className="text-xl">🗺️</span>
    <span className="text-xs font-medium mt-1">Interactive Map Panel</span>
  </div>
);`,
    preview: `<div className="w-full h-24 bg-gray-100 border rounded-lg"></div>`,
  },
  {
    id: 'background',
    name: 'Background',
    category: 'Media',
    description: 'Parallax or media backdrop.',
    code: `const Background = () => (
  <div className="w-full h-32 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-lg flex items-center justify-center text-white font-semibold shadow">
    Backdrop Box
  </div>
);`,
    preview: `<div className="w-full h-24 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-lg"></div>`,
  },
  {
    id: 'form',
    name: 'Form',
    category: 'Forms',
    description: 'Form container with validation.',
    code: `const Form = () => (
  <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email Address</label>
        <input type="email" placeholder="you@example.com" className="w-full px-3 py-1.5 border rounded text-sm bg-gray-50 focus:bg-white" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Password</label>
        <input type="password" placeholder="••••••••" className="w-full px-3 py-1.5 border rounded text-sm bg-gray-50 focus:bg-white" />
      </div>
      <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-semibold">Sign In</button>
    </div>
  </div>
);`,
    preview: `<div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">Form Panel</div>`,
  },
  {
    id: 'input',
    name: 'Input',
    category: 'Forms',
    description: 'Standard text input.',
    code: `const Input = () => (
  <div className="p-2">
    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Username</label>
    <input type="text" placeholder="Enter username..." className="w-full px-3 py-2 border rounded-lg text-sm" />
  </div>
);`,
    preview: `<input type="text" placeholder="Input field" className="px-2 py-1 border rounded" />`,
  },
  {
    id: 'textarea',
    name: 'Textarea',
    category: 'Forms',
    description: 'Multi-line text input field.',
    code: `const Textarea = () => (
  <div className="p-2">
    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Biography</label>
    <textarea placeholder="Tell us about yourself..." rows="3" className="w-full px-3 py-2 border rounded-lg text-sm resize-none"></textarea>
  </div>
);`,
    preview: `<textarea placeholder="Text area" className="px-2 py-1 border rounded"></textarea>`,
  },
  {
    id: 'select',
    name: 'Select',
    category: 'Forms',
    description: 'Dropdown selection menu.',
    code: `const Select = () => (
  <div className="p-2">
    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Country</label>
    <select className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
      <option>United States</option>
      <option>Canada</option>
      <option>United Kingdom</option>
    </select>
  </div>
);`,
    preview: `<select className="px-2 py-1 border rounded"><option>Select option</option></select>`,
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    category: 'Forms',
    description: 'Custom checkbox selector.',
    code: `const Checkbox = () => (
  <label className="flex items-center gap-2 p-2 cursor-pointer">
    <input type="checkbox" className="w-4 h-4 rounded text-blue-500 border-gray-300" />
    <span className="text-sm text-gray-700">Remember my details</span>
  </label>
);`,
    preview: `<label className="flex items-center gap-1"><input type="checkbox" /> Checkbox</label>`,
  },
  {
    id: 'radio',
    name: 'Radio',
    category: 'Forms',
    description: 'Radio button group.',
    code: `const Radio = () => (
  <div className="space-y-1 p-2">
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="radio" name="preview-radio" className="w-4 h-4 text-blue-500 border-gray-300" defaultChecked />
      <span className="text-sm text-gray-700">Standard Delivery</span>
    </label>
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="radio" name="preview-radio" className="w-4 h-4 text-blue-500 border-gray-300" />
      <span className="text-sm text-gray-700">Express Delivery</span>
    </label>
  </div>
);`,
    preview: `<label className="flex items-center gap-1"><input type="radio" /> Radio option</label>`,
  },
  {
    id: 'switch',
    name: 'Switch',
    category: 'Forms',
    description: 'Toggle switch checkbox.',
    code: `const Switch = () => (
  <div className="flex items-center justify-between p-2">
    <span className="text-sm text-gray-700 font-medium">Toggle Mode</span>
    <div className="w-10 h-6 bg-blue-500 rounded-full p-1 flex items-center justify-end cursor-pointer">
      <div className="w-4 h-4 bg-white rounded-full"></div>
    </div>
  </div>
);`,
    preview: `<div className="w-8 h-4 bg-blue-500 rounded-full"></div>`,
  },
  {
    id: 'slider',
    name: 'Slider',
    category: 'Forms',
    description: 'Range selection slider.',
    code: `const Slider = () => (
  <div className="p-2">
    <div className="flex justify-between text-xs text-gray-500 mb-1">
      <span>Volume</span>
      <span>75%</span>
    </div>
    <input type="range" className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" defaultValue="75" />
  </div>
);`,
    preview: `<input type="range" />`,
  },
  {
    id: 'date-picker',
    name: 'DatePicker',
    category: 'Forms',
    description: 'Calendar date picker input.',
    code: `const DatePicker = () => (
  <div className="p-2">
    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Select Date</label>
    <div className="relative">
      <input type="text" value="05/27/2026" className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50" readOnly />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">📅</span>
    </div>
  </div>
);`,
    preview: `<input type="text" value="Select Date" className="px-2 py-1 border rounded" readOnly />`,
  },
  {
    id: 'file-upload',
    name: 'FileUpload',
    category: 'Forms',
    description: 'Drag and drop file uploader.',
    code: `const FileUpload = () => (
  <div className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg p-6 text-center cursor-pointer transition-colors">
    <span className="text-2xl text-gray-400 block mb-2">📁</span>
    <span className="text-sm font-medium text-gray-700">Drag and drop file here</span>
    <span className="text-xs text-gray-400 block mt-1">PNG, JPG, PDF up to 5MB</span>
  </div>
);`,
    preview: `<div className="border border-dashed border-gray-300 p-4 rounded text-center">Upload box</div>`,
  },
  {
    id: 'rating',
    name: 'Rating',
    category: 'Forms',
    description: 'Interactive star rating select.',
    code: `const Rating = () => (
  <div className="flex items-center gap-1 p-2">
    <span className="text-yellow-400 text-lg cursor-pointer">★</span>
    <span className="text-yellow-400 text-lg cursor-pointer">★</span>
    <span className="text-yellow-400 text-lg cursor-pointer">★</span>
    <span className="text-yellow-400 text-lg cursor-pointer">★</span>
    <span className="text-gray-300 text-lg cursor-pointer">★</span>
    <span className="text-xs text-gray-500 ml-2">(4/5 Stars)</span>
  </div>
);`,
    preview: `<span className="text-yellow-400">★★★★☆</span>`,
  },
  {
    id: 'captcha',
    name: 'Captcha',
    category: 'Forms',
    description: 'Simple verification quiz.',
    code: `const Captcha = () => (
  <div className="bg-gray-50 border rounded-lg p-3 space-y-2">
    <span className="text-xs text-gray-600 font-semibold block">Please verify you are human</span>
    <div className="flex gap-2 items-center">
      <span className="bg-white border px-3 py-1 font-mono text-sm rounded">4 + 3 = ?</span>
      <input type="text" className="w-16 px-2 py-1 border rounded text-sm text-center" placeholder="Ans" />
      <button className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-semibold">Verify</button>
    </div>
  </div>
);`,
    preview: `<div className="border p-2 rounded bg-gray-50 text-xs">Human Verification</div>`,
  },
    {
        id: 'pagination',
        name: 'Pagination',
        category: 'Navigation',
        description: 'Simple pagination control with previous/next buttons.',
        code: `const Pagination = ({ totalPages = 5, current = 1, onPageChange }) => {
  const [page, setPage] = React.useState(current);
  const handlePrev = () => {
    if (page > 1) {
      setPage(page - 1);
      onPageChange && onPageChange(page - 1);
    }
  };
  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1);
      onPageChange && onPageChange(page + 1);
    }
  };
  return (
    <div className="flex items-center gap-2">
      <button onClick={handlePrev} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50" disabled={page === 1}>Prev</button>
      <span className="text-sm">Page {page} of {totalPages}</span>
      <button onClick={handleNext} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50" disabled={page === totalPages}>Next</button>
    </div>
  );
};`,
        preview: `<div class="flex items-center gap-2"><button class="px-2 py-1 bg-gray-200 rounded">Prev</button><span class="text-sm">Page 1 of 5</span><button class="px-2 py-1 bg-gray-200 rounded">Next</button></div>`
    },
    {
        id: 'back-to-top',
        name: 'BackToTop',
        category: 'Navigation',
        description: 'Button that appears after scrolling and scrolls back to top.',
        code: `const BackToTop = () => {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-5 right-5 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
      aria-label="Back to top"
    >
      ↑
    </button>
  );
};`,
        preview: `<button class="fixed bottom-5 right-5 p-3 bg-blue-600 text-white rounded-full shadow-lg">↑</button>`
    },
    {
        id: 'social-icons',
        name: 'SocialIcons',
        category: 'Navigation',
        description: 'Row of social media icons.',
        code: `import { Facebook, Twitter, Linkedin, Github } from 'lucide-react';
const SocialIcons = () => (
  <div className="flex space-x-3">
    <Facebook className="w-5 h-5 text-gray-600 hover:text-gray-800 cursor-pointer" />
    <Twitter className="w-5 h-5 text-gray-600 hover:text-gray-800 cursor-pointer" />
    <Linkedin className="w-5 h-5 text-gray-600 hover:text-gray-800 cursor-pointer" />
    <Github className="w-5 h-5 text-gray-600 hover:text-gray-800 cursor-pointer" />
  </div>
);`,
        preview: `<div class="flex space-x-3"><svg><!-- facebook icon placeholder --></svg><svg><!-- twitter icon placeholder --></svg><svg><!-- linkedin icon placeholder --></svg><svg><!-- github icon placeholder --></svg></div>`
    },
    // Data Components
    {
        id: 'table',
        name: 'Table',
        category: 'Data',
        description: 'Data table with sorting and pagination.',
        code: `const Table = () => <div className="w-full overflow-x-auto border border-border rounded-lg"><table className="w-full text-sm"><thead className="bg-surface-light"><tr><th className="px-4 py-3 text-left font-medium text-text-primary">Name</th><th className="px-4 py-3 text-left font-medium text-text-primary">Status</th></tr></thead><tbody><tr className="border-t border-border"><td className="px-4 py-3">Item 1</td><td className="px-4 py-3">Active</td></tr></tbody></table></div>;`,
        preview: `<div className="w-full overflow-x-auto border border-border rounded-lg"><table className="w-full text-sm"><thead><tr><th>Header</th></tr></thead></table></div>`
    },
    {
        id: 'chart',
        name: 'Chart',
        category: 'Data',
        description: 'Data visualization chart component.',
        code: `const Chart = () => <div className="p-4 bg-surface border border-border rounded-lg"><div className="h-48 flex items-end gap-2"><div className="w-8 bg-primary-500 rounded-t" style={{height: '60%'}}></div><div className="w-8 bg-primary-400 rounded-t" style={{height: '80%'}}></div><div className="w-8 bg-primary-300 rounded-t" style={{height: '45%'}}></div><div className="w-8 bg-primary-500 rounded-t" style={{height: '70%'}}></div></div></div>;`,
        preview: `<div className="h-24 flex items-end gap-1"><div className="w-4 bg-primary-500 rounded-t" style={{height:'60%'}}></div><div className="w-4 bg-primary-400 rounded-t" style={{height:'80%'}}></div></div>`
    },
    {
        id: 'calendar',
        name: 'Calendar',
        category: 'Data',
        description: 'Event calendar component.',
        code: `const Calendar = () => <div className="p-4 bg-surface border border-border rounded-lg"><div className="flex justify-between mb-4"><span className="font-semibold">May 2026</span></div><div className="grid grid-cols-7 gap-1 text-center text-sm"><span className="font-medium text-text-secondary">Sun</span><span className="font-medium text-text-secondary">Mon</span><span className="font-medium text-text-secondary">Tue</span><span className="font-medium text-text-secondary">Wed</span><span className="font-medium text-text-secondary">Thu</span><span className="font-medium text-text-secondary">Fri</span><span className="font-medium text-text-secondary">Sat</span></div></div>;`,
        preview: `<div className="grid grid-cols-7 gap-1 text-center text-sm"><span>Sun</span><span>Mon</span><span>Tue</span></div>`
    },
    {
        id: 'timeline',
        name: 'Timeline',
        category: 'Data',
        description: 'Vertical timeline of events.',
        code: `const Timeline = () => <div className="space-y-4"><div className="flex gap-4"><div className="w-3 h-3 bg-primary-500 rounded-full mt-1.5"></div><div><p className="font-medium">Event 1</p><p className="text-sm text-text-secondary">Description</p></div></div></div>;`,
        preview: `<div className="flex gap-3"><div className="w-2 h-2 bg-primary-500 rounded-full mt-1"></div><div><p>Event</p></div></div>`
    },
    {
        id: 'accordion',
        name: 'Accordion',
        category: 'Data',
        description: 'Expandable accordion sections.',
        code: `const Accordion = () => <div className="border border-border rounded-lg divide-y divide-border"><div className="p-4 flex justify-between items-center cursor-pointer"><span className="font-medium">Section 1</span><span>+</span></div></div>;`,
        preview: `<div className="border border-border rounded-lg p-3"><span>Accordion</span></div>`
    },
    {
        id: 'tabs',
        name: 'Tabs',
        category: 'Data',
        description: 'Tabbed content switcher.',
        code: `const Tabs = () => <div><div className="flex border-b border-border"><button className="px-4 py-2 border-b-2 border-primary-500 text-primary-500 font-medium">Tab 1</button><button className="px-4 py-2 text-text-secondary">Tab 2</button></div></div>;`,
        preview: `<div className="flex border-b border-border"><button className="px-3 py-1 border-b-2 border-primary-500">Tab</button></div>`
    },
    {
        id: 'carousel',
        name: 'Carousel',
        category: 'Data',
        description: 'Image and content carousel/slider.',
        code: `const Carousel = () => <div className="relative overflow-hidden rounded-lg bg-surface"><div className="flex transition-transform duration-300"><div className="min-w-full h-48 flex items-center justify-center bg-surface-light">Slide 1</div></div><button className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-surface/80 rounded-full">←</button><button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-surface/80 rounded-full">→</button></div>;`,
        preview: `<div className="relative overflow-hidden rounded-lg h-24 bg-surface"><button>←</button><button>→</button></div>`
    },
    // E-commerce Components
    {
        id: 'product-card',
        name: 'Product Card',
        category: 'E-commerce',
        description: 'Product display card with image, title, price.',
        code: `const ProductCard = () => <div className="bg-surface border border-border rounded-lg overflow-hidden"><div className="h-48 bg-surface-light"></div><div className="p-4"><h3 className="font-semibold">Product Name</h3><p className="text-primary-500 font-bold mt-1">$29.99</p></div></div>;`,
        preview: `<div className="border border-border rounded-lg overflow-hidden"><div className="h-24 bg-surface-light"></div><div className="p-2"><h3>Product</h3></div></div>`
    },
    {
        id: 'product-grid',
        name: 'Product Grid',
        category: 'E-commerce',
        description: 'Responsive product grid layout.',
        code: `const ProductGrid = () => <div className="grid grid-cols-3 gap-4"><div className="bg-surface border border-border rounded-lg p-4">Product 1</div><div className="bg-surface border border-border rounded-lg p-4">Product 2</div><div className="bg-surface border border-border rounded-lg p-4">Product 3</div></div>;`,
        preview: `<div className="grid grid-cols-3 gap-2"><div className="border rounded p-2"></div><div className="border rounded p-2"></div><div className="border rounded p-2"></div></div>`
    },
    {
        id: 'add-to-cart',
        name: 'Add to Cart',
        category: 'E-commerce',
        description: 'Add to cart button with quantity.',
        code: `const AddToCart = () => <div className="flex items-center gap-3"><div className="flex items-center border border-border rounded"><button className="px-3 py-2">-</button><span className="px-3 py-2 border-x border-border">1</span><button className="px-3 py-2">+</button></div><button className="px-6 py-2 bg-primary-500 text-white rounded-lg font-medium">Add to Cart</button></div>;`,
        preview: `<div className="flex items-center gap-2"><button className="px-4 py-2 bg-primary-500 text-white rounded">Add to Cart</button></div>`
    },
    {
        id: 'shopping-cart',
        name: 'Shopping Cart',
        category: 'E-commerce',
        description: 'Shopping cart with items list.',
        code: `const ShoppingCart = () => <div className="bg-surface border border-border rounded-lg p-4"><div className="flex items-center gap-4 py-3 border-b border-border"><div className="w-16 h-16 bg-surface-light rounded"></div><div className="flex-1"><h4 className="font-medium">Product</h4><p className="text-sm text-text-secondary">$29.99</p></div></div></div>;`,
        preview: `<div className="border rounded-lg p-3"><div className="flex gap-3"><div className="w-12 h-12 bg-surface-light rounded"></div><div><p>Product</p></div></div></div>`
    },
    {
        id: 'checkout',
        name: 'Checkout',
        category: 'E-commerce',
        description: 'Checkout form with payment.',
        code: `const Checkout = () => <div className="max-w-2xl mx-auto space-y-6"><div className="bg-surface border border-border rounded-lg p-6"><h3 className="text-lg font-semibold mb-4">Shipping Info</h3><input placeholder="Full Name" className="w-full px-4 py-2 border border-border rounded-lg mb-3" /></div></div>;`,
        preview: `<div className="border rounded-lg p-4 space-y-3"><input placeholder="Checkout" className="w-full px-3 py-2 border rounded" /></div>`
    },
    {
        id: 'coupon',
        name: 'Coupon',
        category: 'E-commerce',
        description: 'Discount coupon code input.',
        code: `const Coupon = () => <div className="flex gap-2"><input placeholder="Enter coupon code" className="flex-1 px-4 py-2 border border-border rounded-lg" /><button className="px-4 py-2 bg-primary-500 text-white rounded-lg">Apply</button></div>;`,
        preview: `<div className="flex gap-2"><input placeholder="Coupon" className="px-3 py-1 border rounded" /><button className="px-3 py-1 bg-primary-500 text-white rounded">Apply</button></div>`
    },
    {
        id: 'wishlist',
        name: 'Wishlist',
        category: 'E-commerce',
        description: 'Saved/wishlist items collection.',
        code: `const Wishlist = () => <div className="grid grid-cols-2 gap-4"><div className="bg-surface border border-border rounded-lg p-4 relative"><button className="absolute top-2 right-2 text-red-500">♥</button><div className="h-32 bg-surface-light rounded mb-2"></div><h4 className="font-medium">Product</h4></div></div>;`,
        preview: `<div className="grid grid-cols-2 gap-2"><div className="border rounded p-2"><button>♥</button></div></div>`
    },
    {
        id: 'reviews',
        name: 'Reviews',
        category: 'E-commerce',
        description: 'Product reviews and ratings.',
        code: `const Reviews = () => <div className="space-y-4"><div className="flex items-center gap-2"><span className="text-yellow-400">★★★★★</span><span className="text-sm text-text-secondary">5.0</span></div><div className="border-b border-border pb-4"><p className="font-medium">Great product!</p><p className="text-sm text-text-secondary mt-1">Review content here.</p></div></div>;`,
        preview: `<div className="space-y-2"><span className="text-yellow-400">★★★★★</span><p className="text-sm">Reviews</p></div>`
    },
    {
        id: 'related-products',
        name: 'Related Products',
        category: 'E-commerce',
        description: 'Related/suggested products carousel.',
        code: `const RelatedProducts = () => <div><h3 className="text-lg font-semibold mb-4">Related Products</h3><div className="grid grid-cols-4 gap-4"><div className="bg-surface border border-border rounded-lg p-3"><div className="h-32 bg-surface-light rounded mb-2"></div><p className="font-medium text-sm">Product</p></div></div></div>;`,
        preview: `<div><h3 className="font-semibold mb-2">Related</h3><div className="grid grid-cols-4 gap-2"><div className="border rounded p-2"></div></div></div>`
    },
    // Dynamic Components
    {
        id: 'posts-loop',
        name: 'Posts Loop',
        category: 'Dynamic',
        description: 'Blog posts listing with pagination.',
        code: `const PostsLoop = () => <div className="grid grid-cols-3 gap-6"><div className="bg-surface border border-border rounded-lg overflow-hidden"><div className="h-40 bg-surface-light"></div><div className="p-4"><h3 className="font-semibold">Post Title</h3><p className="text-sm text-text-secondary mt-2">Excerpt...</p></div></div></div>;`,
        preview: `<div className="grid grid-cols-2 gap-3"><div className="border rounded overflow-hidden"><div className="h-20 bg-surface-light"></div><div className="p-2"><h3>Post</h3></div></div></div>`
    },
    {
        id: 'comments',
        name: 'Comments',
        category: 'Dynamic',
        description: 'Comment section with replies.',
        code: `const Comments = () => <div className="space-y-4"><div className="flex gap-3"><div className="w-10 h-10 bg-surface-light rounded-full"></div><div className="flex-1"><p className="font-medium text-sm">John Doe</p><p className="text-sm text-text-secondary">Comment text here.</p></div></div></div>;`,
        preview: `<div className="flex gap-2"><div className="w-8 h-8 bg-surface-light rounded-full"></div><div><p className="text-sm">Comment</p></div></div>`
    },
    {
        id: 'search',
        name: 'Search',
        category: 'Dynamic',
        description: 'Search input with results dropdown.',
        code: `const Search = () => <div className="relative"><input placeholder="Search..." className="w-full px-4 py-3 pl-10 border border-border rounded-lg" /><div className="absolute top-3 left-3 text-text-secondary">🔍</div></div>;`,
        preview: `<div className="relative"><input placeholder="Search..." className="w-full px-3 py-2 border rounded" /></div>`
    },
    {
        id: 'user-profile',
        name: 'User Profile',
        category: 'Dynamic',
        description: 'User profile card with details.',
        code: `const UserProfile = () => <div className="bg-surface border border-border rounded-lg p-6 text-center"><div className="w-20 h-20 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl text-primary-500">JD</div><h3 className="text-lg font-semibold">John Doe</h3><p className="text-sm text-text-secondary">john@example.com</p></div>;`,
        preview: `<div className="border rounded-lg p-4 text-center"><div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-2"></div><h3>User</h3></div>`
    },
    {
        id: 'login-form',
        name: 'Login Form',
        category: 'Dynamic',
        description: 'Login and registration form.',
        code: `const LoginForm = () => <div className="max-w-md mx-auto bg-surface border border-border rounded-lg p-6 space-y-4"><h2 className="text-xl font-bold text-center">Sign In</h2><input placeholder="Email" className="w-full px-4 py-2 border border-border rounded-lg" /><input type="password" placeholder="Password" className="w-full px-4 py-2 border border-border rounded-lg" /><button className="w-full py-2 bg-primary-500 text-white rounded-lg font-medium">Sign In</button></div>;`,
        preview: `<div className="border rounded-lg p-4 max-w-sm mx-auto space-y-3"><input placeholder="Login" className="w-full px-3 py-2 border rounded" /></div>`
    },
    {
        id: 'lottie',
        name: 'Lottie',
        category: 'Dynamic',
        description: 'Lottie animation player.',
        code: `const Lottie = () => <div className="w-32 h-32 mx-auto bg-surface-light rounded-lg flex items-center justify-center text-text-secondary">Lottie Animation</div>;`,
        preview: `<div className="w-24 h-24 mx-auto bg-surface-light rounded-lg flex items-center justify-center">Animation</div>`
    },
    {
        id: 'user-directory',
        name: 'User Directory',
        category: 'Dynamic',
        description: 'User directory with search and filters.',
        code: `const UserDirectory = () => <div className="grid grid-cols-3 gap-4"><div className="bg-surface border border-border rounded-lg p-4 text-center"><div className="w-12 h-12 bg-primary-100 rounded-full mx-auto mb-2"></div><p className="font-medium">User Name</p></div></div>;`,
        preview: `<div className="grid grid-cols-3 gap-2"><div className="border rounded p-3 text-center"><div className="w-10 h-10 bg-primary-100 rounded-full mx-auto"></div></div></div>`
    },
    {
        id: 'tag-cloud',
        name: 'Tag Cloud',
        category: 'Dynamic',
        description: 'Clickable tag cloud.',
        code: `const TagCloud = () => <div className="flex flex-wrap gap-2"><span className="px-3 py-1 bg-surface-light rounded-full text-sm cursor-pointer hover:bg-primary-100">Tag 1</span><span className="px-3 py-1 bg-surface-light rounded-full text-sm cursor-pointer">Tag 2</span></div>;`,
        preview: `<div className="flex flex-wrap gap-1"><span className="px-2 py-1 bg-surface-light rounded-full text-xs">Tags</span></div>`
    },
];

const componentRegistry = {
  getAll: () => builtInComponents,
  getById: (id) => builtInComponents.find((c) => c.id === id),
  register: (component) => {
    builtInComponents.push(component);
  }
};

export default componentRegistry;
