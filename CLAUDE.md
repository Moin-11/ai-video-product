# ShowReel v1: Budget-Optimized Architecture Guide

## Project Overview

ShowReel v1 is a cost-efficient AI-powered product video generator with these key features:

1. Users upload product images and select product categories
2. System removes image backgrounds automatically
3. System selects appropriate mannequin photos from curated CC0 collection
4. System creates marketing copy using GPT-4o-mini with Semrush AI fallback
5. System renders a complete 15-second video using FFCreator (open-source)
6. Video includes text overlays with marketing copy
7. Ultra-low monthly costs (under $15/month vs $200+/month)

## Cost-Optimized Tech Stack

- **Frontend**: React with TypeScript + Tailwind CSS + ShadcnUI
- **Backend**: Firebase (Storage, optional Functions) + Client-side processing
- **Payment**: Stripe integration (Phase 3)
- **AI Services**:
  - Virtual Try-On: Replicate IDM-VTON model (streamlined single provider)
  - Model Database: High-quality professional models from Unsplash (free)
  - Copy Generation: GPT-4o-mini + Semrush AI fallback (3 free/day)
  - Video Processing: FFCreator (open-source)
- **Deployment**: Firebase Hosting (free tier) + Render.com (750 free hours/month)

## System Architecture

### Project Structure

```
showreel-v1/
├── firebase/
│   ├── functions/        # Backend serverless functions
│   ├── firestore.rules   # Database security rules
│   └── storage.rules     # Storage security rules
├── src/
│   ├── components/       # UI components
│   ├── pages/            # Application pages
│   ├── hooks/            # Custom React hooks
│   ├── context/          # Context providers
│   ├── api/              # API client functions
│   ├── utils/            # Utility functions
│   └── types/            # TypeScript type definitions
```

### Core Data Models

#### User Document

Stored in `users/{userId}` collection, this document tracks user information and credit balance:

- `uid`: Firebase auth ID
- `email`: User email
- `displayName`: User name
- `credits`: Available credits
- `totalProjects`: Total projects created
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp
- `tier`: Account tier ('free', 'basic', 'pro')

#### Project Document

Stored in `projects/{projectId}` collection, this document tracks the state of the video generation pipeline:

- `id`: Project ID
- `userId`: Owner user ID
- `status`: Current processing status
- `productType`: Product category
- `productName`: Name of product
- `productDescription`: Optional description
- Processing data:
  - `originalImageUrl`: Original upload URL
  - `transparentImageUrl`: Background removed image
  - `mannequinImageUrl`: Generated mannequin image
- Generated content:
  - `script`: Marketing copy containing headline, bullets, CTA, and color palette
- Video data:
  - `runwayGenerationId`: Runway task ID
  - `videoUrl`: Final video URL
  - `signedUrl`: Temporary signed URL
  - `urlExpiry`: URL expiration timestamp
- Metadata:
  - `error`: Error message if any
  - `createdAt`: Creation timestamp
  - `updatedAt`: Last update timestamp

## Budget-Optimized Processing Pipeline

The cost-efficient video generation follows this pipeline:

1. **Project Creation** (`src/lib/api/project-service.ts`)
   - User uploads product image
   - Image stored in Firebase Storage
   - Project document created with 'pending' status

2. **Background Removal** (`src/lib/api/integrations/clipdrop.ts`)
   - ClipDrop API removes the image background (existing)
   - Alternative: Photoroom API (10 free/month)
   - Transparent PNG saved to Storage
   - Project status updated to 'processing-mannequin'

3. **Mannequin Selection** (`src/lib/api/integrations/mannequin-photos.ts`)
   - Selects appropriate CC0 stock photo from curated collection
   - Organized by product type (t-shirt, hoodie, mug, etc.)
   - No API costs - completely free
   - Project status updated to 'processing-script'

4. **Script Generation** (`src/lib/api/integrations/openai.ts` + `semrush-ai.ts`)
   - Primary: GPT-4o-mini generates marketing copy
   - Fallback: Semrush AI (3 free requests/day) if OpenAI fails
   - Creates headline, bullets, CTA, and suggested color palette
   - Project status updated to 'rendering'

5. **Video Generation** (`src/lib/api/integrations/ffcreator-video.ts`)
   - Canvas API creates composite image of product on mannequin
   - FFCreator generates video with text overlays (open-source)
   - No per-video costs unlike Runway Gen-2
   - Final video created as downloadable MP4
   - Project status updated to 'complete'

## User Experience Flow

### Phase 1 (Core Functionality)
1. **Upload**: User uploads product image and provides basic details
2. **Processing**: System processes the image through all pipeline stages 
3. **Preview**: User can view and download the generated video

