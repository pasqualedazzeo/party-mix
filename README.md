# Party Mix 🎵

A modern web application for creating personalized Spotify playlists with advanced filtering capabilities.

## Features

- **Spotify Integration**: Seamless authentication and playback control with Spotify
- **Advanced Track Filtering**: Search and filter tracks by:
  - Artist
  - Genre
  - Year range
- **Real-time Search**: Dynamic track searching with debounced queries
- **Playlist Management**: Create and manage custom playlists directly in the app
- **Web Playback**: Built-in music player for instant track previews

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: TailwindCSS
- **Build Tool**: Vite
- **Dependencies**:
  - react-datepicker: For year range selection
  - lucide-react: For modern icons

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Development Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## Project Structure

```
party-mix/
├── src/
│   ├── components/     # React components
│   ├── utils/         # Utility functions
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── public/            # Static assets
└── ...config files    # Various configuration files
```

## Contributing

Feel free to submit issues and pull requests for new features or improvements.
