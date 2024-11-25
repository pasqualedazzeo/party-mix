import { Music2, Sliders, Share2 } from 'lucide-react';
import { loginUrl } from '../utils/spotify';

export function SpotifyLogin() {
  return (
    <div className="min-h-screen bg-dark-bg">
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
  );
}