### Phase 2 (User Management)
1. **Sign Up/Login**: User creates an account or logs in
2. **Dashboard**: User views their projects and status
3. **Project History**: Access to previous video generations

### Phase 3 (Monetization)
1. **Credit System**: Tracking of available video credits
2. **Checkout**: User can purchase more credits for additional videos
3. **Account Management**: Subscription and payment history

## Key Frontend Components

1. **Upload Page** (`src/pages/Upload.tsx`)
   - Handles file upload with drag-and-drop
   - Collects product information
   - Triggers the processing pipeline

2. **Dashboard** (`src/pages/Dashboard.tsx`)
   - Lists all user projects with status indicators
   - Provides access to completed videos
   - Shows available credits

3. **Video Preview** (`src/pages/VideoPreview.tsx`)
   - Displays completed video with playback controls
   - Shows generated copy and project details
   - Provides download and sharing options

4. **Checkout** (`src/pages/Checkout.tsx`)
   - Integrates with Stripe for credit purchases
   - Shows available pricing plans

## Firebase Functions

The backend consists of several Firebase Functions that handle different stages of the processing pipeline:

1. **removeBackground**: Processes the uploaded image to remove background
2. **generateMannequin**: Creates AI mannequin images via DALL-E 3
3. **generateScript**: Creates marketing copy with GPT-4o-mini
4. **generateVideo**: Renders final video with Runway Gen-2
5. **processCredit**: Manages credit consumption for video generation

## Deployment and Configuration

The application is deployed using Firebase Hosting with the following configuration needs:

1. **API Keys**: Stored securely in Firebase Functions config
   - ClipDrop API key
   - OpenAI API key (for DALL-E 3 and GPT-4o-mini)
   - Runway API key

2. **Firebase Configuration**:
   - Authentication: Email/password and Google auth
   - Firestore: Collections for users, projects
   - Storage: Buckets for images and videos
   - Functions: Node.js v16+ environment
   - Hosting: SPA configuration

3. **Stripe Integration**:
   - Uses Firebase Extensions for Stripe integration
   - Configured webhooks for payment events

## Development Workflow: Budget-First Approach

1. **Phase 1: Core Video Creation Pipeline (Current)**
   - ✅ Implement minimal Firebase setup (Storage only)
   - ✅ Create basic upload interface without authentication
   - ✅ Develop budget-optimized AI pipeline:
     - ✅ Background removal (ClipDrop)
     - ✅ Mannequin photos (CC0 collection)
     - ✅ Script generation (OpenAI + Semrush fallback)
     - ✅ Video creation (FFCreator)
   - ✅ Build simple results viewer

2. **Phase 2: User Management and Polish**
   - 🔄 Add user authentication (Firebase Auth)
   - 🔄 Implement project tracking in Firestore
   - 🔄 Build dashboard for multiple projects
   - 🔄 Enhanced image compositing (server-side FFCreator)
   - 🔄 Expanded CC0 photo library

3. **Phase 3: Monetization and Scale**
   - 📋 Implement Stripe payment integration
   - 📋 Add credit system (when volume justifies)
   - 📋 Premium AI features (if ROI positive)
   - 📋 Advanced video templates and customization

## Cost Analysis & Future Enhancements

### Monthly Cost Breakdown

**Streamlined Replicate Stack:**
- Virtual Try-On: Replicate IDM-VTON ~$0.50 per generation
- Model Database: $0 (Professional Unsplash photos)
- Marketing Copy: GPT-4o-mini ~$5-10/month + Semrush $0 (3 free/day)
- Video Generation: $0 (FFCreator open-source)
- Hosting: Firebase $0 + Render.com $0 (free tiers)
- **Total: $0.50 per generation + $5-10/month baseline**

**Cost Per Generation:**
- Replicate virtual try-on: $0.50 per high-quality generation
- Predictable per-use pricing model
- No complex fallback chains or Canvas alternatives
- **Premium quality with transparent costs**

### Future Enhancements (When Budget Allows)

**Enhanced Replicate Features:**
1. Additional IDM-VTON model parameters and fine-tuning
2. Multi-angle generation for single clothing items
3. Batch processing for multiple model variations
4. Enhanced garment description prompts
5. Quality upscaling and post-processing

**Premium Features (ROI-Dependent):**
1. Custom branding options (logos, colors)
2. Premium AI mannequin generation (when volume justifies)
3. Advanced video editing capabilities
4. Multi-product showcase videos
5. Analytics for video performance
6. White-label solutions