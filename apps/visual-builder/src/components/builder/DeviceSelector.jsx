import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Simple device selector for the builder canvas.
 * It does not modify the canvas directly – you can hook the `onDeviceChange`
 * prop to your own store (e.g., canvasStore) to adjust the preview size.
 */
const DeviceSelector = ({ onDeviceChange }) => {
  const [device, setDevice] = useState('desktop');

  const handleChange = (e) => {
    const value = e.target.value;
    setDevice(value);
    if (onDeviceChange) onDeviceChange(value);
  };

  return (
    <div className={cn('flex items-center space-x-2')}> 
      <label className="text-text-primary">Device:</label>
      <select
        value={device}
        onChange={handleChange}
        className={cn('border border-border rounded bg-surface text-text-primary px-2 py-1')}
      >
        <option value="desktop">Desktop</option>
        <option value="tablet">Tablet</option>
        <option value="mobile">Mobile</option>
      </select>
      <div className="flex space-x-1">
        {device === 'desktop' && <Monitor size={18} className="text-primary-500" />}
        {device === 'tablet' && <Tablet size={18} className="text-primary-500" />}
        {device === 'mobile' && <Smartphone size={18} className="text-primary-500" />}
      </div>
    </div>
  );
};

export default DeviceSelector;
