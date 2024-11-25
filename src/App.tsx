import { useState, useEffect } from 'react';
import { SearchFilters } from './components/SearchFilters';
import { TrackList } from './components/TrackList';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LoadingState } from './components/LoadingState';
import WebPlayback from './components/WebPlayback';
import { PlaylistView } from './components/PlaylistView';
import { Music2, Sliders, Share2 } from 'lucide-react';
import type { Track, FilterOptions } from './types';
import { getAccessToken, searchTracks, createPlaylist, getCurrentUser } from './utils/spotify';
import { loginUrl } from './utils/spotify';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    artist: '',
    genre: '',
    yearStart: '',
    yearEnd: ''
  });
  const [playlistName, setPlaylistName] = useState(`Party Mix ${new Date().toLocaleDateString()}`);

  useEffect(() => {
    const initializeAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        setIsAuthenticating(true);
        try {
          const accessToken = await getAccessToken();
          if (accessToken) {
            setToken(accessToken);
            const user = await getCurrentUser(accessToken);
            setUserId(user.id);
            setUserEmail(user.email);
          }
        } catch (error) {
          console.error('Authentication error:', error);
        } finally {
          setIsAuthenticating(false);
        }
      }
    };
    initializeAuth();
  }, []);

  useEffect(() => {
    if (token && (filters.artist || filters.genre || filters.yearStart || filters.yearEnd)) {
      const delayDebounceFn = setTimeout(async () => {
        // Only show loading for text-based searches
        const shouldShowLoading = filters.artist !== '' || filters.genre !== '';
        if (shouldShowLoading) {
          setIsLoading(true);
        }
        try {
          const searchResults = await searchTracks(filters, token);
          setTracks(searchResults);
        } catch (error) {
          console.error('Error searching tracks:', error);
        }
        if (shouldShowLoading) {
          setIsLoading(false);
        }
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

  const handleRemoveTrack = (trackId: string) => {
    setPlaylist(prev => prev.filter(track => track.id !== trackId));
  };

  const handleUpdatePlaylistName = (name: string) => {
    setPlaylistName(name);
  };

  const handleSavePlaylist = async () => {
    if (!token || !userId || playlist.length === 0) return;

    try {
      await createPlaylist(
        token,
        userId,
        playlistName,
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
    setUserEmail(null);
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

  if (isAuthenticating) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Header onLogout={handleLogout} userEmail={userEmail || undefined} isAuthenticated={!!token} />
      
      <main className="flex-1">
        {!token ? (
          // Landing Page Content
          <div className="w-full">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
              <div className="text-center">
                <div className="flex justify-center mb-8 animate-pulse">
                  <Music2 className="w-24 h-24 text-spotify-green" />
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-spotify-green to-green-400 mb-6">
                  Find Your Perfect Party Mix with Spotify
                </h1>
                <p className="text-xl md:text-2xl text-dark-text/80 max-w-3xl mx-auto mb-12">
                  Never stress about playlist creation again. Let Party Mix curate the perfect soundtrack for your event using Spotify's powerful filters.
                </p>
                <div className="relative group inline-block">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-spotify-green to-green-400 rounded-lg opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
                  <a
                    href={loginUrl}
                    className="relative flex items-center justify-center px-8 py-4 bg-dark-bg rounded-lg text-lg font-medium text-spotify-green hover:text-white transition-colors duration-200"
                  >
                    <Music2 className="w-5 h-5 mr-2" />
                    Connect with Spotify
                  </a>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="bg-dark-surface py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-spotify-green mb-4">Key Features</h2>
                  <p className="text-dark-text/70">Everything you need to create the perfect party atmosphere</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Smart Playlist Generation */}
                  <div className="bg-dark-bg p-6 rounded-xl shadow-lg hover:shadow-spotify-green/20 transition-all duration-300">
                    <div className="flex items-center justify-center w-12 h-12 bg-spotify-green/10 rounded-lg mb-4 mx-auto">
                      <Music2 className="w-6 h-6 text-spotify-green" />
                    </div>
                    <h3 className="text-xl font-semibold text-spotify-green text-center mb-2">Smart Playlist Generation</h3>
                    <p className="text-dark-text/70 text-center">
                      Intelligent algorithms that understand your party's vibe and create the perfect mix
                    </p>
                  </div>

                  {/* Customizable Filters */}
                  <div className="bg-dark-bg p-6 rounded-xl shadow-lg hover:shadow-spotify-green/20 transition-all duration-300">
                    <div className="flex items-center justify-center w-12 h-12 bg-spotify-green/10 rounded-lg mb-4 mx-auto">
                      <Sliders className="w-6 h-6 text-spotify-green" />
                    </div>
                    <h3 className="text-xl font-semibold text-spotify-green text-center mb-2">Customizable Filters</h3>
                    <p className="text-dark-text/70 text-center">
                      Fine-tune your playlist with mood, genre, and era filters for the perfect atmosphere
                    </p>
                  </div>

                  {/* Spotify Integration */}
                  <div className="bg-dark-bg p-6 rounded-xl shadow-lg hover:shadow-spotify-green/20 transition-all duration-300">
                    <div className="flex items-center justify-center w-12 h-12 bg-spotify-green/10 rounded-lg mb-4 mx-auto">
                      <Share2 className="w-6 h-6 text-spotify-green" />
                    </div>
                    <h3 className="text-xl font-semibold text-spotify-green text-center mb-2">Seamless Integration</h3>
                    <p className="text-dark-text/70 text-center">
                      Direct integration with Spotify for instant playlist creation and sharing
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Dashboard Content
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Search Section */}
            <div className="space-y-6">
              <SearchFilters filters={filters} onFilterChange={handleFilterChange} />
              {isLoading ? (
                <LoadingState />
              ) : (
                <TrackList
                  tracks={tracks}
                  onAddToPlaylist={handleAddToPlaylist}
                  currentlyPlaying={currentlyPlaying}
                  onPlayPreview={handlePlayPreview}
                />
              )}
            </div>

            {/* Playlist */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-dark-text">Your Playlist</h2>
              <PlaylistView
                tracks={playlist}
                currentlyPlaying={currentlyPlaying}
                onPlayPreview={handlePlayPreview}
                onRemoveTrack={handleRemoveTrack}
                onSavePlaylist={handleSavePlaylist}
                onUpdatePlaylistName={handleUpdatePlaylistName}
                playlistName={playlistName}
              />
            </div>

            {/* Web Playback */}
            {currentTrack && (
              <div className="fixed bottom-0 left-0 right-0 bg-dark-surface border-t border-dark-highlight p-4">
                <div className="max-w-7xl mx-auto">
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
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
