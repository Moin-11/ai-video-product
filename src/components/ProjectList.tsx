"use client";

import { useState, useEffect } from "react";
import { Project } from "@/lib/types";
import { getProjects } from "@/lib/api/project-service";
import { FiVideo, FiClock, FiAlertCircle, FiRefreshCw } from "react-icons/fi";

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load projects on mount
  useEffect(() => {
    setProjects(getProjects());
    setLoading(false);
    
    // Set up interval to refresh projects (for when projects complete)
    const interval = setInterval(() => {
      setProjects(getProjects());
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <FiRefreshCw className="animate-spin mr-2 h-5 w-5 text-[var(--color-primary)]" />
        <span>Loading projects...</span>
      </div>
    );
  }
  
  if (projects.length === 0) {
    return (
      <div className="text-center py-8 max-w-md mx-auto">
        <div className="rounded-full mx-auto bg-[var(--color-neutral-light)] dark:bg-[var(--color-neutral-dark)] p-4 w-16 h-16 flex items-center justify-center mb-4">
          <FiVideo className="h-8 w-8 text-[var(--color-primary)]" />
        </div>
        <h3 className="text-lg font-medium mb-2">No projects yet</h3>
        <p className="text-[var(--color-neutral-main)] mb-6">
          Create your first video by uploading a product image.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

// Helper component for project cards
function ProjectCard({ project }: { project: Project }) {
  // Format relative date
  const formatRelativeDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };
  
  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let bgColor = 'bg-blue-100 text-blue-800';
    let icon = <FiClock className="h-3 w-3 mr-1" />;
    
    if (status === 'complete') {
      bgColor = 'bg-green-100 text-green-800';
      icon = <FiVideo className="h-3 w-3 mr-1" />;
    } else if (status === 'error') {
      bgColor = 'bg-red-100 text-red-800';
      icon = <FiAlertCircle className="h-3 w-3 mr-1" />;
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {icon}
        {status === 'complete' ? 'Complete' : 
         status === 'error' ? 'Error' :
         'Processing'}
      </span>
    );
  };
  
  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-card)] rounded-lg overflow-hidden shadow-sm">
      {/* Project thumbnail/preview */}
      <div className="h-48 bg-[var(--color-neutral-light)] dark:bg-[var(--color-neutral-dark)] overflow-hidden relative">
        {project.status === 'complete' && project.videoUrl ? (
          <video 
            src={project.videoUrl} 
            className="h-full w-full object-cover"
            poster={project.mannequinImageUrl}
            muted
            onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
            onMouseOut={(e) => {
              (e.target as HTMLVideoElement).pause();
              (e.target as HTMLVideoElement).currentTime = 0;
            }}
          />
        ) : (
          <img 
            src={project.mannequinImageUrl || project.originalImageUrl} 
            alt={project.productName}
            className="h-full w-full object-cover"
          />
        )}
        
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <StatusBadge status={project.status} />
        </div>
      </div>
      
      {/* Project info */}
      <div className="p-4">
        <h3 className="font-medium text-lg mb-1 truncate">{project.productName}</h3>
        <p className="text-[var(--color-neutral-main)] text-sm capitalize mb-2">{project.productType}</p>
        
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-[var(--color-neutral-main)]">
            {formatRelativeDate(new Date(project.createdAt))}
          </span>
          
          {project.status === 'complete' && (
            <a 
              href={project.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
            >
              View Video
            </a>
          )}
        </div>
      </div>
    </div>
  );
}