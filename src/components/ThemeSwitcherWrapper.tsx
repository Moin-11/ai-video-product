"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";

export default function ThemeSwitcherWrapper() {
  const [mounted, setMounted] = useState(false);
  
  // Only mount the theme switcher on the client side after DOM is ready
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't render anything on the server
  if (!mounted) return null;
  
  // Find the container after the component mounts
  const container = document.getElementById("theme-switcher-container");
  
  // Only render if the container exists
  if (!container) return null;
  
  // Use createPortal to render ThemeSwitcher into the container
  return createPortal(<ThemeSwitcher />, container);
}