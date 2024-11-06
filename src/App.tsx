import React, { useState, useEffect } from 'react';
import { SearchFilters } from './components/SearchFilters';
import { TrackList } from './components/TrackList';
import { SpotifyLogin } from './components/SpotifyLogin';
import { Music2 } from 'lucide-react';
import type { Track, FilterOptions } from './types';
import { getAccessToken, searchTracks, createPlaylist, getCurrentUser } from './utils/spotify';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    artist: '',
    genre: '',
    yearStart: '',
    yearEnd: '',
    tempo: 120,
    popularity: 50,
    danceability: 70
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = await getAccessToken();
      if (accessToken) {
        setToken(accessToken);
        const user = await getCurrentUser(accessToken);
        setUserId(user.id);
      }
    };
    initializeAuth();
  }, []);

  useEffect(() => {
    if (token && filters.artist) {
      const delayDebounceFn = setTimeout(async () => {
        setIsLoading(true);
        try {
          const searchResults = await searchTracks(filters.artist, filters, token);
          setTracks(searchResults);
        } catch (error) {
          console.error('Error searching tracks:', error);
        }
        setIsLoading(false);
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [token, filters]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleAddToPlaylist = (track: Track) => {
    if (!playlist.some(t => t.id === track.id)) {
      setPlaylist(prev => [...prev, track]);
    }
  };

  const handlePlayPreview = (trackId: string) => {
    if (currentlyPlaying === trackId) {
      const audio = document.querySelector('audio');
      if (audio) {
        audio.pause();
      }
      setCurrentlyPlaying(null);
    } else {
      const track = [...tracks, ...playlist].find(t => t.id === trackId);
      if (track?.previewUrl) {
        const audio = document.querySelector('audio') || new Audio();
        audio.src = track.previewUrl;
        audio.play();
        setCurrentlyPlaying(trackId);
      }
    }
  };

  const handleSavePlaylist = async () => {
    if (!token || !userId || playlist.length === 0) return;

    try {
      await createPlaylist(
        token,
        userId,
        `Party Mix ${new Date().toLocaleDateString()}`,
        playlist.map(track => track.id)
      );
      alert('Playlist saved to Spotify!');
    } catch (error) {
      console.error('Error saving playlist:', error);
      alert('Failed to save playlist. Please try again.');
    }
  };

  if (!token) {
    return <SpotifyLogin />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <Music2 className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Party Mix Master</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <SearchFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {isLoading ? 'Searching...' : 'Recommended Tracks'}
              </h2>
              <TrackList
                tracks={tracks}
                onAddToPlaylist={handleAddToPlaylist}
                currentlyPlaying={currentlyPlaying}
                onPlayPreview={handlePlayPreview}
              />
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Your Party Playlist</h2>
                <button
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSavePlaylist}
                  disabled={playlist.length === 0}
                >
                  Save to Spotify
                </button>
              </div>
              <TrackList
                tracks={playlist}
                onAddToPlaylist={handleAddToPlaylist}
                currentlyPlaying={currentlyPlaying}
                onPlayPreview={handlePlayPreview}
              />
            </div>
          </div>
        </div>
      </main>
      <audio style={{ display: 'none' }} onEnded={() => setCurrentlyPlaying(null)} />
    </div>
  );
}

export default App;