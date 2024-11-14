import { Music2 } from 'lucide-react';
import { loginUrl } from '../utils/spotify';

export function SpotifyLogin() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-dark-surface rounded-xl p-8 text-center shadow-2xl transition-all duration-300 hover:shadow-spotify-green/20">
        <div className="flex justify-center mb-6">
          <Music2 className="w-16 h-16 text-spotify-green" />
        </div>
        <h1 className="text-2xl font-bold text-spotify-green mb-4 tracking-tight">Party Mix Master</h1>
        <p className="text-dark-text mb-8">
          Create the perfect playlist for your party with our smart music recommendation system.
        </p>
        <div className="relative group inline-block">
          <div className="absolute -inset-0.5 bg-spotify-green/20 rounded-lg opacity-50 group-hover:opacity-75 transition duration-300 blur"></div>
          <a
            href={loginUrl}
            className="relative inline-flex items-center justify-center px-6 py-3 bg-dark-bg border border-dark-highlight rounded-lg text-base font-medium text-spotify-green hover:text-spotify-green/90 transition-colors duration-200"
          >
            Connect with Spotify
          </a>
        </div>
      </div>
    </div>
  );
}
