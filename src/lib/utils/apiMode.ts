/**
 * Utility to check if we should use real APIs or simulation mode
 * 
 * Priority order:
 * 1. localStorage setting (client-side)
 * 2. Environment variable
 * 3. Default (false = simulation)
 */

// Direct function to read from environment variable
export function getEnvApiMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_REAL_APIS === 'true';
}

// Function that checks localStorage first (for client-side)
export function useRealApis(): boolean {
  // Check localStorage (client-side only)
  if (typeof window !== 'undefined') {
    const localStorageValue = localStorage.getItem('showreel_use_real_apis');
    if (localStorageValue === 'true') return true;
    if (localStorageValue === 'false') return false;
  }
  
  // Fall back to environment variable
  return getEnvApiMode();
}