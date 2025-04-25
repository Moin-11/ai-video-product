# Firebase Setup for ShowReel v1

This document outlines the Firebase setup required for the ShowReel v1 application.

## Phase 1: Core Video Creation (Minimal Setup)

For the first phase, we only need Firebase Storage and Functions:

1. **Create a Firebase project** in the [Firebase Console](https://console.firebase.google.com/)

2. **Set up Firebase Storage** for storing:
   - Original uploaded images
   - Transparent background images
   - Mannequin images
   - Generated videos

3. **Configure Firebase Functions** for:
   - Background removal (ClipDrop API)
   - Mannequin generation (Midjourney v6)
   - Script generation (GPT-4o-mini)
   - Video generation (Runway Gen-2)

## API Integration Requirements

### 1. Background Removal (ClipDrop)
```javascript
// Example implementation
export const removeBackground = functions.https.onCall(async (data, context) => {
  const { imageUrl } = data;
  
  // Fetch image from URL
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();
  
  // Call ClipDrop API
  const formData = new FormData();
  formData.append('image_file', new Blob([Buffer.from(buffer)]));
  
  const clipdropResponse = await fetch('https://clipdrop-api.co/remove-background/v1', {
    method: 'POST',
    headers: {
      'x-api-key': functions.config().clipdrop.api_key,
    },
    body: formData,
  });
  
  // Process and return transparent image
  // ...
});
```

### 2. Mannequin Generation (Midjourney v6)
```javascript
// Example implementation
export const generateMannequin = functions.https.onCall(async (data, context) => {
  const { productType } = data;
  
  // Create prompt based on product type
  const prompt = `A studio photograph of a neutral model wearing a plain white ${productType}...`;
  
  // Call Midjourney API
  const response = await fetch('https://api.midjourney.com/v1/imagine', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${functions.config().midjourney.api_key}`,
    },
    body: JSON.stringify({ prompt }),
  });
  
  // Process and return mannequin image
  // ...
});
```

### 3. Script Generation (GPT-4o-mini)
```javascript
// Example implementation
export const generateScript = functions.https.onCall(async (data, context) => {
  const { productName, productType, productDescription } = data;
  
  // Call OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${functions.config().openai.api_key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional marketing copywriter specializing in short, impactful product video scripts.'
        },
        {
          role: 'user',
          content: `Write a video script for a ${productType} product named "${productName}"...`
        }
      ],
      response_format: { type: "json_object" },
    }),
  });
  
  // Process and return script
  // ...
});
```

### 4. Video Generation (Runway Gen-2)
```javascript
// Example implementation
export const generateVideo = functions.https.onCall(async (data, context) => {
  const { mannequinImageUrl, transparentImageUrl, script } = data;
  
  // Create composite image
  // ...
  
  // Call Runway API
  const response = await fetch('https://api.runwayml.com/v1/generationJob', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${functions.config().runway.api_key}`,
    },
    body: JSON.stringify({
      model: 'runway/gen-2',
      parameters: {
        prompt: `Professional product advertisement featuring...`,
        image: `data:image/jpeg;base64,...`,
        mode: 'video',
      },
    }),
  });
  
  // Process and return video
  // ...
});
```

## Environment Variables

Add these to your Firebase Functions configuration:

```bash
firebase functions:config:set clipdrop.api_key="YOUR_CLIPDROP_API_KEY"
firebase functions:config:set midjourney.api_key="YOUR_MIDJOURNEY_API_KEY"
firebase functions:config:set openai.api_key="YOUR_OPENAI_API_KEY"
firebase functions:config:set runway.api_key="YOUR_RUNWAY_API_KEY"
```

## Phase 2 & 3: Additional Firebase Setup

For later phases, you'll need to set up:

1. **Firebase Authentication**
   - Email/password authentication
   - Google authentication

2. **Firebase Firestore**
   - Collections for users and projects
   - Security rules

3. **Firebase Extensions**
   - Stripe extension for payments