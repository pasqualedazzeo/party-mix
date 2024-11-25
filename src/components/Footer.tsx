import { Github, Mail, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-surface mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Branding */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-spotify-green">Party Mix</h3>
            <p className="text-dark-text/70 text-sm">
              Create the perfect playlist for your party with our smart music recommendation system.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-spotify-green">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <a href="#about" className="text-dark-text/70 hover:text-spotify-green transition-colors text-sm">
                About
              </a>
              <a href="#privacy" className="text-dark-text/70 hover:text-spotify-green transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#terms" className="text-dark-text/70 hover:text-spotify-green transition-colors text-sm">
                Terms of Service
              </a>
              <a href="#contact" className="text-dark-text/70 hover:text-spotify-green transition-colors text-sm">
                Contact
              </a>
            </nav>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-spotify-green">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com/pasqualedazzeo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-text/70 hover:text-spotify-green transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="mailto:pasquale.dazzeo98@gmail.com"
                className="text-dark-text/70 hover:text-spotify-green transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-dark-highlight">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-dark-text/70 text-sm">
              {currentYear} Party Mix. All rights reserved.
            </p>
            <p className="text-dark-text/70 text-sm flex items-center">
              Made with <Heart className="w-4 h-4 text-spotify-green mx-1" /> by Party Mix Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
