import React from "react";
import { Project } from "@/lib/types";
import { FiDownload, FiShare2, FiArrowLeft } from "react-icons/fi";

interface VideoPreviewProps {
  project: Project;
  onBackToUpload?: () => void;
}

export default function VideoPreview({ project, onBackToUpload }: VideoPreviewProps) {
  // Only show for completed projects
  if (project.status !== "complete" || !project.videoUrl) {
    return null;
  }

  // Handle download
  const handleDownload = () => {
    // Create a temporary link to download the video
    const a = document.createElement("a");
    a.href = project.videoUrl!;
    a.download = `${project.productName.replace(/\s+/g, "_")}_video.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handle share
  const handleShare = () => {
    // If Web Share API is available, use it
    if (navigator.share) {
      navigator
        .share({
          title: `${project.productName} Video`,
          text: `Check out this product video for ${project.productName}!`,
          url: project.videoUrl!,
        })
        .catch((error) => console.log("Error sharing", error));
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(project.videoUrl!);
      alert("Video URL copied to clipboard!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Your Video is Ready!</h2>
      
      {/* Video player */}
      <div className="aspect-w-16 aspect-h-9 bg-[var(--color-neutral-light)] dark:bg-[var(--color-neutral-dark)] rounded-lg overflow-hidden mb-8">
        <video
          src={project.videoUrl}
          controls
          className="w-full h-full object-contain"
          poster={project.compositeImageUrl || project.mannequinImageUrl}
          autoPlay
        />
      </div>
      
      {/* Show composite image if available */}
      {project.compositeImageUrl && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Product on Mannequin</h3>
          <div className="bg-[var(--color-neutral-light)] dark:bg-[var(--color-neutral-dark)] rounded-lg overflow-hidden">
            <img
              src={project.compositeImageUrl}
              alt={`${project.productName} on mannequin`}
              className="w-full h-auto object-contain max-h-96"
            />
          </div>
        </div>
      )}

      {/* Marketing copy generated */}
      {project.script && (
        <div className="bg-[var(--color-neutral-light)] dark:bg-[var(--color-neutral-dark)] rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Generated Marketing Copy</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[var(--color-neutral-main)]">Headline:</p>
              <p className="text-xl font-medium">{project.script.headline}</p>
            </div>
            
            <div>
              <p className="text-sm text-[var(--color-neutral-main)]">Key Points:</p>
              <ul className="list-disc list-inside ml-2">
                {project.script.bullets.map((bullet, index) => (
                  <li key={index}>{bullet}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <p className="text-sm text-[var(--color-neutral-main)]">Call to Action:</p>
              <p className="font-medium">{project.script.cta}</p>
            </div>
            
            <div>
              <p className="text-sm text-[var(--color-neutral-main)]">Color Palette:</p>
              <div className="flex gap-2 mt-2">
                {project.script.colorPalette.map((color, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded border border-[var(--color-border)]"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleDownload}
          className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-[var(--color-primary-contrast)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
        >
          <FiDownload className="mr-2" />
          Download Video
        </button>
        
        <button
          onClick={handleShare}
          className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-[var(--color-border)] rounded-md shadow-sm text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-background)] hover:bg-[var(--color-neutral-light)] dark:hover:bg-[var(--color-neutral-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
        >
          <FiShare2 className="mr-2" />
          Share Video
        </button>
      </div>
      
      {/* Back to upload button */}
      {onBackToUpload && (
        <button
          onClick={onBackToUpload}
          className="mt-8 inline-flex items-center text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
        >
          <FiArrowLeft className="mr-2" />
          Create another video
        </button>
      )}
    </div>
  );
}