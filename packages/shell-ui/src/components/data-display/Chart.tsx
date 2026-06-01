'use client';

import React from 'react';

export interface ChartProps {
  type: 'bar' | 'line' | 'pie';
  data: Array<{ label: string; value: number; color?: string }>;
  width?: number;
  height?: number;
  className?: string;
}

export function Chart({
  type,
  data,
  width = 300,
  height = 200,
  className,
}: ChartProps) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  if (type === 'bar') {
    return (
      <div
        className={`flex items-end gap-2 ${className || ''}`}
        style={{ width, height }}
      >
        {data.map((item) => (
          <div
            key={item.label}
            className="flex-1 flex flex-col items-center gap-1"
          >
            <div
              className="w-full rounded-t transition-all"
              style={{
                height: `${(item.value / maxVal) * (height - 30)}px`,
                backgroundColor: item.color || 'var(--primary)',
                opacity: 0.8,
              }}
            />
            <span className="text-[8px] text-muted-foreground truncate w-full text-center">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'line') {
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * (width - 40) + 20;
      const y = height - 20 - (d.value / maxVal) * (height - 40);
      return `${x},${y}`;
    });

    return (
      <svg width={width} height={height} className={className}>
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * (width - 40) + 20;
          const y = height - 20 - (d.value / maxVal) * (height - 40);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="3" fill="var(--primary)" />
              <text
                x={x}
                y={height - 5}
                textAnchor="middle"
                fontSize="8"
                fill="var(--muted-foreground)"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  if (type === 'pie') {
    const total = data.reduce((s, d) => s + d.value, 0);
    let cumulative = 0;
    const slices = data.map((d) => {
      const startAngle = (cumulative / total) * 360;
      cumulative += d.value;
      const endAngle = (cumulative / total) * 360;
      return { ...d, startAngle, endAngle };
    });

    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(cx, cy) - 10;

    const polarToCartesian = (angle: number) => {
      const rad = ((angle - 90) * Math.PI) / 180;
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };

    return (
      <svg width={width} height={height} className={className}>
        {slices.map((slice) => {
          const start = polarToCartesian(slice.startAngle);
          const end = polarToCartesian(slice.endAngle);
          const largeArc = slice.endAngle - slice.startAngle > 180 ? 1 : 0;
          const d = `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
          return (
            <g key={slice.label}>
              <path
                d={d}
                fill={slice.color || 'var(--primary)'}
                opacity="0.8"
              />
              <text
                x={
                  cx +
                  r *
                    0.6 *
                    Math.cos(
                      ((slice.startAngle + slice.endAngle) / 2 - 90) *
                        (Math.PI / 180)
                    )
                }
                y={
                  cy +
                  r *
                    0.6 *
                    Math.sin(
                      ((slice.startAngle + slice.endAngle) / 2 - 90) *
                        (Math.PI / 180)
                    )
                }
                textAnchor="middle"
                fontSize="8"
                fill="white"
              >
                {((slice.value / total) * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}
        <text
          x={cx}
          y={cy + 3}
          textAnchor="middle"
          fontSize="10"
          fill="var(--muted-foreground)"
        >
          Total
        </text>
      </svg>
    );
  }

  return null;
}
