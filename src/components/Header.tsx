import { useState } from 'react';
import { Menu, X, Music2, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onLogout: () => void;
  userEmail?: string;
  isAuthenticated: boolean;
}

export function Header({ onLogout, userEmail, isAuthenticated }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="bg-dark-surface border-b border-dark-highlight">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Music2 className="h-8 w-8 text-spotify-green" />
              <span className="ml-2 text-xl font-display font-semibold text-spotify-green">Party Mix</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            {isAuthenticated ? (
              <>
                {/* User Profile */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 text-dark-text hover:text-spotify-green transition-colors font-medium"
                  >
                    <span className="font-sans">{userEmail}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-dark-bg border border-dark-highlight">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onLogout();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm font-medium text-dark-text hover:bg-dark-surface hover:text-spotify-green transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-dark-text hover:text-spotify-green hover:bg-dark-surface transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 text-dark-text">{userEmail}</div>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-dark-text hover:bg-dark-surface hover:text-spotify-green transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
