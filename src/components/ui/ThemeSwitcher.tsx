"use client";

import { useTheme } from "@/context/ThemeContext";
import { themes } from "@/lib/themes";
import { useState } from "react";
import { FiSun, FiMoon, FiChevronDown, FiCheck } from "react-icons/fi";

export default function ThemeSwitcher() {
  const { theme, setThemeId, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-1 p-2 rounded-md hover:bg-[var(--color-neutral-light)] dark:hover:bg-[var(--color-neutral-dark)] transition-colors"
        aria-label="Change theme"
      >
        {theme.isDark ? (
          <FiMoon className="h-5 w-5" />
        ) : (
          <FiSun className="h-5 w-5" />
        )}
        <span className="hidden sm:inline">{theme.name}</span>
        <FiChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={closeDropdown}
          />
          <div className="absolute right-0 mt-2 w-48 py-2 bg-[var(--color-card)] rounded-md shadow-lg z-20 border border-[var(--color-border)]">
            {availableThemes.map((themeId) => (
              <button
                key={themeId}
                onClick={() => {
                  setThemeId(themeId);
                  closeDropdown();
                }}
                className="flex items-center w-full px-4 py-2 text-left hover:bg-[var(--color-neutral-light)] dark:hover:bg-[var(--color-neutral-dark)] transition-colors"
              >
                <span className="flex-1">{themes[themeId].name}</span>
                {theme.id === themeId && (
                  <FiCheck className="h-4 w-4 text-[var(--color-primary)]" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}