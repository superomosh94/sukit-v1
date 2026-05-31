import React, { useEffect, useRef } from 'react';
import { cn } from '../../../utils/cn';

export const Chart = ({ 
    type = 'bar',
    data = [],
    labels = [],
    colors = ['#3B82F6', '#38BDF8', '#10B981', '#F59E0B', '#EF4444'],
    height = 300,
    className 
}) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || data.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        const maxValue = Math.max(...data);
        const barWidth = (width / data.length) * 0.7;
        const barSpacing = (width / data.length) * 0.3;
        
        if (type === 'bar') {
            data.forEach((value, index) => {
                const barHeight = (value / maxValue) * (height - 60);
                const x = index * (barWidth + barSpacing) + barSpacing / 2;
                const y = height - barHeight - 30;
                
                ctx.fillStyle = colors[index % colors.length];
                ctx.fillRect(x, y, barWidth, barHeight);
                
                // Add value label
                ctx.fillStyle = '#94A3B8';
                ctx.font = '12px sans-serif';
                ctx.fillText(value, x + barWidth / 2 - 10, y - 5);
                
                // Add label
                if (labels[index]) {
                    ctx.fillStyle = '#94A3B8';
                    ctx.font = '10px sans-serif';
                    ctx.fillText(labels[index], x + barWidth / 2 - 15, height - 15);
                }
            });
        } else if (type === 'line') {
            const step = width / (data.length - 1);
            ctx.beginPath();
            ctx.moveTo(0, height - 30 - (data[0] / maxValue) * (height - 60));
            
            data.forEach((value, index) => {
                const x = index * step;
                const y = height - 30 - (value / maxValue) * (height - 60);
                ctx.lineTo(x, y);
            });
            
            ctx.strokeStyle = colors[0];
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Add points
            data.forEach((value, index) => {
                const x = index * step;
                const y = height - 30 - (value / maxValue) * (height - 60);
                
                ctx.fillStyle = colors[0];
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
                
                // Add value label
                ctx.fillStyle = '#94A3B8';
                ctx.font = '12px sans-serif';
                ctx.fillText(value, x - 10, y - 8);
            });
        }
    }, [data, labels, colors, type]);

    return (
        <div className={cn('relative', className)}>
            <canvas
                ref={canvasRef}
                width={800}
                height={height}
                className="w-full"
                style={{ height: `${height}px` }}
            />
            {data.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-text-secondary">
                    No data to display
                </div>
            )}
        </div>
    );
};

Chart.displayName = 'Chart';
export default Chart;