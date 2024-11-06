import React from 'react';
import { Music2 } from 'lucide-react';
import { loginUrl } from '../utils/spotify';

export function SpotifyLogin() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <Music2 className="w-16 h-16 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Party Mix Master</h1>
        <p className="text-gray-600 mb-8">
          Create the perfect playlist for your party with our smart music recommendation system.
        </p>
        <a
          href={loginUrl}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
        >
          Connect with Spotify
        </a>
      </div>
    </div>
  );
}