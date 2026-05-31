import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Video = ({ 
    src, 
    type = 'video/mp4',
    poster,
    autoplay = false,
    controls = true,
    loop = false,
    muted = false,
    className 
}) => {
    const [isPlaying, setIsPlaying] = useState(autoplay);
    const [isMuted, setIsMuted] = useState(muted);
    const [progress, setProgress] = useState(0);
    const videoRef = React.useRef(null);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(progress);
        }
    };

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percentage = x / width;
        if (videoRef.current) {
            videoRef.current.currentTime = percentage * videoRef.current.duration;
        }
    };

    const handleFullscreen = () => {
        if (videoRef.current) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            }
        }
    };

    return (
        <div className={cn('relative group bg-black rounded-lg overflow-hidden', className)}>
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                autoPlay={autoplay}
                loop={loop}
                muted={muted}
                onTimeUpdate={handleTimeUpdate}
                className="w-full aspect-video"
            />
            
            {controls && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Progress Bar */}
                    <div 
                        className="w-full h-1 bg-white/30 rounded-full mb-3 cursor-pointer"
                        onClick={handleSeek}
                    >
                        <div 
                            className="h-full bg-primary-500 rounded-full relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-500 rounded-full" />
                        </div>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={togglePlay}
                                className="p-1 rounded-full hover:bg-white/20 transition-colors"
                            >
                                {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
                            </button>
                            <button
                                onClick={toggleMute}
                                className="p-1 rounded-full hover:bg-white/20 transition-colors"
                            >
                                {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                            </button>
                        </div>
                        <button
                            onClick={handleFullscreen}
                            className="p-1 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <Maximize2 className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

Video.displayName = 'Video';
export default Video;
