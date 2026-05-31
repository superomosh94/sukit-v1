import React, { useState } from 'react';
import { Wrench, Code, Image, Type, Hash, Minus, Plus, ArrowLeftRight, Palette, Search, RefreshCw, Copy, Check, X } from 'lucide-react';
import { cn } from '../utils/cn';

const TOOLS = [
  { id: 'css-gradient', name: 'CSS Gradient Generator', icon: Palette, description: 'Create beautiful linear and radial gradients', category: 'css' },
  { id: 'color-contrast', name: 'Color Contrast Checker', icon: Hash, description: 'Check WCAG accessibility contrast ratios', category: 'accessibility' },
  { id: 'css-minifier', name: 'CSS Minifier', icon: Minus, description: 'Minify and optimize your CSS code', category: 'css' },
  { id: 'base64', name: 'Base64 Encoder/Decoder', icon: Code, description: 'Encode and decode Base64 strings', category: 'encoding' },
  { id: 'image-url', name: 'Data URI Generator', icon: Image, description: 'Convert images to inline data URIs', category: 'media' },
  { id: 'font-preview', name: 'Font Preview', icon: Type, description: 'Preview Google Fonts with custom text', category: 'typography' },
  { id: 'unit-converter', name: 'Unit Converter (px/rem/em)', icon: ArrowLeftRight, description: 'Convert between CSS units', category: 'css' },
  { id: 'html-entities', name: 'HTML Entities Encoder', icon: Code, description: 'Encode special HTML characters', category: 'encoding' },
];

const CATEGORIES = ['all', 'css', 'encoding', 'typography', 'media', 'accessibility'];

const CssGradientGenerator = () => {
  const [angle, setAngle] = useState(90);
  const [colors, setColors] = useState(['#4F46E5', '#06B6D4']);
  const [copied, setCopied] = useState(false);

  const gradient = `linear-gradient(${angle}deg, ${colors.join(', ')})`;
  const css = `background: ${gradient};`;

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const addColor = () => setColors([...colors, '#ffffff']);
  const removeColor = (i) => colors.length > 2 && setColors(colors.filter((_, idx) => idx !== i));
  const updateColor = (i, val) => setColors(colors.map((c, idx) => idx === i ? val : c));

  return (
    <div className="space-y-4">
      <div className="h-32 rounded-xl border border-border" style={{ background: gradient }} />
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-secondary">Angle:</span>
        <input type="range" min="0" max="360" value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="flex-1" />
        <span className="text-sm font-mono text-text-primary w-10">{angle}°</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map((color, i) => (
          <div key={i} className="flex items-center gap-1">
            <input type="color" value={color} onChange={(e) => updateColor(i, e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
            <input type="text" value={color} onChange={(e) => updateColor(i, e.target.value)} className="w-20 px-2 py-1 bg-surface border border-border rounded text-sm font-mono text-text-primary" />
            {colors.length > 2 && (
              <button onClick={() => removeColor(i)} className="p-1 rounded hover:bg-danger-500/10">
                <Minus className="w-3 h-3 text-danger-500" />
              </button>
            )}
          </div>
        ))}
        <button onClick={addColor} className="p-1.5 rounded hover:bg-surface-light border border-dashed border-border">
          <Plus className="w-3.5 h-3.5 text-text-secondary" />
        </button>
      </div>
      <div className="relative">
        <pre className="bg-background border border-border rounded-lg p-3 text-sm font-mono text-text-primary overflow-x-auto">{css}</pre>
        <button onClick={() => copyToClipboard(css)} className="absolute top-2 right-2 p-1.5 rounded hover:bg-surface-light">
          {copied ? <Check className="w-4 h-4 text-success-500" /> : <Copy className="w-4 h-4 text-text-secondary" />}
        </button>
      </div>
    </div>
  );
};

const ColorContrastChecker = () => {
  const [fg, setFg] = useState('#333333');
  const [bg, setBg] = useState('#ffffff');

  const luminance = (hex) => {
    const rgb = hex.replace('#', '').match(/.{2}/g).map(c => parseInt(c, 16) / 255);
    const lum = rgb.map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
  };

  const contrast = () => {
    const l1 = luminance(fg);
    const l2 = luminance(bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
  };

  const ratio = parseFloat(contrast());
  const passesAA = ratio >= 4.5;
  const passesAAA = ratio >= 7;

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div>
          <label className="block text-xs text-text-secondary mb-1">Text Color</label>
          <div className="flex items-center gap-2">
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
            <input type="text" value={fg} onChange={(e) => setFg(e.target.value)} className="w-24 px-2 py-1 bg-surface border border-border rounded text-sm font-mono text-text-primary" />
          </div>
        </div>
        <ArrowLeftRight className="w-5 h-5 text-text-secondary mt-6" />
        <div>
          <label className="block text-xs text-text-secondary mb-1">Background Color</label>
          <div className="flex items-center gap-2">
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
            <input type="text" value={bg} onChange={(e) => setBg(e.target.value)} className="w-24 px-2 py-1 bg-surface border border-border rounded text-sm font-mono text-text-primary" />
          </div>
        </div>
      </div>
      <div className="p-6 rounded-xl border border-border text-center transition-all" style={{ color: fg, backgroundColor: bg }}>
        <p className="text-xl font-bold">Sample Text</p>
        <p className="text-sm opacity-80">The quick brown fox jumps over the lazy dog</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface border border-border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-text-primary">{ratio}:1</p>
          <p className="text-xs text-text-secondary mt-1">Contrast Ratio</p>
        </div>
        <div className={`bg-surface border rounded-lg p-3 text-center ${passesAA ? 'border-success-500/30' : 'border-danger-500/30'}`}>
          <p className={`text-lg font-bold flex items-center justify-center gap-1 ${passesAA ? 'text-success-500' : 'text-danger-500'}`}>AA {passesAA ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}</p>
          <p className="text-xs text-text-secondary mt-1">Normal Text (4.5:1)</p>
        </div>
        <div className={`bg-surface border rounded-lg p-3 text-center ${passesAAA ? 'border-success-500/30' : 'border-danger-500/30'}`}>
          <p className={`text-lg font-bold flex items-center justify-center gap-1 ${passesAAA ? 'text-success-500' : 'text-danger-500'}`}>AAA {passesAAA ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}</p>
          <p className="text-xs text-text-secondary mt-1">Enhanced (7:1)</p>
        </div>
      </div>
    </div>
  );
};

const Base64Tool = () => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('encode');

  const result = mode === 'encode'
    ? btoa(unescape(encodeURIComponent(input)))
    : (() => { try { return decodeURIComponent(escape(atob(input))); } catch { return 'Invalid Base64 input'; } })();

  const [copied, setCopied] = useState(false);
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setMode('encode')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'encode' ? 'bg-primary-500 text-white' : 'bg-surface border border-border text-text-secondary'}`}>
          Encode
        </button>
        <button onClick={() => setMode('decode')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'decode' ? 'bg-primary-500 text-white' : 'bg-surface border border-border text-text-secondary'}`}>
          Decode
        </button>
      </div>
      <div>
        <label className="block text-sm text-text-secondary mb-1">Input</label>
        <textarea rows={4} value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary font-mono text-sm resize-y" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm text-text-secondary">Result</label>
          <button onClick={copyToClipboard} className="p-1 rounded hover:bg-surface-light">
            {copied ? <Check className="w-4 h-4 text-success-500" /> : <Copy className="w-4 h-4 text-text-secondary" />}
          </button>
        </div>
        <textarea rows={4} value={result} readOnly className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary font-mono text-sm resize-y" />
      </div>
    </div>
  );
};

