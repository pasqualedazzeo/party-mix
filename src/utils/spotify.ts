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
  'streaming'
].join(' ');

export const loginUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPES)}`;

async function getTokenFromCode(code: string): Promise<string> {
  const basicAuth = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get access token');
  }

  const data = await response.json();
  return data.access_token;
}

export async function getAccessToken(): Promise<string | null> {
  const storedToken = localStorage.getItem('spotify_token');
  if (storedToken) {
    return storedToken;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (code) {
    try {
      const token = await getTokenFromCode(code);
      localStorage.setItem('spotify_token', token);
      // Clean up the URL
      window.history.replaceState({}, document.title, '/');
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  return null;
}

// Rest of the file remains unchanged
export async function searchTracks(query: string, filters: any, token: string) {
  try {
    const params = new URLSearchParams({
      q: query,
      type: 'track',
      limit: '20'
    });

    if (filters.yearStart && filters.yearEnd) {
      params.append('q', ` year:${filters.yearStart}-${filters.yearEnd}`);
    }
    if (filters.genre) {
      params.append('q', ` genre:${filters.genre}`);
    }

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
      imageUrl: track.album.images[0]?.url
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