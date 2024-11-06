import React from 'react';
import { Play, Plus, Pause } from 'lucide-react';
import type { Track } from '../types';

interface TrackListProps {
  tracks: Track[];
  onAddToPlaylist: (track: Track) => void;
  currentlyPlaying: string | null;
  onPlayPreview: (trackId: string) => void;
}

export function TrackList({ tracks, onAddToPlaylist, currentlyPlaying, onPlayPreview }: TrackListProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Track</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Album</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tracks.map((track) => (
              <tr key={track.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img className="h-10 w-10 rounded-sm" src={track.imageUrl} alt={track.title} />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{track.title}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{track.artist}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{track.album}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {track.duration}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={() => onPlayPreview(track.id)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      {currentlyPlaying === track.id ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => onAddToPlaylist(track)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}