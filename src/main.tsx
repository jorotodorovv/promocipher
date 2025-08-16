import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { EncryptionProvider } from './contexts/EncryptionContext';
import { PromoCodeProvider } from './contexts/PromoCodeContext';
import { initializeCrypto } from './utils/crypto';
import './index.css';

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
