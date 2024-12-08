import React, { useEffect } from 'react';
import { Music, Radio, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
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

  const handleYearChange = (date: Date | null, name: string) => {
    if (date) {
      const currentYear = new Date().getFullYear();
      const newYear = date.getFullYear();
      const startYear = parseInt(filters.yearStart || currentYear.toString());
      const endYear = parseInt(filters.yearEnd || currentYear.toString());

      // Basic validation
      if (name === 'yearStart') {
        // Start year can't be greater than end year
        if (newYear > endYear) {
          onFilterChange({
            ...filters,
            yearStart: endYear.toString()
          });
          return;
        }
      } else if (name === 'yearEnd') {
        // End year can't be less than start year
        if (newYear < startYear) {
          onFilterChange({
            ...filters,
            yearEnd: startYear.toString()
          });
          return;
        }
      }

      // If validation passes, update the year
      onFilterChange({
        ...filters,
        [name]: newYear.toString()
      });
    }
  };

  // Set initial years on component mount
  useEffect(() => {
    if (!filters.yearStart && !filters.yearEnd) {
      const currentYear = new Date().getFullYear();
      onFilterChange({
        ...filters,
        yearStart: (currentYear - 10).toString(), // Default to 10 years ago
        yearEnd: currentYear.toString()
      });
    }
  }, []);

  // Helper function to create a Date object from year string
  const getDateFromYear = (year: string | undefined) => {
    if (!year) return new Date();
    return new Date(parseInt(year), 0, 1);
  };

  return (
    <div className="bg-dark-surface rounded-xl p-6 shadow-xl hover:shadow-spotify-green/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-spotify-green to-green-400 bg-clip-text text-transparent">
          Customize Your Playlist
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-spotify-green to-green-400 rounded-lg opacity-50 group-hover:opacity-100 blur transition duration-300"></div>
          <div className="relative flex items-center bg-dark-bg border border-dark-highlight rounded-lg h-12 overflow-hidden">
            <Music className="w-5 h-5 text-spotify-green opacity-70 group-hover:opacity-100 transition ml-4" />
            <input
              type="text"
              name="artist"
              placeholder="Artist name"
              className="w-full px-4 py-2 bg-transparent focus:outline-none text-dark-text placeholder-dark-text/50 text-sm"
              value={filters.artist}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-spotify-green to-green-400 rounded-lg opacity-50 group-hover:opacity-100 blur transition duration-300"></div>
          <div className="relative flex items-center bg-dark-bg border border-dark-highlight rounded-lg h-12 overflow-hidden">
            <Radio className="w-5 h-5 text-spotify-green opacity-70 group-hover:opacity-100 transition ml-4" />
            <select
              name="genre"
              className="w-full px-4 py-2 bg-transparent focus:outline-none text-dark-text text-sm appearance-none cursor-pointer"
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

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-spotify-green to-green-400 rounded-lg opacity-50 group-hover:opacity-100 blur transition duration-300"></div>
          <div className="relative flex items-center bg-dark-bg border border-dark-highlight rounded-lg h-12 overflow-visible">
            <Calendar className="w-5 h-5 text-spotify-green opacity-70 group-hover:opacity-100 transition ml-4" />
            <div className="flex items-center gap-4 px-4 w-full">
              <div className="relative flex-1">
                <DatePicker
                  selected={getDateFromYear(filters.yearStart)}
                  onChange={(date) => handleYearChange(date, 'yearStart')}
                  dateFormat="yyyy"
                  showYearPicker
                  yearItemNumber={16}
                  minDate={new Date(1900, 0, 1)}
                  maxDate={new Date()}
                  className="w-full px-4 py-2 bg-transparent focus:outline-none text-dark-text text-sm text-center cursor-pointer"
                  popperClassName="year-picker-popper"
                  popperPlacement="bottom-start"
                  shouldCloseOnSelect={true}
                  showPopperArrow={false}
                />
              </div>
              <span className="text-dark-text/50">-</span>
              <div className="relative flex-1">
                <DatePicker
                  selected={getDateFromYear(filters.yearEnd)}
                  onChange={(date) => handleYearChange(date, 'yearEnd')}
                  dateFormat="yyyy"
                  showYearPicker
                  yearItemNumber={16}
                  minDate={getDateFromYear(filters.yearStart)}
                  maxDate={new Date()}
                  className="w-full px-4 py-2 bg-transparent focus:outline-none text-dark-text text-sm text-center cursor-pointer"
                  popperClassName="year-picker-popper"
                  popperPlacement="bottom-start"
                  shouldCloseOnSelect={true}
                  showPopperArrow={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
