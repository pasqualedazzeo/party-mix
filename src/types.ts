export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  popularity: number;
  previewUrl: string;
  imageUrl: string;
}

export interface FilterOptions {
  artist: string;
  genre: string;
  yearStart: string;
  yearEnd: string;
  tempo: number;
  popularity: number;
  danceability: number;
}