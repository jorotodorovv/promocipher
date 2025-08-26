# PromoCipher Project Overview

PromoCipher is a secure, zero-knowledge web application for storing and managing promotional codes. It uses client-side encryption to ensure that promo codes are encrypted before being stored on the server, and the encryption key never leaves the user's device.

## Technologies Used

- **Frontend Framework:** React with TypeScript
- **State Management:** React Context API and TanStack Query (React Query)
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **Authentication:** Supabase Auth
- **Database:** Supabase (PostgreSQL)
- **Encryption:** libsodium-wrappers-sumo (XChaCha20-Poly1305 for encryption, Argon2id for key derivation)
- **Storage:** localForage (IndexedDB) for storing encryption keys when "Remember Me" is enabled

## Project Structure

- `src/App.tsx`: Main application component handling authentication state and routing between landing page and dashboard
- `src/main.tsx`: Entry point, initializes crypto library and React providers
- `src/pages/DashboardPage.tsx`: Main dashboard UI for managing promo codes
- `src/components/`: UI components including dashboard-specific components in `dashboard/` and generic UI components in `ui/`
- `src/contexts/`: React context providers for authentication (`AuthContext.tsx`) and encryption (`EncryptionContext.tsx`)
- `src/services/`: Services for interacting with Supabase (auth, database)
- `src/utils/`: Utility functions for cryptography (`crypto.ts`), key storage (`keyStorage.ts`), and dashboard statistics (`dashboardStats.ts`)
- `src/hooks/`: Custom React hooks, including TanStack Query hooks for data fetching (`usePromoCodeQueries.ts`)
- `src/types/`: TypeScript type definitions

## Core Functionality

1. **User Authentication:** Users can sign in with OAuth providers (Google, GitHub, etc.) via Supabase Auth.
2. **Master Password:** After authentication, users must enter a master password which is used to derive an encryption key.
3. **Encryption:** Promo codes are encrypted client-side using XChaCha20-Poly1305 before being sent to the server. The encryption key is derived using Argon2id.
4. **Storage:** Encrypted promo codes and their metadata are stored in Supabase. The encryption key can optionally be stored in the browser using localForage (IndexedDB) if the user enables "Remember Me".
5. **Dashboard:** Users can view, add, edit, delete, search, and filter their promo codes. Codes are decrypted on-demand when revealed.

## Key Security Features

- **Zero-Knowledge Architecture:** The server cannot see the user's promo codes as they are encrypted client-side.
- **Strong Encryption:** Uses XChaCha20-Poly1305 for authenticated encryption and Argon2id for key derivation.
- **Additional Authenticated Data (AAD):** User ID and promo code ID are used as AAD to prevent tampering and context misuse.
- **Secure Key Storage Option:** When "Remember Me" is used, the key is stored in IndexedDB, but this is presented as a security trade-off to the user.

## Development Conventions

- **Component Structure:** Components are organized by feature (e.g., dashboard components) or type (e.g., UI components).
- **State Management:** React Context API is used for global state (auth, encryption), while local component state and TanStack Query are used for UI and data fetching state.
- **Data Fetching:** TanStack Query is used for server state management with infinite scrolling pagination.
- **Styling:** Tailwind CSS is used for styling with a consistent design system.
- **Type Safety:** TypeScript is used throughout the project for type safety.

## Building and Running

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Build for production: `npm run build`
4. Preview production build: `npm run preview`
5. Lint code: `npm run lint`

These commands are defined in `package.json`.