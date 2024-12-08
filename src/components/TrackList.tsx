import { Play, Plus, Pause } from 'lucide-react';
import type { Track } from '../types';

interface TrackListProps {
  tracks: Track[];
  onAddToPlaylist: (track: Track) => void;
  currentlyPlaying: string | null;
  onPlayPreview: (trackId: string) => void;
}

export function TrackList({ tracks, onAddToPlaylist, currentlyPlaying, onPlayPreview }: TrackListProps) {
  if (tracks.length === 0) {
    return (
      <div className="text-center text-dark-text py-4">
        No tracks found. Try adjusting your search filters.
      </div>
    );
  }

  return (
    <div className="bg-dark-surface rounded-lg shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className="bg-dark-highlight">
            <tr>
              <th className="w-[45%] px-2 py-2 text-left text-xs font-medium text-spotify-green uppercase tracking-wider">Track</th>
              <th className="w-[35%] px-2 py-2 text-left text-xs font-medium text-spotify-green uppercase tracking-wider hidden md:table-cell">Artist</th>
              <th className="w-[20%] px-2 py-2 text-right text-xs font-medium text-spotify-green uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-dark-surface divide-y divide-dark-highlight">
            {tracks.map((track) => (
              <tr key={track.id} className="hover:bg-dark-highlight transition-colors">
                <td className="px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <img className="h-8 w-8 rounded-sm flex-shrink-0" src={track.imageUrl} alt={track.title} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-dark-text truncate">{track.title}</div>
                      <div className="text-xs text-dark-text/70 truncate">{track.artist}</div>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-1.5 hidden md:table-cell">
                  <div className="text-sm text-dark-text truncate">{track.artist}</div>
                  <div className="text-xs text-dark-text/70 truncate">{track.album}</div>
                </td>
                <td className="px-2 py-1.5">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onPlayPreview(track.id)}
                      className="text-spotify-green hover:opacity-80 transition-opacity p-1"
                      title="Play"
                    >
                      {currentlyPlaying === track.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onAddToPlaylist(track)}
                      className="text-spotify-green hover:opacity-80 transition-opacity p-1"
                      title="Add to playlist"
                    >
                      <Plus className="w-4 h-4" />
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
