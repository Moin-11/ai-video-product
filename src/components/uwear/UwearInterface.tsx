/**
 * Uwear.ai Clone - Main Interface
 * Virtual try-on for fashion items
 */
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  GenerationRequest, 
  ModelOptions, 
  BackgroundOptions, 
  CameraOptions,
  DEMO_ITEMS,
  MODEL_PRESETS,
  BACKGROUND_PRESETS
} from '@/lib/types-uwear';
import { createGenerationProject } from '@/lib/api/uwear-service';
import UwearResults from './UwearResults';
import { FiUpload, FiCamera, FiSettings, FiPlay } from 'react-icons/fi';

export default function UwearInterface() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'configure' | 'processing' | 'results'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const [clothingType, setClothingType] = useState<string>('tshirt');
  const [projectId, setProjectId] = useState<string | null>(null);
  
  // Configuration states
  const [modelOptions, setModelOptions] = useState<ModelOptions>({
    ethnicity: 'caucasian',
    bodyType: 'average',
    age: 'young',
    gender: 'female'
  });
  
  const [backgroundOptions, setBackgroundOptions] = useState<BackgroundOptions>({
    type: 'studio',
    preset: 'studio-white'
  });
  
  const [cameraOptions, setCameraOptions] = useState<CameraOptions>({
    angle: 'front',
    zoom: 'full-body'
  });
  
  const [advancedOptions, setAdvancedOptions] = useState({
    enhance: false,
    generateVideo: false,
    upscale: false
  });

  const [customInstructions, setCustomInstructions] = useState<string>('');

  // File upload handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setSelectedDemo(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: false
  });

  // Demo item selection
  const handleDemoSelection = (demoId: string) => {
    setSelectedDemo(demoId);
    setSelectedFile(null);
    const demo = DEMO_ITEMS.find(item => item.id === demoId);
    if (demo) {
      setClothingType(demo.type);
    }
  };

  // Generate virtual try-on
  const handleGenerate = async () => {
    if (!selectedFile && !selectedDemo) {
      alert('Please select a clothing item first');
      return;
    }

    try {
      setCurrentStep('processing');

      let clothingFile: File;
      
      if (selectedDemo) {
        // Convert demo URL to File object
        const demo = DEMO_ITEMS.find(item => item.id === selectedDemo)!;
        const response = await fetch(demo.imageUrl);
        const blob = await response.blob();
        clothingFile = new File([blob], 'demo-item.jpg', { type: 'image/jpeg' });
      } else {
        clothingFile = selectedFile!;
      }

      const request: GenerationRequest = {
        clothingImage: clothingFile,
        clothingType,
        modelOptions,
        backgroundOptions,
        cameraOptions,
        customInstructions: customInstructions.trim() || undefined,
        enhance: advancedOptions.enhance,
        generateVideo: advancedOptions.generateVideo,
        upscale: advancedOptions.upscale
      };

      const project = await createGenerationProject(request);
      setProjectId(project.id);
      setCurrentStep('results');

    } catch (error) {
      console.error('Generation failed:', error);
      alert('Generation failed. Please try again.');
      setCurrentStep('configure');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">AI Fashion Model Generator</h1>
        <p className="text-lg text-gray-600">Transform flat-lay clothing photos into stunning model images in seconds</p>
      </div>

      {/* Step Indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {['upload', 'configure', 'results'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step 
                  ? 'bg-blue-500 text-white' 
                  : index < ['upload', 'configure', 'results'].indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <span className="ml-2 text-sm font-medium capitalize">{step}</span>
              {index < 2 && <div className="w-8 h-0.5 bg-gray-300 ml-4" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'upload' && (
        <UploadStep
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
          selectedFile={selectedFile}
          selectedDemo={selectedDemo}
          onDemoSelection={handleDemoSelection}
          clothingType={clothingType}
          setClothingType={setClothingType}
          onNext={() => setCurrentStep('configure')}
        />
      )}

      {currentStep === 'configure' && (
        <ConfigureStep
          modelOptions={modelOptions}
          setModelOptions={setModelOptions}
          backgroundOptions={backgroundOptions}
          setBackgroundOptions={setBackgroundOptions}
          cameraOptions={cameraOptions}
          setCameraOptions={setCameraOptions}
          advancedOptions={advancedOptions}
          setAdvancedOptions={setAdvancedOptions}
          customInstructions={customInstructions}
          setCustomInstructions={setCustomInstructions}
          onBack={() => setCurrentStep('upload')}
          onGenerate={handleGenerate}
        />
      )}

      {currentStep === 'processing' && (
        <ProcessingStep />
      )}

      {currentStep === 'results' && projectId && (
        <UwearResults
          projectId={projectId}
          onCreateNew={() => {
            setCurrentStep('upload');
            setSelectedFile(null);
            setSelectedDemo(null);
            setProjectId(null);
          }}
        />
      )}
    </div>
  );
}

// Upload Step Component
function UploadStep({ 
  getRootProps, 
  getInputProps, 
  isDragActive, 
  selectedFile, 
  selectedDemo, 
  onDemoSelection,
  clothingType,
  setClothingType,
  onNext 
}: any) {
  return (
    <div className="space-y-8">
      {/* File Upload */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Upload Your Clothing</h3>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {selectedFile ? (
              <div>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">Click to change</p>
              </div>
            ) : (
              <div>
                <p className="text-sm">Drag & drop your clothing image here</p>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              </div>
            )}
          </div>
          
          {/* Clothing Type Selection */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Clothing Type</label>
            <select
              value={clothingType}
              onChange={(e) => setClothingType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <optgroup label="Tops">
                <option value="tshirt">T-Shirt</option>
                <option value="shirt">Shirt</option>
                <option value="blouse">Blouse</option>
                <option value="tank-top">Tank Top</option>
                <option value="crop-top">Crop Top</option>
                <option value="polo">Polo Shirt</option>
              </optgroup>
              <optgroup label="Outerwear">
                <option value="hoodie">Hoodie</option>
                <option value="jacket">Jacket</option>
                <option value="blazer">Blazer</option>
                <option value="cardigan">Cardigan</option>
                <option value="coat">Coat</option>
                <option value="vest">Vest</option>
              </optgroup>
              <optgroup label="Dresses & Jumpsuits">
                <option value="dress">Dress</option>
                <option value="maxi-dress">Maxi Dress</option>
                <option value="mini-dress">Mini Dress</option>
                <option value="jumpsuit">Jumpsuit</option>
                <option value="romper">Romper</option>
              </optgroup>
              <optgroup label="Bottoms">
                <option value="pants">Pants</option>
                <option value="jeans">Jeans</option>
                <option value="skirt">Skirt</option>
                <option value="shorts">Shorts</option>
                <option value="leggings">Leggings</option>
                <option value="joggers">Joggers</option>
              </optgroup>
              <optgroup label="Activewear">
                <option value="sports-bra">Sports Bra</option>
                <option value="athletic-top">Athletic Top</option>
                <option value="yoga-pants">Yoga Pants</option>
                <option value="athletic-shorts">Athletic Shorts</option>
              </optgroup>
              <optgroup label="Other">
                <option value="swimwear">Swimwear</option>
                <option value="lingerie">Lingerie</option>
                <option value="other">Other</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Demo Items */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Or Try Demo Items</h3>
          <div className="grid grid-cols-2 gap-4">
            {DEMO_ITEMS.map((item) => (
              <div
                key={item.id}
                onClick={() => onDemoSelection(item.id)}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedDemo === item.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={item.thumbnailUrl}
                  alt={item.name}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-gray-500 capitalize">{item.type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!selectedFile && !selectedDemo}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Configure Model
        </button>
      </div>
    </div>
  );
}

// Configure Step Component  
function ConfigureStep({ 
  modelOptions, 
  setModelOptions, 
  backgroundOptions, 
  setBackgroundOptions,
  cameraOptions,
  setCameraOptions,
  advancedOptions,
  setAdvancedOptions,
  customInstructions,
  setCustomInstructions,
  onBack, 
  onGenerate 
}: any) {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Model Options */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center">
            <FiSettings className="mr-2" />
            Model Options
          </h3>
          
          <div>
            <label className="block text-sm font-medium mb-2">Gender</label>
            <select
              value={modelOptions.gender}
              onChange={(e) => setModelOptions({...modelOptions, gender: e.target.value as any})}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ethnicity</label>
            <select
              value={modelOptions.ethnicity}
              onChange={(e) => setModelOptions({...modelOptions, ethnicity: e.target.value as any})}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {MODEL_PRESETS.ethnicities.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Body Type</label>
            <select
              value={modelOptions.bodyType}
              onChange={(e) => setModelOptions({...modelOptions, bodyType: e.target.value as any})}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {MODEL_PRESETS.bodyTypes.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Age Range</label>
            <select
              value={modelOptions.age}
              onChange={(e) => setModelOptions({...modelOptions, age: e.target.value as any})}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {MODEL_PRESETS.ages.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Background Options */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Background</h3>
          
          <div className="grid grid-cols-2 gap-2">
            {BACKGROUND_PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => setBackgroundOptions({type: preset.type as any, preset: preset.id})}
                className={`border rounded-lg p-2 cursor-pointer ${
                  backgroundOptions.preset === preset.id ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <img
                  src={preset.url}
                  alt={preset.name}
                  className="w-full h-20 object-cover rounded mb-1"
                />
                <p className="text-xs text-center">{preset.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Camera Options */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center">
            <FiCamera className="mr-2" />
            Camera
          </h3>
          
          <div>
            <label className="block text-sm font-medium mb-2">Camera Angle</label>
            <select
              value={cameraOptions.angle}
              onChange={(e) => setCameraOptions({...cameraOptions, angle: e.target.value as any})}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="front">Front View - Classic showcase</option>
              <option value="angle">3/4 Angle - Dynamic perspective</option>
              <option value="side">Side View - Profile silhouette</option>
              <option value="45-degree">45° Turn - Fashionable pose</option>
              <option value="back">Back View - Show rear details</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Different angles showcase clothing in various ways</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Framing</label>
            <select
              value={cameraOptions.zoom}
              onChange={(e) => setCameraOptions({...cameraOptions, zoom: e.target.value as any})}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="full-body">Full Body - Head to toe</option>
              <option value="three-quarter">3/4 Body - Waist up</option>
              <option value="half-body">Half Body - Chest up</option>
              <option value="close-up">Close Up - Focus on garment</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Choose how much of the model to show</p>
          </div>

          {/* Custom Instructions */}
          <div>
            <label className="block text-sm font-medium mb-2">Custom style preferences (optional)</label>
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="confident smile, professional lighting, outdoor background..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none"
              rows={2}
            />
            <p className="text-xs text-gray-500 mt-1">
              Examples: "smiling", "athletic build", "outdoor setting", "confident pose"
            </p>
          </div>

          {/* Advanced Options */}
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={advancedOptions.enhance}
                onChange={(e) => setAdvancedOptions({...advancedOptions, enhance: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm">Enhance quality</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={advancedOptions.generateVideo}
                onChange={(e) => setAdvancedOptions({...advancedOptions, generateVideo: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm">Generate video</span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back
        </button>
        
        <button
          onClick={onGenerate}
          className="px-8 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
        >
          <FiPlay className="mr-2" />
          Generate Model Image
        </button>
      </div>
    </div>
  );
}

// Processing Step Component
function ProcessingStep() {
  return (
    <div className="text-center py-16">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <h3 className="text-xl font-semibold mb-2">Generating Your Model Image</h3>
      <p className="text-gray-600">This usually takes 30-60 seconds...</p>
      <div className="mt-8 space-y-2 text-sm text-gray-500">
        <p>✓ Analyzing clothing details</p>
        <p>✓ Selecting appropriate model</p>
        <p>→ Creating virtual try-on</p>
        <p>→ Applying enhancements</p>
      </div>
    </div>
  );
}

