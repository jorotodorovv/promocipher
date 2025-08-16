import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { EncryptionProvider } from './contexts/EncryptionContext';
import { PromoCodeProvider } from './contexts/PromoCodeContext';
import { initializeCrypto } from './utils/crypto';
import './index.css';

// Prevent flash of unstyled content by applying initial theme before React renders
(() => {
  if (typeof window === 'undefined') return;
  
  const THEME_STORAGE_KEY = 'promocipher-theme';
  const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const initialTheme = storedTheme || getSystemTheme();
  
  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
})();

// Initialize crypto and then render the app
initializeCrypto().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AuthProvider>
        <EncryptionProvider>
          <PromoCodeProvider>
            <App />
          </PromoCodeProvider>
        </EncryptionProvider>
      </AuthProvider>
    </StrictMode>
  );
});