const UnitConverter = () => {
  const [pxValue, setPxValue] = useState('16');
  const [baseSize, setBaseSize] = useState(16);

  const px = parseFloat(pxValue) || 0;
  const rem = (px / baseSize).toFixed(4);
  const em = (px / baseSize).toFixed(4);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-text-secondary mb-1">Pixels (px)</label>
          <input type="number" value={pxValue} onChange={(e) => setPxValue(e.target.value)} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary" />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">Base Size (px)</label>
          <input type="number" value={baseSize} onChange={(e) => setBaseSize(Number(e.target.value))} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-primary-500">{rem}</p>
          <p className="text-xs text-text-secondary mt-1">rem</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-primary-500">{em}</p>
          <p className="text-xs text-text-secondary mt-1">em</p>
        </div>
      </div>
    </div>
  );
};

const TOOL_COMPONENTS = {
  'css-gradient': CssGradientGenerator,
  'color-contrast': ColorContrastChecker,
  'base64': Base64Tool,
  'unit-converter': UnitConverter,
};

const Tools = () => {
  const [activeTool, setActiveTool] = useState('css-gradient');
  const [category, setCategory] = useState('all');

  const filtered = TOOLS.filter(t => category === 'all' || t.category === category);
  const ActiveComponent = TOOL_COMPONENTS[activeTool];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Tools</h1>
        <p className="text-text-secondary mt-1">Developer utilities and generators</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${category === cat ? 'bg-primary-500 text-white' : 'bg-surface border border-border text-text-secondary hover:text-text-primary'}`}>
            {cat === 'all' ? 'All Tools' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-1">
          {filtered.map(tool => (
            <button key={tool.id} onClick={() => setActiveTool(tool.id)} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTool === tool.id ? 'bg-primary-500/10 border border-primary-500/30' : 'hover:bg-surface border border-transparent'}`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${activeTool === tool.id ? 'bg-primary-500 text-white' : 'bg-surface-light text-text-secondary'}`}>
                <tool.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{tool.name}</p>
                <p className="text-xs text-text-secondary truncate">{tool.description}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="lg:col-span-3 bg-surface border border-border rounded-xl p-6">
          {ActiveComponent ? <ActiveComponent /> : (
            <div className="text-center py-12">
              <Wrench className="w-12 h-12 text-text-secondary mx-auto mb-3" />
              <p className="text-text-secondary">Select a tool from the sidebar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tools;
