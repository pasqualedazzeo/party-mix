import { useState, useEffect, useRef } from 'react';
import type { Track } from '../types';

interface SpotifyPlayer {
    _options: { getOAuthToken: (cb: (token: string) => void) => void; name: string };
    connect: () => Promise<boolean>;
    disconnect: () => void;
    addListener: (eventName: string, callback: (state: any) => void) => void;
    removeListener: (eventName: string, callback: (state: any) => void) => void;
    togglePlay: () => Promise<void>;
    previousTrack: () => Promise<void>;
    nextTrack: () => Promise<void>;
}

interface WebPlaybackProps {
    token: string | null;
    spotifyTrack: Track | null;
    onClose: () => void;
    recommendedTracks?: Track[];
    onTrackChange?: (track: Track) => void;
}

const WebPlayback: React.FC<WebPlaybackProps> = ({ token, spotifyTrack, onClose, recommendedTracks = [], onTrackChange }) => {
    const [player, setPlayer] = useState<SpotifyPlayer>();
    const [is_active, setIsActive] = useState(false);
    const [is_playing, setIsPlaying] = useState(false);
    const [deviceId, setDeviceId] = useState<string>();
    const [error, setError] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
    const progressInterval = useRef<number>();
    const scriptRef = useRef<HTMLScriptElement | null>(null);

    // Format time in MM:SS
    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (!token) {
            setError('No access token available');
            return;
        }

        let cleanupCalled = false;
        let initializationAttempted = false;
        let registrationTimeout: ReturnType<typeof setTimeout>;

        const handleTokenError = () => {
            localStorage.removeItem('spotify_token');
            window.location.href = '/';
        };

        const initializePlayer = () => {
            if (initializationAttempted) return;
            initializationAttempted = true;

            const player = new (window as any).Spotify.Player({
                name: 'Party Mix Web Player',
                getOAuthToken: (cb: (token: string) => void) => {
                    cb(token);
                },
            }) as SpotifyPlayer;

            // Error handling
            player.addListener('initialization_error', ({ message }) => {
                console.error('Failed to initialize:', message);
                setError('Failed to initialize player: ' + message);
                setIsInitializing(false);
            });

            player.addListener('authentication_error', ({ message }) => {
                console.error('Failed to authenticate:', message);
                setError('Failed to authenticate: ' + message);
                handleTokenError();
            });

            player.addListener('account_error', ({ message }) => {
                console.error('Failed to validate Spotify account:', message);
                setError('Premium required: ' + message);
            });

            // Playback status updates
            player.addListener('ready', ({ device_id }) => {
                if (cleanupCalled) return;
                console.log('Ready with Device ID', device_id);
                setDeviceId(device_id);

                registrationTimeout = setTimeout(async () => {
                    try {
                        const success = await player.connect();
                        if (success) {
                            console.log('Successfully connected to Spotify!');
                            setIsActive(true);
                            setIsInitializing(false);
                        } else {
                            throw new Error('Failed to connect to Spotify');
                        }
                    } catch (error) {
                        console.error('Connection error:', error);
                        setError('Failed to connect to Spotify');
                        setIsInitializing(false);
                    }
                }, 1000);
            });

            player.addListener('not_ready', ({ device_id }) => {
                if (cleanupCalled) return;
                console.log('Device ID has gone offline', device_id);
                setIsActive(false);
            });

            player.addListener('player_state_changed', state => {
                if (!state || cleanupCalled) {
                    return;
                }
                setIsActive(true);
                setIsPlaying(!state.paused);
                setDuration(state.duration);
                setProgress(state.position);
                setError(null);

                // Clear existing interval
                if (progressInterval.current) {
                    clearInterval(progressInterval.current);
                }

                // Start progress tracking if playing
                if (!state.paused) {
                    progressInterval.current = setInterval(() => {
                        setProgress(prev => {
                            if (prev >= state.duration) {
                                if (progressInterval.current) {
                                    clearInterval(progressInterval.current);
                                }
                                return 0;
                            }
                            return prev + 1000;
                        });
                    }, 1000);
                }
            });

            // Connect to the player
            player.connect().catch(error => {
                console.error('Failed to connect:', error);
                setError('Failed to connect to Spotify');
                setIsInitializing(false);
            });

            setPlayer(player);

            return () => {
                cleanupCalled = true;
                if (progressInterval.current) {
                    clearInterval(progressInterval.current);
                }
                if (registrationTimeout) {
                    clearTimeout(registrationTimeout);
                }
                player.disconnect();
            };
        };

        // Load Spotify SDK script
        if (!window.Spotify && !scriptRef.current) {
            const script = document.createElement('script');
            script.src = 'https://sdk.scdn.co/spotify-player.js';
            script.async = true;

            document.body.appendChild(script);
            scriptRef.current = script;

            window.onSpotifyWebPlaybackSDKReady = () => {
                initializePlayer();
            };
        } else if (window.Spotify) {
            initializePlayer();
        }

        return () => {
            if (scriptRef.current) {
                document.body.removeChild(scriptRef.current);
                scriptRef.current = null;
            }
            window.onSpotifyWebPlaybackSDKReady = () => {};
        };
    }, [token]);

    useEffect(() => {
        let isMounted = true;

        const startPlayback = async () => {
            if (!deviceId || !token || !spotifyTrack || !player) return;

            try {
                // Ensure we're connected
                if (!is_active) {
                    const connected = await player.connect();
                    if (!connected) {
                        throw new Error('Failed to connect player');
                    }
                    // Wait for device registration
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                // First get the current playback state
                const stateResponse = await fetch('https://api.spotify.com/v1/me/player', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (stateResponse.status === 401) {
                    setError('Token expired. Please refresh the page.');
                    return;
                }

                // Then start playback
                const playResponse = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        uris: [`spotify:track:${spotifyTrack.id}`]
                    })
                });

                if (!isMounted) return;

                if (playResponse.status === 401) {
                    setError('Token expired. Please refresh the page.');
                    return;
                }

                if (playResponse.status === 404) {
                    throw new Error('Device not found. Please try refreshing the page.');
                }

                if (!playResponse.ok) {
                    const errorData = await playResponse.json().catch(() => ({}));
                    throw new Error(errorData.error?.message || 'Failed to start playback');
                }

                setError(null);
            } catch (error) {
                if (!isMounted) return;
                console.error('Playback error:', error);
                setError(error instanceof Error ? error.message : 'Failed to start playback');
            }
        };

        if (!isInitializing && deviceId && spotifyTrack) {
            startPlayback();
        }

        return () => {
            isMounted = false;
        };
    }, [deviceId, token, spotifyTrack, player, is_active, isInitializing]);

    useEffect(() => {
        if (spotifyTrack && recommendedTracks.length > 0) {
            const index = recommendedTracks.findIndex(track => track.id === spotifyTrack.id);
            setCurrentTrackIndex(index);
        }
    }, [spotifyTrack, recommendedTracks]);

    const handlePreviousTrack = async () => {
        if (!player || recommendedTracks.length === 0) return;
        
        const newIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : recommendedTracks.length - 1;
        const previousTrack = recommendedTracks[newIndex];
        
        if (previousTrack && onTrackChange) {
            onTrackChange(previousTrack);
        }
    };

    const handleNextTrack = async () => {
        if (!player || recommendedTracks.length === 0) return;
        
        const newIndex = currentTrackIndex < recommendedTracks.length - 1 ? currentTrackIndex + 1 : 0;
        const nextTrack = recommendedTracks[newIndex];
        
        if (nextTrack && onTrackChange) {
            onTrackChange(nextTrack);
        }
    };

    if (isInitializing) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-dark-surface border-t border-dark-highlight p-4">
                <div className="flex items-center justify-center gap-2 text-dark-text">
                    <div className="animate-spin h-5 w-5 border-2 border-dark-text border-t-transparent rounded-full"></div>
                    <span>Initializing Spotify player...</span>
                </div>
            </div>
        );
    }

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

    if (!is_active) {
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
                                disabled={!player || isInitializing || recommendedTracks.length === 0}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                                </svg>
                            </button>
                            <button 
                                className="text-dark-text/70 hover:text-dark-text p-2 rounded-full hover:bg-dark-highlight disabled:opacity-50 transition-colors"
                                onClick={() => player?.togglePlay()}
                                disabled={!player || isInitializing}
                            >
                                {is_playing ? (
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
                                disabled={!player || isInitializing || recommendedTracks.length === 0}
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
                        <span className="text-dark-text/70 text-sm min-w-[40px]">{formatTime(progress)}</span>
                        <div className="flex-1 h-1 bg-dark-highlight rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-dark-text transition-all duration-1000"
                                style={{ width: `${(progress / duration) * 100}%` }}
                            />
                        </div>
                        <span className="text-dark-text/70 text-sm min-w-[40px]">{formatTime(duration)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WebPlayback;
