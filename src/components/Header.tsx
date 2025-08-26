import React, { useState } from 'react';
import { MoonIcon, SunIcon, Bars3Icon, XMarkIcon, ArrowLeftOnRectangleIcon, UserIcon } from '@heroicons/react/24/solid';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useAuth } from '../contexts/AuthContext';
import { smoothScrollTo } from '../utils/scrollUtils';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  user: SupabaseUser | null;
}

const Header: React.FC<HeaderProps> = ({ darkMode, onToggleDarkMode, user }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary-deep shadow-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <h1 className="font-pixel text-white text-sm uppercase tracking-wider">
              PromoCipher
            </h1>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Desktop Navigation - Only show when user is not logged in */}
            {!user && (
              <nav className="hidden md:flex items-center space-x-8">
                <button 
                  onClick={() => smoothScrollTo('terminal')} 
                  className="text-white hover:text-primary-bright font-sans font-medium"
                >
                  Security
                </button>
                <button 
                  onClick={() => smoothScrollTo('features')} 
                  className="text-white hover:text-primary-bright font-sans font-medium"
                >
                  Features
                </button>
                <button 
                  onClick={() => smoothScrollTo('how-it-works')} 
                  className="text-white hover:text-primary-bright font-sans font-medium"
                >
                  How It Works
                </button>
              </nav>
            )}

            {/* User Info & Logout */}
            {user && (
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-white">
                  <UserIcon className="w-4 h-4" />
                  <span className="font-sans text-small">
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded hover:bg-white/10"
                  title="Sign out"
                >
                  <ArrowLeftOnRectangleIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            )}

            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded hover:bg-white/10"
            >
              {darkMode ? (
                <SunIcon className="w-5 h-5 text-white" />
              ) : (
                <MoonIcon className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Mobile menu button - Only show when user is not logged in */}
            {!user && (
              <button
                className="md:hidden p-2 rounded hover:bg-white/10"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6 text-white" />
                ) : (
                  <Bars3Icon className="w-6 h-6 text-white" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Only show when user is not logged in */}
        {mobileMenuOpen && !user && (
          <div className="md:hidden bg-primary-deep border-t border-white/20 animate-slide-up">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button 
                onClick={() => { smoothScrollTo('terminal'); setMobileMenuOpen(false); }} 
                className="block w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded"
              >
                Terminal
              </button>
              <button 
                onClick={() => { smoothScrollTo('features'); setMobileMenuOpen(false); }} 
                className="block w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded"
              >
                Features
              </button>
              <button 
                onClick={() => { smoothScrollTo('how-it-works'); setMobileMenuOpen(false); }} 
                className="block w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded"
              >
                How It Works
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;