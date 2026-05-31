import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Audio = ({ 
    src, 
    title,
    artist,
    coverArt,
    autoplay = false,
    controls = true,
    className 
}) => {
    const [isPlaying, setIsPlaying] = useState(autoplay);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef(null);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className={cn('bg-surface border border-border rounded-lg overflow-hidden', className)}>
            <audio
                ref={audioRef}
                src={src}
                autoPlay={autoplay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
            />
            
            <div className="flex p-4 gap-4">
                {/* Cover Art */}
                {coverArt && (
                    <img src={coverArt} alt={title} className="w-16 h-16 rounded-lg object-cover" />
                )}
                
                {/* Info & Controls */}
                <div className="flex-1">
                    <div>
                        <h4 className="font-medium text-text-primary">{title || 'Audio Track'}</h4>
                        <p className="text-sm text-text-secondary">{artist || 'Unknown Artist'}</p>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-2">
                        <div className="h-1 bg-surface-light rounded-full cursor-pointer">
                            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-text-secondary mt-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex items-center gap-3 mt-2">
                        <button onClick={togglePlay} className="p-1 rounded-full hover:bg-surface-light">
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setIsMuted(!isMuted)} className="p-1 rounded-full hover:bg-surface-light">
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

Audio.displayName = 'Audio';
export default Audio;
