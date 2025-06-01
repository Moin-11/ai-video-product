/**
 * Uwear.ai Results Display Component
 * Shows generated model images with enhancement options
 */
import React, { useState, useEffect } from 'react';
import { GenerationProject } from '@/lib/types-uwear';
import { getProject, generateVariations } from '@/lib/api/uwear-service';
import { FiDownload, FiShare2, FiRefreshCw, FiZoomIn, FiPlay, FiImage } from 'react-icons/fi';

interface UwearResultsProps {
  projectId: string;
  onCreateNew: () => void;
}

export default function UwearResults({ projectId, onCreateNew }: UwearResultsProps) {
  const [project, setProject] = useState<GenerationProject | null>(null);
  const [variations, setVariations] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  // Poll for project updates
  useEffect(() => {
    const interval = setInterval(() => {
      const currentProject = getProject(projectId);
      if (currentProject) {
        setProject(currentProject);
        
        if (currentProject.status === 'complete' && currentProject.generatedImageUrl) {
          setSelectedImage(currentProject.generatedImageUrl);
          clearInterval(interval);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [projectId]);

  if (!project) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Loading project...</p>
      </div>
    );
  }

  if (project.status === 'processing' || project.status === 'enhancing') {
    return <ProcessingDisplay status={project.status} />;
  }

  if (project.status === 'error') {
    return (
      <div className="text-center py-16">
        <div className="text-red-500 mb-4">
          <FiRefreshCw className="h-16 w-16 mx-auto mb-4" />
          <h3 className="text-xl font-semibold">Generation Failed</h3>
          <p className="text-gray-600 mt-2">{project.error}</p>
        </div>
        <button
          onClick={onCreateNew}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Generate variations
  const handleGenerateVariations = async () => {
    if (!project.generatedImageUrl) return;
    
    setIsGeneratingVariations(true);
    try {
      const newVariations = await generateVariations(projectId, 4);
      setVariations(newVariations);
    } catch (error) {
      console.error('Failed to generate variations:', error);
    }
    setIsGeneratingVariations(false);
  };

  // Download image
  const handleDownload = () => {
    if (!selectedImage) return;
    
    const a = document.createElement('a');
    a.href = selectedImage;
    a.download = `uwear-model-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Share image
  const handleShare = async () => {
    if (!selectedImage) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Model Image',
          text: 'Check out this AI-generated model image!',
          url: selectedImage
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(selectedImage);
      alert('Image URL copied to clipboard!');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Your AI Model Image</h2>
        <p className="text-gray-600">
          Generated in {project.processingTime?.toFixed(1)}s • 
          {project.modelOptions.ethnicity} {project.modelOptions.gender} • 
          {project.modelOptions.bodyType} build
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Image Display */}
        <div className="lg:col-span-2">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
            {selectedImage ? (
              <>
                <img
                  src={selectedImage}
                  alt="Generated model"
                  className="w-full h-full object-cover cursor-zoom-in"
                  onClick={() => setShowFullscreen(true)}
                />
                
                {/* Overlay Controls */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={() => setShowFullscreen(true)}
                    className="p-2 bg-black bg-opacity-50 text-white rounded-md hover:bg-opacity-70"
                    title="View fullscreen"
                  >
                    <FiZoomIn />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FiImage className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No image generated yet</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={handleDownload}
              disabled={!selectedImage}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              <FiDownload className="mr-2" />
              Download
            </button>
            
            <button
              onClick={handleShare}
              disabled={!selectedImage}
              className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <FiShare2 className="mr-2" />
              Share
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Variations */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Variations</h3>
              <button
                onClick={handleGenerateVariations}
                disabled={isGeneratingVariations}
                className="text-sm text-blue-500 hover:text-blue-600 flex items-center"
              >
                <FiRefreshCw className={`mr-1 ${isGeneratingVariations ? 'animate-spin' : ''}`} />
                Generate
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {/* Original */}
              {project.generatedImageUrl && (
                <div
                  onClick={() => setSelectedImage(project.generatedImageUrl!)}
                  className={`border-2 rounded-lg overflow-hidden cursor-pointer ${
                    selectedImage === project.generatedImageUrl ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={project.generatedImageUrl}
                    alt="Original"
                    className="w-full h-24 object-cover"
                  />
                </div>
              )}
              
              {/* Variations */}
              {variations.map((variation, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImage(variation)}
                  className={`border-2 rounded-lg overflow-hidden cursor-pointer ${
                    selectedImage === variation ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={variation}
                    alt={`Variation ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                </div>
              ))}
              
              {/* Loading placeholders */}
              {isGeneratingVariations && Array.from({ length: 4 - variations.length }).map((_, index) => (
                <div key={`loading-${index}`} className="border border-gray-200 rounded-lg h-24 bg-gray-100 animate-pulse" />
              ))}
            </div>
          </div>

          {/* Enhancement Options */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Enhance</h3>
            
            {project.enhancedImageUrl ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">✓ Enhanced version available</p>
                <button
                  onClick={() => setSelectedImage(project.enhancedImageUrl!)}
                  className="text-sm text-blue-500 hover:text-blue-600 mt-1"
                >
                  View enhanced
                </button>
              </div>
            ) : (
              <button
                className="w-full p-3 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                onClick={() => {/* Implement enhancement */}}
              >
                Enhance Quality
              </button>
            )}
            
            <button
              className="w-full p-3 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
              onClick={() => {/* Implement upscaling */}}
            >
              Upscale to 4K
            </button>
          </div>

          {/* Video Option */}
          {project.videoUrl ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Video</h3>
              <video
                src={project.videoUrl}
                controls
                className="w-full rounded-md"
                poster={selectedImage}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Create Video</h3>
              <button
                className="w-full p-3 border border-gray-300 rounded-md hover:bg-gray-50 text-sm flex items-center justify-center"
                onClick={() => {/* Implement video generation */}}
              >
                <FiPlay className="mr-2" />
                Generate Short Video
              </button>
            </div>
          )}

          {/* Original Image */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Original</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <img
                src={project.clothingImageUrl}
                alt="Original clothing"
                className="w-full h-32 object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Create New Button */}
      <div className="text-center pt-8 border-t">
        <button
          onClick={onCreateNew}
          className="px-8 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-lg"
        >
          Create Another Model Image
        </button>
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Fullscreen"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Processing Display Component
function ProcessingDisplay({ status }: { status: string }) {
  const steps = [
    { key: 'processing', label: 'Analyzing clothing', description: 'Understanding fabric, fit, and style' },
    { key: 'enhancing', label: 'Enhancing quality', description: 'Applying AI improvements' }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === status);

  return (
    <div className="text-center py-16 space-y-8">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
      
      <div>
        <h3 className="text-2xl font-semibold mb-2">Generating Your Model Image</h3>
        <p className="text-gray-600">Using advanced AI to create realistic try-on images</p>
      </div>

      {/* Progress Steps */}
      <div className="max-w-md mx-auto space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.key}
            className={`flex items-center space-x-3 p-3 rounded-lg ${
              index <= currentStepIndex ? 'bg-blue-50' : 'bg-gray-50'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
              index < currentStepIndex 
                ? 'bg-green-500 text-white' 
                : index === currentStepIndex
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-600'
            }`}>
              {index < currentStepIndex ? '✓' : index + 1}
            </div>
            <div className="text-left">
              <p className="font-medium">{step.label}</p>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-500">
        <p>Estimated time: 30-60 seconds</p>
        <p>Please don't close this window</p>
      </div>
    </div>
  );
}