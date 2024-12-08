import { Play, Pause, X, Edit2, Save } from 'lucide-react';
import { useState } from 'react';
import type { Track } from '../types';

interface PlaylistViewProps {
  tracks: Track[];
  currentlyPlaying: string | null;
  onPlayPreview: (trackId: string) => void;
  onRemoveTrack: (trackId: string) => void;
  onSavePlaylist: () => void;
  onUpdatePlaylistName: (name: string) => void;
  playlistName: string;
}

export function PlaylistView({
  tracks,
  currentlyPlaying,
  onPlayPreview,
  onRemoveTrack,
  onSavePlaylist,
  onUpdatePlaylistName,
  playlistName
}: PlaylistViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(playlistName);

  const handleSaveName = () => {
    onUpdatePlaylistName(editedName);
    setIsEditing(false);
  };

  if (tracks.length === 0) {
    return (
      <div className="bg-dark-surface rounded-lg p-8 text-center">
        <div className="text-dark-text/70 mb-4">Add some songs to your playlist</div>
      </div>
    );
  }

  return (
    <div className="bg-dark-surface rounded-lg shadow-lg">
      <div className="p-4 border-b border-dark-highlight flex items-center justify-between">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="bg-dark-bg px-3 py-1.5 rounded-lg text-dark-text focus:outline-none focus:ring-2 focus:ring-spotify-green/50"
              placeholder="Playlist name"
            />
            <button
              onClick={handleSaveName}
              className="text-spotify-green hover:opacity-80 transition-opacity p-1"
              title="Save playlist name"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-dark-text">{playlistName}</h3>
            <button
              onClick={() => setIsEditing(true)}
              className="text-spotify-green hover:opacity-80 transition-opacity p-1"
              title="Edit playlist name"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        )}
        <button
          onClick={onSavePlaylist}
          className="px-4 py-2 bg-spotify-green text-dark-bg rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
        >
          Save to Spotify
        </button>
      </div>
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
                      onClick={() => onRemoveTrack(track.id)}
                      className="text-spotify-green hover:opacity-80 transition-opacity p-1"
                      title="Remove from playlist"
                    >
                      <X className="w-4 h-4" />
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
