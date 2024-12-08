export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  popularity: number;
  previewUrl: string;
  imageUrl: string;
  uri: string;
}

export interface FilterOptions {
  artist: string;
  genre: string;
  yearStart: string;
  yearEnd: string;
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    spotifySDKReady: boolean;
  }
}
