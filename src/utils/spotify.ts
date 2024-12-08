const CLIENT_ID = '631760a2d11844e49fe654a07a2c495e';
const CLIENT_SECRET = '39b8e83710cf4ee7b128fcd58f1ded67';
const REDIRECT_URI = 'http://localhost:5173/callback';
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

export const loginUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPES)}`;

async function getTokenFromCode(code: string): Promise<string> {
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', REDIRECT_URI);
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Token exchange failed:', errorData);
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Token exchange error:', error);
    throw error;
  }
}

export async function getAccessToken(): Promise<string | null> {
  const storedToken = localStorage.getItem('spotify_token');
  if (storedToken) {
    return storedToken;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');

  if (error) {
    console.error('Authorization error:', error);
    return null;
  }

  if (code) {
    try {
      const token = await getTokenFromCode(code);
      if (token) {
        localStorage.setItem('spotify_token', token);
        // Clean up the URL
        window.history.replaceState({}, document.title, '/');
        return token;
      }
    } catch (error) {
      console.error('Error getting token:', error);
      // Clear any existing token if exchange fails
      localStorage.removeItem('spotify_token');
    }
  }

  return null;
}

export async function searchTracks(filters: any, token: string) {
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
      if (response.status === 401) {
        localStorage.removeItem('spotify_token');
        window.location.href = '/';
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
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
    console.error('Error searching tracks:', error);
    return [];
  }
}

export async function createPlaylist(token: string, userId: string, name: string, tracks: string[]) {
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

    return playlist;
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }
}

export async function getCurrentUser(token: string) {
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

    return response.json();
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

function msToMinutesAndSeconds(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
}
