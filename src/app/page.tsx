"use client";

import { useState } from "react";
import Image from "next/image";
import UploadForm from "@/components/upload/UploadForm";
import ProcessingTracker from "@/components/upload/ProcessingTracker";
import VideoPreview from "@/components/upload/VideoPreview";
import ProjectList from "@/components/ProjectList";
import { Project } from "@/lib/types";

export default function Home() {
  const [step, setStep] = useState<"upload" | "processing" | "preview">("upload");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);

  // Handle successful upload
  const handleUploadSuccess = (id: string) => {
    setProjectId(id);
    setStep("processing");
  };

  // Handle processing completion
  const handleProcessingComplete = (completedProject: Project) => {
    setProject(completedProject);
    setStep("preview");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[var(--color-card)] shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-[var(--color-primary)]">ShowReel</span>
            <span className="ml-2 text-xs bg-[var(--color-neutral-light)] dark:bg-[var(--color-neutral-dark)] text-[var(--color-neutral-dark)] dark:text-[var(--color-neutral-light)] px-2 py-1 rounded-full">
              v1
            </span>
          </div>
          <div id="theme-switcher-container"></div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Hero section for upload step */}
          {step === "upload" && (
            <div className="text-center mb-12">
              <h1 className="text-4xl font-extrabold sm:text-5xl sm:tracking-tight lg:text-6xl">
                Generate Amazing Product Videos
              </h1>
              <p className="mt-5 max-w-xl mx-auto text-xl text-[var(--color-neutral-main)]">
                Transform your product images into professional marketing videos in minutes with AI.
              </p>
            </div>
          )}

          {/* Content based on current step */}
          <div className="bg-[var(--color-card)] shadow overflow-hidden sm:rounded-lg p-6">
            {step === "upload" && (
              <UploadForm onSuccess={handleUploadSuccess} />
            )}

            {step === "processing" && projectId && (
              <ProcessingTracker 
                projectId={projectId} 
                onComplete={handleProcessingComplete} 
              />
            )}

            {step === "preview" && project && (
              <VideoPreview project={project} onBackToUpload={() => setStep("upload")} />
            )}
          </div>

          {/* How it works section */}
          {step === "upload" && (
            <>
              <div className="mt-16 mb-16">
                <h2 className="text-2xl font-bold mb-8 text-center">
                  How It Works
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="bg-[var(--color-primary-light)] rounded-full p-4 inline-flex items-center justify-center mb-4">
                      <span className="text-xl font-bold text-[var(--color-primary)]">1</span>
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      Upload Your Product
                    </h3>
                    <p className="text-[var(--color-neutral-main)]">
                      Simply upload a product image and we'll automatically remove the background.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-[var(--color-primary-light)] rounded-full p-4 inline-flex items-center justify-center mb-4">
                      <span className="text-xl font-bold text-[var(--color-primary)]">2</span>
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      AI Magic Happens
                    </h3>
                    <p className="text-[var(--color-neutral-main)]">
                      Our AI generates a mannequin, creates compelling marketing copy, and renders your video.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-[var(--color-primary-light)] rounded-full p-4 inline-flex items-center justify-center mb-4">
                      <span className="text-xl font-bold text-[var(--color-primary)]">3</span>
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      Get Your Video
                    </h3>
                    <p className="text-[var(--color-neutral-main)]">
                      Download your professional marketing video ready to share on social media.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Previous Projects */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Your Projects</h2>
                <ProjectList />
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="bg-[var(--color-card)]">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="mt-8 text-center text-base text-[var(--color-neutral-main)]">
            &copy; 2025 ShowReel v1. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}