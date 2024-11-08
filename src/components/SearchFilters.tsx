import React from 'react';
import { Music, Radio, Calendar } from 'lucide-react';
import type { FilterOptions } from '../types';

interface SearchFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="bg-dark-surface rounded-xl p-3 shadow-2xl transition-all duration-300 hover:shadow-spotify-green/20 w-full">
      <h2 className="text-xl font-bold text-spotify-green mb-3 tracking-tight">
        Customize Your Playlist
      </h2>
      
      <div className="flex flex-wrap gap-2">
        <div className="relative group flex-1 min-w-[200px]">
          <div className="absolute -inset-0.5 bg-spotify-green/20 rounded-lg opacity-50 group-hover:opacity-75 transition duration-300 blur"></div>
          <div className="relative flex items-center bg-dark-bg border border-dark-highlight rounded-lg h-9">
            <Music className="w-4 h-4 text-spotify-green opacity-70 group-hover:opacity-100 transition ml-2" />
            <input
              type="text"
              name="artist"
              placeholder="Artist name"
              className="w-full px-2 bg-transparent focus:outline-none text-dark-text placeholder-dark-text/50 text-sm"
              value={filters.artist}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="relative group flex-1 min-w-[200px]">
          <div className="absolute -inset-0.5 bg-spotify-green/20 rounded-lg opacity-50 group-hover:opacity-75 transition duration-300 blur"></div>
          <div className="relative flex items-center bg-dark-bg border border-dark-highlight rounded-lg h-9">
            <Radio className="w-4 h-4 text-spotify-green opacity-70 group-hover:opacity-100 transition ml-2" />
            <select
              name="genre"
              className="w-full px-2 bg-transparent focus:outline-none text-dark-text text-sm appearance-none cursor-pointer"
              value={filters.genre}
              onChange={handleInputChange}
            >
              <option value="" className="bg-dark-bg text-dark-text">Select Genre</option>
              <option value="pop" className="bg-dark-bg text-dark-text">Pop</option>
              <option value="rock" className="bg-dark-bg text-dark-text">Rock</option>
              <option value="hip-hop" className="bg-dark-bg text-dark-text">Hip Hop</option>
              <option value="electronic" className="bg-dark-bg text-dark-text">Electronic</option>
              <option value="latin" className="bg-dark-bg text-dark-text">Latin</option>
            </select>
          </div>
        </div>

        <div className="relative group flex-1 min-w-[200px]">
          <div className="absolute -inset-0.5 bg-spotify-green/20 rounded-lg opacity-50 group-hover:opacity-75 transition duration-300 blur"></div>
          <div className="relative bg-dark-bg border border-dark-highlight rounded-lg h-9">
            <div className="flex items-center px-2 h-full">
              <Calendar className="w-4 h-4 text-spotify-green opacity-70 group-hover:opacity-100 transition flex-shrink-0" />
              <div className="flex items-center gap-1 ml-2 w-full">
                <input
                  type="number"
                  name="yearStart"
                  placeholder="From"
                  className="w-full bg-transparent focus:outline-none text-dark-text placeholder-dark-text/50 text-sm"
                  value={filters.yearStart}
                  onChange={handleInputChange}
                />
                <span className="text-dark-text/50 text-sm">-</span>
                <input
                  type="number"
                  name="yearEnd"
                  placeholder="To"
                  className="w-full bg-transparent focus:outline-none text-dark-text placeholder-dark-text/50 text-sm"
                  value={filters.yearEnd}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
