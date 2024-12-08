const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

const SCOPES = [
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-private',
  'user-read-email',
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing'
].join(' ');

// Logging utility to maintain consistent format
const logSpotify = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[Spotify ${timestamp}] ${message}`, data || '');
};

// Check environment variables on module initialization
if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
  logSpotify('Missing required environment variables:', {
    hasClientId: !!CLIENT_ID,
    hasClientSecret: !!CLIENT_SECRET,
    hasRedirectUri: !!REDIRECT_URI
  });
}

logSpotify('Initialized with redirect URI', { redirectUri: REDIRECT_URI });

export const loginUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPES)}`;

async function getTokenFromCode(code: string): Promise<string> {
  logSpotify('Attempting to exchange code for token');
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', REDIRECT_URI);
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);

  try {
    logSpotify('Making token exchange request');
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    });

    if (!response.ok) {
      const errorData = await response.text();
      logSpotify('Token exchange failed', { status: response.status, error: errorData });
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logSpotify('Successfully obtained access token');
    return data.access_token;
  } catch (error) {
    logSpotify('Token exchange error', error);
    throw error;
  }
}

export async function getAccessToken(): Promise<string | null> {
  logSpotify('Checking for existing token');
  const storedToken = localStorage.getItem('spotify_token');
  if (storedToken) {
    logSpotify('Found existing token');
    return storedToken;
  }

  logSpotify('No existing token found, checking URL parameters');
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');

  if (error) {
    logSpotify('Authorization error from Spotify', error);
    return null;
  }

  if (code) {
    logSpotify('Found authorization code, exchanging for token');
    try {
      const token = await getTokenFromCode(code);
      if (token) {
        logSpotify('Successfully obtained and stored new token');
        localStorage.setItem('spotify_token', token);
        window.history.replaceState({}, document.title, '/');
        return token;
      }
    } catch (error) {
      logSpotify('Failed to exchange code for token', error);
      localStorage.removeItem('spotify_token');
    }
  }

  logSpotify('No valid token or authorization code found');
  return null;
}

export async function searchTracks(filters: any, token: string) {
  logSpotify('Searching tracks with filters', filters);
  try {
    let searchQuery = '';

    // Build search query based on active filters
    if (filters.artist) {
      searchQuery += `artist:${filters.artist} `;
    }
    if (filters.genre) {
      searchQuery += `genre:${filters.genre} `;
    }
    if (filters.yearStart && filters.yearEnd) {
      searchQuery += `year:${filters.yearStart}-${filters.yearEnd} `;
    } else if (filters.yearStart) {
      searchQuery += `year:${filters.yearStart} `;
    } else if (filters.yearEnd) {
      searchQuery += `year:${filters.yearEnd} `;
    }

    // If no filters are active, return empty array
    if (!searchQuery.trim()) {
      return [];
    }

    logSpotify('Built search query', { searchQuery });
    const params = new URLSearchParams({
      q: searchQuery.trim(),
      type: 'track',
      limit: '20'
    });

    const response = await fetch(`https://api.spotify.com/v1/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      logSpotify('Search request failed', { status: response.status });
      throw new Error('Search request failed');
    }

    const data = await response.json();
    logSpotify('Search completed successfully', { trackCount: data.tracks.items.length });
    return data.tracks.items.map((track: any) => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map((artist: any) => artist.name).join(', '),
      album: track.album.name,
      duration: msToMinutesAndSeconds(track.duration_ms),
      popularity: track.popularity,
      previewUrl: track.preview_url,
      imageUrl: track.album.images[0]?.url,
      uri: track.uri
    }));
  } catch (error) {
    logSpotify('Error during track search', error);
    throw error;
  }
}

export async function createPlaylist(token: string, userId: string, name: string, tracks: string[]) {
  logSpotify('Creating playlist with name', { name });
  try {
    const playlist = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description: 'Created with Party Mix Master',
        public: true
      })
    }).then(res => {
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('spotify_token');
          window.location.href = '/';
          throw new Error('Authentication expired');
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });

    logSpotify('Created playlist with id', { id: playlist.id });
    await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uris: tracks.map(id => `spotify:track:${id}`)
      })
    }).then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    });

    logSpotify('Added tracks to playlist');
    return playlist;
  } catch (error) {
    logSpotify('Error creating playlist', error);
    throw error;
  }
}

export async function getCurrentUser(token: string) {
  logSpotify('Getting current user');
  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('spotify_token');
        window.location.href = '/';
        throw new Error('Authentication expired');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    logSpotify('Got current user', { id: data.id });
    return data;
  } catch (error) {
    logSpotify('Error getting user', error);
    throw error;
  }
}

function msToMinutesAndSeconds(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
}
