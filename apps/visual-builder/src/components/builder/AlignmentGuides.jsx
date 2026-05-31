import React, { useState, useEffect } from 'react';

export const AlignmentGuides = ({ components, selectedId, canvasRef }) => {
    const [guides, setGuides] = useState([]);

    useEffect(() => {
        if (!selectedId) {
            setGuides([]);
            return;
        }

        const selectedComponent = components.find(c => c.id === selectedId);
        if (!selectedComponent) return;

        const selectedEl = document.getElementById(`component-${selectedId}`);
        if (!selectedEl) return;

        const selectedRect = selectedEl.getBoundingClientRect();
        const canvasRect = canvasRef?.current?.getBoundingClientRect();
        
        const newGuides = [];
        const tolerance = 5;

        components.forEach(comp => {
            if (comp.id === selectedId) return;
            
            const compEl = document.getElementById(`component-${comp.id}`);
            if (!compEl) return;
            
            const compRect = compEl.getBoundingClientRect();
            
            // Left edge alignment
            if (Math.abs(selectedRect.left - compRect.left) < tolerance) {
                newGuides.push({
                    type: 'vertical',
                    position: compRect.left,
                    color: '#EF4444',
                    label: 'Left edge'
                });
            }
            
            // Right edge alignment
            if (Math.abs(selectedRect.right - compRect.right) < tolerance) {
                newGuides.push({
                    type: 'vertical',
                    position: compRect.right,
                    color: '#EF4444',
                    label: 'Right edge'
                });
            }
            
            // Top edge alignment
            if (Math.abs(selectedRect.top - compRect.top) < tolerance) {
                newGuides.push({
                    type: 'horizontal',
                    position: compRect.top,
                    color: '#EF4444',
                    label: 'Top edge'
                });
            }
            
            // Bottom edge alignment
            if (Math.abs(selectedRect.bottom - compRect.bottom) < tolerance) {
                newGuides.push({
                    type: 'horizontal',
                    position: compRect.bottom,
                    color: '#EF4444',
                    label: 'Bottom edge'
                });
            }
            
            // Center alignment vertical
            if (Math.abs(selectedRect.left + selectedRect.width / 2 - (compRect.left + compRect.width / 2)) < tolerance) {
                newGuides.push({
                    type: 'vertical',
                    position: compRect.left + compRect.width / 2,
                    color: '#3B82F6',
                    label: 'Vertical center'
                });
            }
            
            // Center alignment horizontal
            if (Math.abs(selectedRect.top + selectedRect.height / 2 - (compRect.top + compRect.height / 2)) < tolerance) {
                newGuides.push({
                    type: 'horizontal',
                    position: compRect.top + compRect.height / 2,
                    color: '#3B82F6',
                    label: 'Horizontal center'
                });
            }
        });

        // Canvas boundaries
        if (canvasRect) {
            if (Math.abs(selectedRect.left - canvasRect.left) < tolerance) {
                newGuides.push({ type: 'vertical', position: canvasRect.left, color: '#10B981', label: 'Canvas left edge' });
            }
            if (Math.abs(selectedRect.right - canvasRect.right) < tolerance) {
                newGuides.push({ type: 'vertical', position: canvasRect.right, color: '#10B981', label: 'Canvas right edge' });
            }
            if (Math.abs(selectedRect.top - canvasRect.top) < tolerance) {
                newGuides.push({ type: 'horizontal', position: canvasRect.top, color: '#10B981', label: 'Canvas top edge' });
            }
            if (Math.abs(selectedRect.bottom - canvasRect.bottom) < tolerance) {
                newGuides.push({ type: 'horizontal', position: canvasRect.bottom, color: '#10B981', label: 'Canvas bottom edge' });
            }
        }

        setGuides(newGuides);
    }, [components, selectedId]);

    if (guides.length === 0) return null;

    return (
        <>
            {guides.map((guide, index) => (
                <div
                    key={index}
                    style={{
                        position: 'fixed',
                        ...(guide.type === 'vertical' ? {
                            left: guide.position,
                            top: 0,
                            bottom: 0,
                            width: '2px',
                        } : {
                            top: guide.position,
                            left: 0,
                            right: 0,
                            height: '2px',
                        }),
                        backgroundColor: guide.color,
                        pointerEvents: 'none',
                        zIndex: 9999,
                        boxShadow: `0 0 0 1px ${guide.color}20`
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            ...(guide.type === 'vertical' ? {
                                top: '50%',
                                left: '4px',
                                transform: 'translateY(-50%)',
                            } : {
                                left: '50%',
                                top: '4px',
                                transform: 'translateX(-50%)',
                            }),
                            backgroundColor: guide.color,
                            color: 'white',
                            fontSize: '10px',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {guide.label}
                    </div>
                </div>
            ))}
        </>
    );
};
