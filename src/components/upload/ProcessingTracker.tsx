import React, { useEffect, useState, useRef } from "react";
import { Project, ProjectStatus } from "@/lib/types";
import { getProject } from "@/lib/api/project-service";
import { FiCheck, FiLoader, FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import { logger } from "@/lib/utils/logger";

interface ProcessingTrackerProps {
  projectId: string;
  onComplete: (project: Project) => void;
}

export default function ProcessingTracker({
  projectId,
  onComplete,
}: ProcessingTrackerProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to start/restart polling
  const startPolling = () => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setIsPolling(true);
    setError(null);
    
    intervalRef.current = setInterval(() => {
      try {
        const currentProject = getProject(projectId);
        
        if (currentProject) {
          setProject(currentProject);
          
          // If project completed or errored, stop polling
          if (currentProject.status === "complete") {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsPolling(false);
            onComplete(currentProject);
          } else if (currentProject.status === "error") {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsPolling(false);
            setError(currentProject.error || "An error occurred during processing");
          }
        } else {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsPolling(false);
          setError("Project not found");
        }
      } catch (e) {
        logger.error("Error in ProcessingTracker poll:", e);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsPolling(false);
        setError(`Polling error: ${(e as Error).message}`);
      }
    }, 1000);
  };

  // Start polling on component mount
  useEffect(() => {
    startPolling();
    
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [projectId, onComplete]);

  if (!project) {
    return (
      <div className="text-center py-8">
        <FiLoader className="animate-spin mx-auto h-8 w-8 text-[var(--color-primary)]" />
        <p className="mt-2 text-[var(--color-neutral-main)]">Loading project...</p>
      </div>
    );
  }

  // Helper function to get status display info
  const getStatusInfo = (status: ProjectStatus) => {
    switch (status) {
      case "pending":
        return { label: "Uploading", progress: 10 };
      case "processing-background":
        return { label: "Removing Background", progress: 25 };
      case "processing-mannequin":
        return { label: "Generating Mannequin", progress: 45 };
      case "processing-script":
        return { label: "Creating Marketing Copy", progress: 65 };
      case "rendering":
        return { label: "Rendering Video", progress: 85 };
      case "complete":
        return { label: "Complete", progress: 100 };
      case "error":
        return { label: "Error", progress: 100 };
      default:
        return { label: "Processing", progress: 50 };
    }
  };

  const statusInfo = getStatusInfo(project.status);

  return (
    <div className="max-w-xl mx-auto py-8">
      <h2 className="text-xl font-semibold mb-4">Processing Your Video</h2>

      {error ? (
        <div className="bg-[var(--color-error-light)] border border-[var(--color-error)] rounded-md p-4 mb-6">
          <div className="flex items-center">
            <FiAlertTriangle className="h-5 w-5 text-[var(--color-error)] mr-2" />
            <span className="text-[var(--color-error-dark)]">{error}</span>
          </div>
          <button 
            onClick={startPolling}
            className="mt-4 flex items-center text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
          >
            <FiRefreshCw className="mr-1" /> Retry Processing
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-primary)] font-medium">
                {statusInfo.label}
              </span>
              <span className="text-[var(--color-neutral-main)]">{statusInfo.progress}%</span>
            </div>
            <div className="w-full bg-[var(--color-neutral-light)] dark:bg-[var(--color-neutral-dark)] rounded-full h-2.5">
              <div
                className="bg-[var(--color-primary)] h-2.5 rounded-full"
                style={{ width: `${statusInfo.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Step indicators */}
          <div className="space-y-4">
            <StepIndicator
              label="Upload"
              isComplete={true}
              isActive={project.status === "pending"}
            />
            <StepIndicator
              label="Background Removal"
              isComplete={["processing-mannequin", "processing-script", "rendering", "complete"].includes(project.status)}
              isActive={project.status === "processing-background"}
            />
            <StepIndicator
              label="Mannequin Generation"
              isComplete={["processing-script", "rendering", "complete"].includes(project.status)}
              isActive={project.status === "processing-mannequin"}
            />
            <StepIndicator
              label="Marketing Copy"
              isComplete={["rendering", "complete"].includes(project.status)}
              isActive={project.status === "processing-script"}
            />
            <StepIndicator
              label="Video Rendering"
              isComplete={project.status === "complete"}
              isActive={project.status === "rendering"}
            />
          </div>

          {/* Estimated time */}
          <div className="text-center text-sm text-[var(--color-neutral-main)]">
            Estimated time remaining: {project.status === "rendering" ? "1-5" : project.status === "processing-mannequin" ? "1-3" : "1-2"} minutes
            <p className="text-xs mt-1 text-[var(--color-neutral-main)]">Using real AI APIs which may take several minutes</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for step indicators
function StepIndicator({
  label,
  isComplete,
  isActive,
}: {
  label: string;
  isComplete: boolean;
  isActive: boolean;
}) {
  return (
    <div className="flex items-center">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
          isComplete
            ? "bg-[var(--color-success)] text-white"
            : isActive
            ? "bg-[var(--color-primary)] text-white"
            : "bg-[var(--color-neutral-light)] dark:bg-[var(--color-neutral-dark)] text-[var(--color-neutral-main)]"
        }`}
      >
        {isComplete ? (
          <FiCheck />
        ) : isActive ? (
          <FiLoader className="animate-spin" />
        ) : (
          <span className="text-xs">{}</span>
        )}
      </div>
      <span
        className={`${
          isComplete
            ? "text-[var(--color-success-dark)]"
            : isActive
            ? "text-[var(--color-primary-dark)] font-medium"
            : "text-[var(--color-neutral-main)]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

// No longer need the helper function for estimated time
// We now display ranges based on the actual API performance