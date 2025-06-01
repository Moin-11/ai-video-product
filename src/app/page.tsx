"use client";

import UwearInterface from "@/components/uwear/UwearInterface";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[var(--color-card)] shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-[var(--color-primary)]">Uwear.ai Clone</span>
            <span className="ml-2 text-xs bg-[var(--color-neutral-light)] dark:bg-[var(--color-neutral-dark)] text-[var(--color-neutral-dark)] dark:text-[var(--color-neutral-light)] px-2 py-1 rounded-full">
              v1
            </span>
          </div>
          <div id="theme-switcher-container"></div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <UwearInterface />
        </div>
      </main>

      <footer className="bg-[var(--color-card)]">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="mt-8 text-center text-base text-[var(--color-neutral-main)]">
            &copy; 2025 Uwear.ai Clone - AI Fashion Model Generator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}