interface Window {
    Spotify: {
        Player: new (options: SpotifyPlayerOptions) => SpotifyPlayer;
    };
}

interface SpotifyPlayerOptions {
    name: string;
    getOAuthToken: (callback: (token: string) => void) => void;
    volume?: number;
}

interface SpotifyPlayer {
    connect(): Promise<boolean>;
    disconnect(): void;
    addListener(eventName: string, callback: (state: any) => void): void;
    removeListener(eventName: string, callback: (state: any) => void): void;
    getCurrentState(): Promise<any>;
    setName(name: string): Promise<void>;
    getVolume(): Promise<number>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    seek(positionMs: number): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
    activateElement(): Promise<void>;
}
