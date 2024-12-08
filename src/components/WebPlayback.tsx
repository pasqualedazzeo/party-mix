import { useState, useEffect, useRef, useCallback } from 'react';
import type { Track } from '../types';

// Constants for player events
enum PlayerEvents {
    INITIALIZATION_ERROR = 'initialization_error',
    AUTHENTICATION_ERROR = 'authentication_error',
    ACCOUNT_ERROR = 'account_error',
    READY = 'ready',
    NOT_READY = 'not_ready',
    PLAYER_STATE_CHANGED = 'player_state_changed'
}

interface PlayerState {
    paused: boolean;
    duration: number;
    position: number;
}

interface SpotifyPlayer {
    _options: { 
        getOAuthToken: (cb: (token: string) => void) => void; 
        name: string 
    };
    connect: () => Promise<boolean>;
    disconnect: () => void;
    addListener: <T>(eventName: PlayerEvents, callback: (state: T) => void) => void;
    removeListener: <T>(eventName: PlayerEvents, callback: (state: T) => void) => void;
    togglePlay: () => Promise<void>;
    previousTrack: () => Promise<void>;
    nextTrack: () => Promise<void>;
    getCurrentState: () => Promise<PlayerState | null>;
    seek: (position_ms: number) => Promise<void>;
}

interface WebPlaybackProps {
    token: string | null;
    spotifyTrack: Track | null;
    onClose: () => void;
    recommendedTracks?: Track[];
    onTrackChange?: (track: Track) => void;
    deviceId?: string | null;
    spotifyPlayer?: SpotifyPlayer | null;
    onPlayStateChange?: (isPlaying: boolean) => void;
}

interface PlayerStatus {
    isActive: boolean;
    isPlaying: boolean;
    progress: number;
    duration: number;
}

