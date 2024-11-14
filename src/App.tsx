import { useState, useEffect } from 'react';
import { SearchFilters } from './components/SearchFilters';
import { TrackList } from './components/TrackList';
import { SpotifyLogin } from './components/SpotifyLogin';
import WebPlayback from './components/WebPlayback';
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
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    artist: '',
    genre: '',
    yearStart: '',
    yearEnd: ''
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
    if (token && (filters.artist || filters.genre || filters.yearStart || filters.yearEnd)) {
      const delayDebounceFn = setTimeout(async () => {
        setIsLoading(true);
        try {
          const searchResults = await searchTracks(filters, token);
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
    const track = [...tracks, ...playlist].find(t => t.id === trackId);
    if (!track) return;

    if (currentlyPlaying === trackId) {
      setCurrentlyPlaying(null);
      setCurrentTrack(null);
    } else {
      // Force iframe reload by recreating it
      setCurrentTrack(null);
      setCurrentlyPlaying(null);
      
      requestAnimationFrame(() => {
        setCurrentTrack(track);
        setCurrentlyPlaying(trackId);
      });
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

  // New logout handler
  const handleLogout = () => {
    // Clear token and userId to force re-authentication
    setToken(null);
    setUserId(null);
    // Clear other states to reset the app
    setTracks([]);
    setPlaylist([]);
    setCurrentlyPlaying(null);
    setCurrentTrack(null);
    setFilters({
      artist: '',
      genre: '',
      yearStart: '',
      yearEnd: ''
    });
  };

  if (!token) {
    return <SpotifyLogin />;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text">
      <header className="bg-dark-surface text-dark-text shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group">
              <Music2 className="w-8 h-8 text-spotify-green transform group-hover:scale-110 transition-transform" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-spotify-green to-green-400 bg-clip-text text-transparent">
                Party Mix Master
              </h1>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600/90 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg active:scale-95 transform duration-150"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="transition-all duration-300 ease-in-out">
          <SearchFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {currentTrack && (
          <div className="transition-all duration-300 ease-in-out">
            <WebPlayback
              token={token}
              spotifyTrack={currentTrack}
              onClose={() => setCurrentTrack(null)}
              recommendedTracks={tracks}
              onTrackChange={(track) => {
                setCurrentTrack(track);
                setCurrentlyPlaying(track.id);
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-dark-surface rounded-xl p-6 shadow-xl hover:shadow-spotify-green/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-spotify-green to-green-400 bg-clip-text text-transparent">
                {isLoading ? 'Searching...' : 'Recommended Tracks'}
              </h2>
              {isLoading && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-spotify-green"></div>
              )}
            </div>
            <TrackList
              tracks={tracks}
              onAddToPlaylist={handleAddToPlaylist}
              currentlyPlaying={currentlyPlaying}
              onPlayPreview={handlePlayPreview}
            />
          </div>

          <div className="bg-dark-surface rounded-xl p-6 shadow-xl hover:shadow-spotify-green/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-spotify-green to-green-400 bg-clip-text text-transparent">
                Your Party Playlist
              </h2>
              {playlist.length > 0 && (
                <button
                  onClick={handleSavePlaylist}
                  className="px-4 py-2 bg-spotify-green text-dark-bg rounded-lg hover:bg-opacity-90 transition-colors shadow-md hover:shadow-lg active:scale-95 transform duration-150 flex items-center gap-2"
                >
                  <span>Save to Spotify</span>
                </button>
              )}
            </div>
            <TrackList
              tracks={playlist}
              onAddToPlaylist={() => {}}
              currentlyPlaying={currentlyPlaying}
              onPlayPreview={handlePlayPreview}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
