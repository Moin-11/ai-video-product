# ShowReel v1: Architecture and Implementation Guide

## Project Overview

ShowReel v1 is an AI-powered product video generator with these key features:

1. Users upload product images and select product categories
2. System removes image backgrounds automatically
3. System generates AI mannequin images via DALL-E 3
4. System creates marketing copy using GPT-4o-mini
5. System renders a complete 15-second video using Runway Gen-2
6. Video includes text overlays with marketing copy
7. Users can purchase credits to generate videos

## Tech Stack

- **Frontend**: React with TypeScript + Tailwind CSS + ShadcnUI
- **Backend**: Firebase (Firestore, Functions, Storage, Auth)
- **Payment**: Stripe integration via Firebase Extensions
- **AI APIs**:
  - Background Removal: ClipDrop API
  - Mannequin Generation: DALL-E 3 via OpenAI API
  - Copy Generation: GPT-4o-mini
  - Video Processing: Runway Gen-2 + FFmpeg for text overlays
- **Deployment**: Firebase Hosting

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

## Processing Pipeline

The video generation follows this processing pipeline:

1. **Project Creation** (`firebase/functions/src/projects/create.ts`)
   - User uploads product image
   - Image stored in Firebase Storage
   - Project document created with 'pending' status

2. **Background Removal** (`firebase/functions/src/projects/background.ts`)
   - ClipDrop API removes the image background
   - Transparent PNG saved to Storage
   - Project status updated to 'processing-mannequin'

3. **Mannequin Generation** (`firebase/functions/src/projects/mannequin.ts`)
   - DALL-E 3 generates model image based on product type
   - Generated image saved to Storage
   - Project status updated to 'processing-script'

4. **Script Generation** (`firebase/functions/src/projects/script.ts`)
   - GPT-4o-mini generates marketing copy
   - Creates headline, bullets, CTA, and suggested color palette
   - Project status updated to 'rendering'

5. **Video Generation** (`firebase/functions/src/projects/video.ts`)
   - Creates composite image of product on mannequin
   - Runway Gen-2 creates video animation
   - FFmpeg adds text overlays from generated script
   - Final video saved to Storage
   - Signed URL generated for user access
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

## Development Workflow: Core First Approach

1. **Phase 1: Core Video Creation Pipeline**
   - Implement minimal Firebase setup (Storage and Functions)
   - Create basic upload interface without authentication
   - Develop core AI pipeline with all four services:
     - Background removal
     - Mannequin generation
     - Script generation
     - Video creation
   - Build simple results viewer

2. **Phase 2: User Management and Polish**
   - Add user authentication
   - Implement project tracking in Firestore
   - Build dashboard for multiple projects
   - Add results sharing and download capabilities

3. **Phase 3: Monetization and Scale**
   - Implement Stripe payment integration
   - Add credit system
   - Scale Firebase functions for production load
   - Optimize costs and performance

## Future Enhancements

Potential enhancements for future versions:

1. Additional product types and mannequin poses
2. Custom branding options (logos, colors)
3. Advanced video editing capabilities
4. AI-powered product descriptions
5. Multi-product showcase videos
6. Analytics for video performance