import React from 'react';
import { Slider } from './Slider';
import { Music, Gauge, Trophy, Radio } from 'lucide-react';

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
    <div className="bg-white rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Fine-tune Your Mix</h2>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Music className="w-5 h-5 text-purple-500" />
          <input
            type="text"
            name="artist"
            placeholder="Artist name"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={filters.artist}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex items-center space-x-3">
          <Radio className="w-5 h-5 text-purple-500" />
          <select
            name="genre"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={filters.genre}
            onChange={handleInputChange}
          >
            <option value="">Select Genre</option>
            <option value="pop">Pop</option>
            <option value="rock">Rock</option>
            <option value="hip-hop">Hip Hop</option>
            <option value="electronic">Electronic</option>
            <option value="latin">Latin</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            name="yearStart"
            placeholder="From Year"
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={filters.yearStart}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="yearEnd"
            placeholder="To Year"
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={filters.yearEnd}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Gauge className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Tempo (BPM)</span>
              </div>
              <span className="text-sm text-gray-500">{filters.tempo}</span>
            </div>
            <Slider
              name="tempo"
              min={60}
              max={200}
              value={filters.tempo}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Popularity</span>
              </div>
              <span className="text-sm text-gray-500">{filters.popularity}%</span>
            </div>
            <Slider
              name="popularity"
              min={0}
              max={100}
              value={filters.popularity}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}