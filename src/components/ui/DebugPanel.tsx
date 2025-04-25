"use client";

import { useState, useEffect } from "react";
import { Project } from "@/lib/types";
import { getProjects, updateProjectStatus } from "@/lib/api/projects";
import { addMockProjectToStorage, fastForwardProject } from "@/lib/utils/testHelpers";
import { FiChevronDown, FiChevronUp, FiTrash2 } from "react-icons/fi";
import { useApiMode } from "@/hooks/useApiMode";

/**
 * Debug panel for development - only shown in development mode
 */
export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const useRealApis = useApiMode();

  // Only show in development mode
  if (process.env.NODE_ENV !== "development") return null;

  const togglePanel = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    // If opening, load projects
    if (newState) {
      setProjects(getProjects());
    }
  };

  // Clear all projects from local storage
  const clearProjects = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("showreel_projects");
      setProjects([]);
    }
  };

  // Reset a project status
  const resetProject = (id: string) => {
    updateProjectStatus(id, "pending");
    setProjects(getProjects());
  };
  
  // Add a sample project
  const addSampleProject = () => {
    addMockProjectToStorage("pending");
    setProjects(getProjects());
  };
  
  // Complete a project instantly
  const completeProject = (id: string) => {
    fastForwardProject(id);
    setProjects(getProjects());
  };
  
  // Toggle API mode
  const toggleApiMode = () => {
    // Toggle the value in localStorage
    if (typeof window !== 'undefined') {
      const currentValue = localStorage.getItem('showreel_use_real_apis') === 'true';
      localStorage.setItem('showreel_use_real_apis', (!currentValue).toString());
      
      // Dispatch storage event to notify other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'showreel_use_real_apis',
        newValue: (!currentValue).toString()
      }));
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={togglePanel}
        className="bg-[var(--color-neutral-dark)] dark:bg-[var(--color-neutral-light)] text-white dark:text-black rounded-full p-2 shadow-lg flex items-center"
      >
        {isOpen ? (
          <FiChevronDown className="h-6 w-6" />
        ) : (
          <FiChevronUp className="h-6 w-6" />
        )}
        <span className="ml-2 mr-2">Debug</span>
      </button>

      {/* Debug panel */}
      {isOpen && (
        <div className="mt-2 p-4 bg-[var(--color-card)] rounded-lg shadow-lg w-80 max-h-96 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Debug Controls</h3>
            <div className="flex space-x-3">
              <button
                onClick={addSampleProject}
                className="text-[var(--color-primary)] text-sm"
              >
                Add Sample
              </button>
              <button
                onClick={clearProjects}
                className="text-[var(--color-error)] flex items-center text-sm"
              >
                <FiTrash2 className="mr-1" /> Clear All
              </button>
            </div>
          </div>
          
          {/* API Mode Toggle */}
          <div className="mb-4 p-3 border border-[var(--color-border)] rounded">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API Mode:</span>
              <button 
                onClick={toggleApiMode}
                className={`px-3 py-1 text-xs rounded ${
                  useRealApis 
                    ? "bg-[var(--color-success)] text-white" 
                    : "bg-[var(--color-neutral-light)] text-[var(--color-neutral-dark)]"
                }`}
              >
                {useRealApis ? "Real APIs" : "Simulation"}
              </button>
            </div>
            <p className="mt-2 text-xs text-[var(--color-neutral-main)]">
              {useRealApis 
                ? "Using real API calls. Make sure your API keys are set in .env.local." 
                : "Using simulated API responses for testing."}
            </p>
          </div>

          {projects.length === 0 ? (
            <p className="text-[var(--color-neutral-main)] text-sm">No projects found</p>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="border border-[var(--color-border)] p-2 rounded text-sm"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{project.productName}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        project.status === "complete"
                          ? "bg-[var(--color-success-light)] text-[var(--color-success-dark)]"
                          : project.status === "error"
                          ? "bg-[var(--color-error-light)] text-[var(--color-error-dark)]"
                          : "bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <div className="text-xs mt-1 text-[var(--color-neutral-main)]">
                    {project.id.substring(0, 8)}... • {project.productType}
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => resetProject(project.id)}
                      className="text-xs text-[var(--color-primary)]"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => completeProject(project.id)}
                      className="text-xs text-[var(--color-success)]"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}