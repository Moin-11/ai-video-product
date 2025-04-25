import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { createProject } from "@/lib/api/project-service";
import { FiUpload, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

interface UploadFormProps {
  onSuccess: (projectId: string) => void;
}

export default function UploadForm({ onSuccess }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [productType, setProductType] = useState<string>("t-shirt");
  const [productName, setProductName] = useState<string>("");
  const [productDescription, setProductDescription] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Dropzone setup
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    maxSize: 5242880, // 5MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFile(file);
        setPreview(URL.createObjectURL(file));
      }
    },
    onDropRejected: () => {
      setError("Please upload a valid image file under 5MB");
    },
  });

  // Product type options
  const productTypes = [
    "t-shirt",
    "hoodie",
    "tote bag",
    "mug",
    "phone case",
    "poster",
  ];

  // Handle submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !productType || !productName) {
      setError("Please provide all required information");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Create project and start processing
      const project = await createProject({
        productType,
        productName,
        productDescription,
        imageFile: file,
      });

      // Notify parent component of success
      onSuccess(project.id);
    } catch (err) {
      console.error("Error creating project:", err);
      setError("An error occurred while creating your project");
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Product Image</label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
              preview
                ? "border-[var(--color-success)]"
                : "border-[var(--color-neutral-main)] hover:border-[var(--color-neutral-dark)]"
            }`}
          >
            <input {...getInputProps()} />
            {preview ? (
              <div className="flex flex-col items-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 max-w-full mb-2"
                />
                <p className="text-sm text-[var(--color-neutral-main)]">Click or drag to replace</p>
              </div>
            ) : (
              <div className="space-y-2">
                <FiUpload className="mx-auto h-12 w-12 text-[var(--color-neutral-main)]" />
                <p className="text-sm text-[var(--color-neutral-main)]">
                  Drag and drop a product image, or click to select
                </p>
                <p className="text-xs text-[var(--color-neutral-main)]">
                  PNG, JPG or JPEG (max 5MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Product type selection */}
        <div className="space-y-2">
          <label htmlFor="productType" className="block text-sm font-medium">
            Product Type
          </label>
          <select
            id="productType"
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            className="block w-full rounded-md border-[var(--color-border)] bg-[var(--color-background)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            required
            disabled={isUploading}
          >
            {productTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Product name */}
        <div className="space-y-2">
          <label htmlFor="productName" className="block text-sm font-medium">
            Product Name
          </label>
          <input
            type="text"
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="block w-full rounded-md border-[var(--color-border)] bg-[var(--color-background)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            placeholder="e.g. Premium Cotton T-Shirt"
            required
            disabled={isUploading}
          />
        </div>

        {/* Product description */}
        <div className="space-y-2">
          <label
            htmlFor="productDescription"
            className="block text-sm font-medium"
          >
            Product Description (optional)
          </label>
          <textarea
            id="productDescription"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            rows={3}
            className="block w-full rounded-md border-[var(--color-border)] bg-[var(--color-background)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            placeholder="Brief description of your product"
            disabled={isUploading}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="text-[var(--color-error)] text-sm flex items-center gap-1">
            <FiAlertCircle /> {error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isUploading || !file}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-[var(--color-primary-contrast)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] ${
            isUploading || !file ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isUploading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-[var(--color-primary-contrast)]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <FiCheckCircle className="mr-2" /> Create Video
            </>
          )}
        </button>
      </form>
    </div>
  );
}