"use client";

import { useState, useEffect } from 'react';
import { getEnvApiMode } from '@/lib/utils/apiMode';

/**
 * Custom hook to monitor and update the API mode setting
 * @returns Current API mode and toggle function
 */
export function useApiMode() {
  const [isUsingRealApis, setIsUsingRealApis] = useState<boolean>(false);
  
  // Initialize on client-side only
  useEffect(() => {
    // Check localStorage first (client-side only)
    const localStorageValue = localStorage.getItem('showreel_use_real_apis');
    if (localStorageValue === 'true') {
      setIsUsingRealApis(true);
    } else if (localStorageValue === 'false') {
      setIsUsingRealApis(false);
    } else {
      // Fall back to environment variable
      const envValue = getEnvApiMode();
      setIsUsingRealApis(envValue);
      localStorage.setItem('showreel_use_real_apis', envValue.toString());
    }
    
    // Listen for changes to localStorage from other components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'showreel_use_real_apis') {
        setIsUsingRealApis(e.newValue === 'true');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Toggle API mode
  const toggleApiMode = () => {
    const newValue = !isUsingRealApis;
    setIsUsingRealApis(newValue);
    localStorage.setItem('showreel_use_real_apis', newValue.toString());
  };
  
  return {
    isUsingRealApis,
    toggleApiMode
  };
}