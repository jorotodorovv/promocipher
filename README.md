# PromoCipher - Secure Promo Code Management

PromoCipher is a web application designed to securely store and manage your promotional codes. It uses end-to-end encryption to ensure that your sensitive promo code information is kept private, accessible only by you.

The core principle of PromoCipher is "zero-knowledge." The server and database have no knowledge of your master password or the contents of your encrypted data. All encryption and decryption happen on the client-side in your browser.

## Key Features

*   **End-to-End Encryption:** All promo code data is encrypted in the browser before being sent to the server.
*   **Master Password:** A single, strong master password is used to derive the encryption key. **This password is never stored or transmitted.**
*   **Secure Vault:** Store details for each promo code, including the code itself, its value/discount, expiration date, and associated website.
*   **Dashboard Analytics:** Get a quick overview of your active, expired, and used codes.
*   **Built with Modern Tech:** A fast, responsive, and modern UI built with React, Vite, and Tailwind CSS.
*   **Supabase Backend:** Leverages Supabase for database storage, authentication, and user management.

## How It Works: The Encryption Model

Security is the most critical aspect of PromoCipher. Here’s a breakdown of how the encryption and decryption flow works:

1.  **User Registration:** When a user signs up, a unique cryptographic "salt" is generated and stored in the database. This salt is public and tied to the user.
2.  **Master Password:** The user chooses a master password. This password is **never** sent to the server.
3.  **Key Derivation:** When the user logs in, their master password and their unique salt are fed into the **Argon2id** key derivation function (using `libsodium-wrappers-sumo`). This process is computationally intensive, making it highly resistant to brute-force attacks. The output is a strong, 256-bit encryption key.
4.  **Encryption:** When a user saves a promo code, the data is encrypted locally in the browser using the derived key with the **XChaCha20-Poly1305** symmetric cipher. The resulting ciphertext is what gets stored in the database.
5.  **Decryption:** When a user wants to view their codes, the encrypted data is fetched from the server. The user enters their master password, the same key is derived again locally, and the data is decrypted in the browser.

This model ensures that without the master password, the data stored in the database is just unintelligible ciphertext.

## Technology Stack

*   **Frontend:**
    *   **Framework:** React
    *   **Build Tool:** Vite
    *   **Language:** TypeScript
    *   **Styling:** Tailwind CSS
    *   **Data Fetching:** TanStack React Query
    *   **Animation:** Framer Motion
*   **Backend:**
    *   **Platform:** Supabase
    *   **Database:** PostgreSQL
    *   **Auth:** Supabase Auth
*   **Encryption:**
    *   **Library:** `libsodium-wrappers-sumo`
    *   **Key Derivation:** Argon2id
    *   **Symmetric Cipher:** XChaCha20-Poly1305

## Getting Started

Follow these instructions to get a local instance of PromoCipher up and running.

### Prerequisites

*   Node.js (v18 or later)
*   npm or your preferred package manager
*   [Supabase CLI](https://supabase.com/docs/guides/cli)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd promocipher
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Supabase

1.  **Log in to Supabase:**
    ```bash
    supabase login
    ```

2.  **Link Your Project:**
    Create a new project in your Supabase dashboard and link it to your local environment.
    ```bash
    supabase link --project-ref <your-project-ref>
    ```

3.  **Push Database Migrations:**
    The required database schema is defined in the `supabase/migrations` directory. Push them to your Supabase project.
    ```bash
    supabase db push
    ```

### 4. Configure Environment Variables

1.  Create a `.env` file in the root of the project by copying the example file.
    ```bash
    cp .env.example .env
    ```

2.  **Get Your Project URL and Anon Key:**
    Find these in your Supabase project dashboard under `Project Settings > API`.

3.  **Populate `.env`:**
    Add your Supabase URL and anon key to the `.env` file.
    ```
    VITE_SUPABASE_URL="your-supabase-url"
    VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
    ```

### 5. Run the Development Server

You are now ready to start the application.

```bash
npm run dev
```

The application should be running at `http://localhost:5173`.

## Project Structure

*   `supabase/migrations/`: Contains the SQL files for the database schema.
*   `src/`: The main source code for the React application.
    *   `components/`: Reusable UI components.
    *   `contexts/`: React contexts for managing global state (Auth, Encryption).
    *   `hooks/`: Custom hooks for business logic and data fetching.
    *   `pages/`: Top-level page components.
    *   `services/`: Modules for interacting with backend services (Supabase).
    *   `utils/`: Utility functions, including the core crypto logic in `crypto.ts`.