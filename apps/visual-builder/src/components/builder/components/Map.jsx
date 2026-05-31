import React, { useEffect, useRef } from 'react';
import { cn } from '../../../utils/cn';

export const Map = ({ 
    latitude = 40.7128, 
    longitude = -74.0060,
    zoom = 12,
    height = 400,
    marker = true,
    className 
}) => {
    const mapRef = useRef(null);

    useEffect(() => {
        const loadLeaflet = async () => {
            if (!document.querySelector('#leaflet-css')) {
                const link = document.createElement('link');
                link.id = 'leaflet-css';
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);
            }
            
            if (!window.L) {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.onload = initMap;
                document.body.appendChild(script);
            } else {
                initMap();
            }
        };

        const initMap = () => {
            if (mapRef.current && window.L && !window._mapInitialized) {
                window._mapInitialized = true;
                
                const map = window.L.map(mapRef.current).setView([latitude, longitude], zoom);
                
                window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CartoDB'
                }).addTo(map);
                
                if (marker) {
                    window.L.marker([latitude, longitude]).addTo(map)
                        .bindPopup('📍 Location')
                        .openPopup();
                }
            }
        };

        loadLeaflet();
        
        return () => {
            window._mapInitialized = false;
        };
    }, [latitude, longitude, zoom, marker]);

    return (
        <div 
            ref={mapRef} 
            className={cn('w-full rounded-lg overflow-hidden', className)}
            style={{ height: `${height}px` }}
        />
    );
};

Map.displayName = 'Map';
export default Map;
