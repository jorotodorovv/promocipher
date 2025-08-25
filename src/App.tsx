import { useState } from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './contexts/AuthContext';
import { useEncryption } from './contexts/EncryptionContext';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import MasterPasswordInput from './components/MasterPasswordInput';
import DashboardPage from './pages/DashboardPage';
import LandingHero from './components/LandingHero';
import TerminalSection from './components/TerminalSection';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Security from './components/Security';
import Pricing from './components/Pricing';
import CTA from './components/CTA';
import Footer from './components/Footer';

function App() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading } = useAuth();
  const { hasCheckedStoredKey, hasExistingSalt, isLoadingSalt, derivedKey, isKeyDeriving, keyDerivationError, deriveEncryptionKey, clearEncryptionKey } = useEncryption();

  const handleDashboardAccess = () => {
    if (!user) {
      setShowAuthModal(true);
    }
    // If user is already authenticated, they'll see the dashboard anyway
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };



  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-bright rounded-lg mb-4 animate-pulse-glow">
              <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>
            <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium">
              Loading PromoCipher...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      {/* Authentication Modal - only show when user tries to access dashboard */}
      <AuthModal isOpen={showAuthModal && !user} onClose={closeAuthModal} />
      
      <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-500">
        {/* Only show header when user is fully authenticated and has derived key */}
        {user && derivedKey && (
          <Header darkMode={isDarkMode} onToggleDarkMode={toggleTheme} user={user} />
        )}
        
        {user ? (
          /* Check if user has derived encryption key */
          derivedKey ? (
            /* Fully authenticated user with encryption key */
            <DashboardPage />
          ) : hasCheckedStoredKey ? (
            /* Check if we're still loading salt information */
            isLoadingSalt ? (
              /* Loading state - checking for user salt */
              <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-bright rounded-lg mb-4 animate-pulse-glow">
                    <ShieldCheckIcon className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium">
                    Checking for existing master password...
                  </p>
                </div>
              </div>
            ) : (
              /* User is authenticated but needs to provide master password */
              <MasterPasswordInput
                hasExistingSalt={hasExistingSalt}
                onPasswordSubmit={deriveEncryptionKey}
                isLoading={isKeyDeriving}
                error={keyDerivationError}
                onResetPassword={clearEncryptionKey}
              />
            )
          ) : (
            /* Loading state - checking for stored credentials */
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-bright rounded-lg mb-4 animate-pulse-glow">
                  <ShieldCheckIcon className="w-8 h-8 text-white" />
                </div>
                <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium">
                  Checking for stored credentials...
                </p>
              </div>
            </div>
          )
        ) : (
          /* Public Landing Page */
          <>
            <Header darkMode={isDarkMode} onToggleDarkMode={toggleTheme} user={user} />
            <LandingHero onDashboardAccess={handleDashboardAccess} />
            <TerminalSection />
            <Features />
            <HowItWorks />
            <CTA onDashboardAccess={handleDashboardAccess} />
            <Footer />
          </>
        )}
      </div>
    </div>
  );
}

export default App;