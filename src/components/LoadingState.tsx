import { Music2 } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="fixed inset-0 bg-dark-bg bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <Music2 className="w-16 h-16 text-spotify-green animate-bounce mx-auto mb-4" />
        <div className="text-dark-text text-lg">
          Connecting to Spotify...
        </div>
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-spotify-green rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-spotify-green rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
            <div className="w-2 h-2 bg-spotify-green rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
