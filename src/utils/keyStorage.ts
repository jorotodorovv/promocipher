import localforage from 'localforage';

// Configure localforage for PromoCipher key storage
const keyStore = localforage.createInstance({
  name: 'PromoCipher',
  storeName: 'encryptionKeys',
  version: 1.0,
  description: 'Secure storage for PromoCipher encryption keys'
});

// Key names for storage
const DERIVED_KEY_NAME = 'derivedKey';
const REMEMBER_ME_PREFERENCE = 'rememberMeEnabled';

/**
 * Store the derived encryption key in IndexedDB
 * WARNING: This compromises zero-knowledge security for convenience
 */
export async function storeDerivedKey(key: Uint8Array): Promise<void> {
  try {
    await keyStore.setItem(DERIVED_KEY_NAME, key);
    await keyStore.setItem(REMEMBER_ME_PREFERENCE, true);
  } catch (error) {
    console.error('Failed to store derived key:', error);
    throw new Error('Failed to store encryption key locally');
  }
}

/**
 * Retrieve the stored derived encryption key from IndexedDB
 */
export async function getStoredDerivedKey(): Promise<Uint8Array | null> {
  try {
    const key = await keyStore.getItem<Uint8Array>(DERIVED_KEY_NAME);
    return key || null;
  } catch (error) {
    console.error('Failed to retrieve stored key:', error);
    return null;
  }
}

/**
 * Clear the stored derived key and remember preference
 */
export async function clearStoredDerivedKey(): Promise<void> {
  try {
    await keyStore.removeItem(DERIVED_KEY_NAME);
    await keyStore.removeItem(REMEMBER_ME_PREFERENCE);
  } catch (error) {
    console.error('Failed to clear stored key:', error);
    // Don't throw here - clearing should be forgiving
  }
}

/**
 * Check if remember me is currently enabled
 */
export async function isRememberMeEnabled(): Promise<boolean> {
  try {
    const enabled = await keyStore.getItem<boolean>(REMEMBER_ME_PREFERENCE);
    return enabled === true;
  } catch (error) {
    console.error('Failed to check remember me status:', error);
    return false;
  }
}

/**
 * Clear all stored data (for complete reset)
 */
export async function clearAllStoredData(): Promise<void> {
  try {
    await keyStore.clear();
  } catch (error) {
    console.error('Failed to clear all stored data:', error);
  }
}