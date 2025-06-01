# Photorealistic Model Generation Guide

## 🎯 Achieving Photorealistic Results with Replicate

### ⚠️ Important Note: NSFW Content Detection

RealVisXL and other photorealistic models can sometimes trigger NSFW content detection even with professional fashion prompts. This is because:
- Photorealistic human generation is sensitive
- Models err on the side of caution
- Fashion/clothing context can be misinterpreted

## 🎯 Two-Part Strategy for Photorealistic Results

### **Strategy 1: Enhanced Curated Model Database (Recommended)**

Instead of generating AI models (which can trigger NSFW detection), we use:
1. **High-quality Unsplash photos** (1200x1600 resolution)
2. **Professional models** with commercial licensing
3. **Diverse demographics** and poses
4. **Guaranteed appropriate content**

This approach:
- ✅ 100% reliable (no NSFW issues)
- ✅ Truly photorealistic (real photos)
- ✅ Faster processing (no AI generation step)
- ✅ Lower cost ($0.50 vs $1.00 per image)

### **Strategy 2: AI Generation with Safety Measures**

If you need custom AI models:
1. **Use explicit clothing descriptions** in prompts
2. **Add safety keywords**: "fully clothed", "professional attire"
3. **Strong negative prompts** to prevent inappropriate content
4. **Retry logic** if NSFW detected

### **Key Changes Made:**

1. **Switched to RealVisXL V4.0 Lightning**
   - Specifically fine-tuned on photorealistic images
   - Optimized for fashion photography
   - Much better than FLUX for realistic humans

2. **Enhanced Prompting Strategy**
   ```
   RAW photo, professional fashion photography, photorealistic,
   shot on Canon EOS R5, 85mm lens, f/2.8, studio lighting,
   softbox lighting, ultra detailed, sharp focus, 8k uhd, 
   dslr quality, film grain, Fujifilm XT3
   ```

3. **Negative Prompts Added**
   - Prevents cartoon/anime style
   - Avoids CGI/render look
   - Eliminates common AI artifacts

4. **Optimized Parameters**
   - Lower guidance scale (1.5) for realism
   - DPM++ 2M Karras scheduler
   - Proper resolution for fashion (768x1024)

## 📸 Professional Photography Keywords

### **Camera Equipment Terms:**
- `RAW photo` - Signals photographic quality
- `Canon EOS R5` / `Sony A7R IV` - Professional cameras
- `85mm lens` / `50mm f/1.4` - Portrait lenses
- `f/2.8` / `f/4` - Aperture settings

### **Lighting Terms:**
- `studio lighting` - Professional setup
- `softbox lighting` - Flattering for fashion
- `rim lighting` - Adds depth
- `natural light` - For outdoor feel

### **Quality Indicators:**
- `ultra detailed`
- `sharp focus`
- `8k uhd`
- `dslr quality`
- `film grain`
- `award winning photograph`

## 🚫 Common Mistakes to Avoid

1. **Don't use artistic terms:**
   - ❌ "beautiful", "stunning", "amazing"
   - ✅ "professional", "commercial", "photorealistic"

2. **Don't forget negative prompts:**
   - Always include: "cartoon, anime, illustration, CGI, render"

3. **Don't use high guidance values:**
   - Keep between 1.0-2.0 for RealVisXL

## 🎨 Custom Instructions Examples

### **For Different Styles:**

**Corporate/Professional:**
```
"navy business suit, corporate headshot lighting, 
LinkedIn profile photo style, neutral expression"
```

**Lifestyle/Casual:**
```
"natural outdoor lighting, golden hour, relaxed pose,
lifestyle photography, candid moment"
```

**High Fashion:**
```
"editorial fashion photography, Vogue style, dramatic lighting,
high contrast, fashion week runway quality"
```

**E-commerce Standard:**
```
"pure white background, even lighting, product showcase,
Amazon listing style, neutral pose"
```

## 🔧 Technical Configuration

### **RealVisXL V4.0 Lightning Settings:**
```javascript
{
  prompt: "RAW photo, photorealistic...",
  negative_prompt: "cartoon, anime, CGI...",
  width: 768,
  height: 1024,
  scheduler: "DPM++ 2M Karras",
  guidance_scale: 1.5,
  num_inference_steps: 6
}
```

### **Alternative Models (if needed):**

1. **RealVisXL V3.0 Turbo**
   - Slightly older but still excellent
   - Better for some body types

2. **Juggernaut XL**
   - Good alternative for diversity
   - Strong on skin textures

3. **SDXL with Photorealistic LoRA**
   - More customizable
   - Requires more parameter tuning

## 📊 Quality Checklist

✅ **Skin looks natural** (not plastic/smooth)
✅ **Proper anatomy** (correct proportions)
✅ **Natural poses** (not stiff/artificial)
✅ **Realistic lighting** (proper shadows)
✅ **Sharp details** (hair, fabric texture)
✅ **No AI artifacts** (extra fingers, weird joints)

## 🚀 Future Improvements

1. **Face Enhancement Pipeline:**
   - Consider adding GFPGAN for face restoration
   - Use CodeFormer for detail enhancement

2. **Multi-Stage Generation:**
   - Generate base model → Enhance face → Apply clothing

3. **Custom Training:**
   - Fine-tune on specific demographics
   - Train on your brand's aesthetic

## 💡 Pro Tips

1. **Batch Testing:**
   - Generate 3-4 variations with different seeds
   - Pick the most realistic one

2. **Demographic Accuracy:**
   - Be specific: "Korean woman" vs "Asian woman"
   - Include age indicators: "early 30s" vs "young"

3. **Pose Descriptions:**
   - Use photography terms: "three-quarter view"
   - Reference fashion poses: "catalog pose"

4. **Background Control:**
   - "infinity cove studio background"
   - "seamless white backdrop"
   - "lifestyle outdoor setting, blurred background"

Remember: The key to photorealistic results is thinking like a photographer, not an AI prompter!