const WebPlayback: React.FC<WebPlaybackProps> = ({ 
    token, 
    spotifyTrack, 
    onClose, 
    recommendedTracks = [], 
    onTrackChange,
    deviceId: externalDeviceId,
    spotifyPlayer: externalPlayer,
    onPlayStateChange
}) => {
    const [status, setStatus] = useState<PlayerStatus>({
        isActive: false,
        isPlaying: false,
        progress: 0,
        duration: 0
    });
    const [error, setError] = useState<string | null>(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
    const progressInterval = useRef<NodeJS.Timeout>();

    // Utility functions
    const formatTime = useCallback((ms: number): string => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, []);

    // Use external player for state changes
    useEffect(() => {
        if (!externalPlayer) return;

        const handlePlayerStateChange = (state: PlayerState | null) => {
            if (!state) return;

            const isPlaying = !state.paused;
            setStatus(prev => ({
                ...prev,
                isActive: true,
                isPlaying,
                duration: state.duration,
                progress: state.position
            }));

            // Notify parent of play state change
            if (onPlayStateChange) {
                onPlayStateChange(isPlaying);
            }

            if (!state.paused) {
                if (progressInterval.current) {
                    clearInterval(progressInterval.current);
                }
                progressInterval.current = setInterval(() => {
                    setStatus(prev => ({
                        ...prev,
                        progress: Math.min(prev.progress + 1000, state.duration)
                    }));
                }, 1000);
            } else {
                if (progressInterval.current) {
                    clearInterval(progressInterval.current);
                    progressInterval.current = undefined;
                }
            }
        };

        externalPlayer.addListener(PlayerEvents.PLAYER_STATE_CHANGED, handlePlayerStateChange);
        return () => {
            externalPlayer.removeListener(PlayerEvents.PLAYER_STATE_CHANGED, handlePlayerStateChange);
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [externalPlayer, onPlayStateChange]);

    // Handle track changes
    useEffect(() => {
        if (!externalDeviceId || !token || !spotifyTrack) return;

        const playTrack = async () => {
            try {
                await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${externalDeviceId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        uris: [spotifyTrack.uri]
                    })
                });
            } catch (error) {
                console.error('Error playing track:', error);
                setError('Failed to play track');
            }
        };

        playTrack();
    }, [externalDeviceId, token, spotifyTrack]);

    useEffect(() => {
        if (spotifyTrack && recommendedTracks.length > 0) {
            const index = recommendedTracks.findIndex(track => track.id === spotifyTrack.id);
            setCurrentTrackIndex(index);
            // Reset player status when track changes
            setStatus(prev => ({
                ...prev,
                progress: 0,
                duration: 0
            }));
        }
    }, [spotifyTrack, recommendedTracks]);

    const handlePreviousTrack = useCallback(async () => {
        if (!externalPlayer || recommendedTracks.length === 0) return;
        
        const newIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : recommendedTracks.length - 1;
        const previousTrack = recommendedTracks[newIndex];
        
        if (previousTrack && onTrackChange) {
            onTrackChange(previousTrack);
            setCurrentTrackIndex(newIndex);
        }
    }, [currentTrackIndex, recommendedTracks, onTrackChange, externalPlayer]);

    const handleNextTrack = useCallback(async () => {
        if (!externalPlayer || recommendedTracks.length === 0) return;
        
        const newIndex = currentTrackIndex < recommendedTracks.length - 1 ? currentTrackIndex + 1 : 0;
        const nextTrack = recommendedTracks[newIndex];
        
        if (nextTrack && onTrackChange) {
            onTrackChange(nextTrack);
            setCurrentTrackIndex(newIndex);
        }
    }, [currentTrackIndex, recommendedTracks, onTrackChange, externalPlayer]);

    const handleSeek = useCallback(async (event: React.MouseEvent<HTMLDivElement>) => {
        if (!externalPlayer || !status.duration) return;

        const progressBar = event.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const clickPosition = event.clientX - rect.left;
        const percentage = clickPosition / rect.width;
        const position = Math.floor(status.duration * percentage);

        try {
            // If seeking to end of track (within last second), play next track
            if (position >= status.duration - 1000) {
                handleNextTrack();
                return;
            }

            await externalPlayer.seek(position);
            setStatus(prev => ({
                ...prev,
                progress: position
            }));
        } catch (error) {
            console.error('Error seeking:', error);
        }
    }, [externalPlayer, status.duration, handleNextTrack]);

    // Sync player state periodically and handle song end
    useEffect(() => {
        if (!externalPlayer) return;

        const syncInterval = setInterval(async () => {
            const state = await externalPlayer.getCurrentState();
            if (state) {
                const isNearEnd = state.position >= state.duration - 1000 && state.duration > 0;
                
                if (isNearEnd && !state.paused) {
                    handleNextTrack();
                } else {
                    setStatus(prev => ({
                        ...prev,
                        progress: state.position,
                        duration: state.duration,
                        isPlaying: !state.paused
                    }));
                }
            }
        }, 1000);

        return () => clearInterval(syncInterval);
    }, [externalPlayer, handleNextTrack]);

    if (error) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-dark-surface border-t border-dark-highlight p-4">
                <div className="flex justify-between items-center max-w-6xl mx-auto">
                    <div className="flex items-center gap-2 text-red-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-dark-text/70 hover:text-dark-text p-2 rounded-full hover:bg-dark-highlight transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    }

    if (!status.isActive) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-dark-surface border-t border-dark-highlight p-4">
                <div className="flex items-center justify-center gap-2 text-dark-text">
                    <div className="animate-pulse h-3 w-3 bg-dark-text rounded-full"></div>
                    <span>Connecting to Spotify...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-dark-surface border-t border-dark-highlight p-4 shadow-lg backdrop-blur-sm bg-opacity-95">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                            {spotifyTrack && (
                                <div className="flex items-center gap-4 flex-1">
                                    {spotifyTrack.imageUrl && (
                                        <img 
                                            src={spotifyTrack.imageUrl} 
                                            alt={`${spotifyTrack.album} cover`}
                                            className="w-12 h-12 rounded shadow-md"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-dark-text font-medium truncate">{spotifyTrack.title}</div>
                                        <div className="text-dark-text/70 text-sm truncate">
                                            {spotifyTrack.artist}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                className="text-dark-text/70 hover:text-dark-text p-2 rounded-full hover:bg-dark-highlight disabled:opacity-50 transition-colors"
                                onClick={handlePreviousTrack}
                                disabled={!externalPlayer || recommendedTracks.length === 0}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                                </svg>
                            </button>
                            <button 
                                className="text-dark-text/70 hover:text-dark-text p-2 rounded-full hover:bg-dark-highlight disabled:opacity-50 transition-colors"
                                onClick={() => externalPlayer?.togglePlay()}
                                disabled={!externalPlayer}
                            >
                                {status.isPlaying ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </button>
                            <button 
                                className="text-dark-text/70 hover:text-dark-text p-2 rounded-full hover:bg-dark-highlight disabled:opacity-50 transition-colors"
                                onClick={handleNextTrack}
                                disabled={!externalPlayer || recommendedTracks.length === 0}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                                </svg>
                            </button>
                            <div className="w-px h-6 bg-dark-highlight mx-2"></div>
                            <button
                                onClick={onClose}
                                className="text-dark-text/70 hover:text-dark-text p-2 rounded-full hover:bg-dark-highlight transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-2">
                        <span className="text-dark-text/70 text-sm min-w-[40px]">{formatTime(status.progress)}</span>
                        <div 
                            className="progress-bar flex-1 h-1 bg-dark-highlight rounded-full overflow-hidden cursor-pointer" 
                            onClick={handleSeek}
                        >
                            <div 
                                className="h-full bg-dark-text transition-all duration-1000"
                                style={{ 
                                    width: `${(status.progress / status.duration) * 100}%`
                                }} 
                            />
                        </div>
                        <span className="text-dark-text/70 text-sm min-w-[40px]">{formatTime(status.duration)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WebPlayback;
