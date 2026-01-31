import { ai } from '../../core/api/ai';
import { callAiWithRetry } from '../../core/api/aiUtils';
import { ensureBase64 } from '../../core/utils/imageUtils';
import type { AspectRatio, ModularPrompt, Product, StylePreset, ImageSize } from '../../core/types';
import { GenerateContentResponse } from '@google/genai';
import { DEFAULT_SYSTEM_INSTRUCTIONS } from '../settings/systemPrompts';

const THINKING_CONFIG = { thinkingBudget: 24576 };

async function generateImage(model: string, prompt: string, aspectRatio: AspectRatio): Promise<{ imageData: string, mimeType: string }> {
    try {
        const response = await callAiWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model,
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: { aspectRatio },
            }
        }));
        
        const imagePart = response.candidates?.[0]?.content.parts.find(p => p.inlineData);
        if (imagePart?.inlineData) {
            return {
                imageData: imagePart.inlineData.data,
                mimeType: imagePart.inlineData.mimeType,
            };
        }
    } catch (error) {
        console.error(`Image generation failed for model ${model}:`, error);
    }
    throw new Error("API did not return a valid image.");
}

export async function generateProductionImage(
    product: Product,
    stylePreset: StylePreset,
    aspectRatio: AspectRatio,
    imageSize: ImageSize,
    customInstruction?: string
): Promise<{ imageData: string; mimeType: string }> {
    const systemInstruction = DEFAULT_SYSTEM_INSTRUCTIONS.generateProductionImageWithSource
        .replace('{aspectRatio}', aspectRatio)
        .replace('{creativeDirection}', customInstruction || 'Follow the prompt DNA precisely.');

    const compiledPrompt = await compilePrompt(product, stylePreset);
    const fullLivePrompt = createFinalPrompt(compiledPrompt);
    
    const sourceImageBase64 = await ensureBase64(product.sourceImages[0].data);
    const mimeType = sourceImageBase64.substring(sourceImageBase64.indexOf(":") + 1, sourceImageBase64.indexOf(";"));

    try {
        const response = await callAiWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: sourceImageBase64.split(',')[1] } },
                    { text: fullLivePrompt }
                ]
            },
            config: {
                systemInstruction: systemInstruction,
                imageConfig: { aspectRatio, imageSize: imageSize }
            }
        }));

        const imagePart = response.candidates?.[0]?.content.parts.find(p => p.inlineData);
        if (imagePart?.inlineData) {
            return {
                imageData: imagePart.inlineData.data,
                mimeType: imagePart.inlineData.mimeType,
            };
        }
    } catch (error) {
        console.error("Gemini 3 Pro Image generation failed:", error);
    }
    
    throw new Error("API did not return a valid image.");
}

export async function refineGeneratedImage(
    originalImage: string,
    instruction: string,
    aspectRatio: AspectRatio,
    imageSize: ImageSize
): Promise<{ imageData: string; mimeType: string }> {
    const originalImageBase64 = await ensureBase64(originalImage);
    const mimeType = originalImageBase64.substring(originalImageBase64.indexOf(":") + 1, originalImageBase64.indexOf(";"));
    const systemInstruction = DEFAULT_SYSTEM_INSTRUCTIONS.refineGeneratedImage;

    try {
        const response = await callAiWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: originalImageBase64.split(',')[1] } },
                    { text: instruction }
                ]
            },
            config: {
                systemInstruction: systemInstruction,
                imageConfig: { aspectRatio, imageSize: imageSize }
            }
        }));
        const imagePart = response.candidates?.[0]?.content.parts.find(p => p.inlineData);
        if (imagePart?.inlineData) {
            return {
                imageData: imagePart.inlineData.data,
                mimeType: imagePart.inlineData.mimeType,
            };
        }
    } catch (error) {
        console.error("Image refinement failed:", error);
    }
    
    throw new Error("API did not return a valid refined image.");
}

export async function compilePrompt(product: Product, stylePreset: StylePreset): Promise<ModularPrompt> {
    const productDetails = `Name: ${product.name}, Description: ${product.description}, Use Case: ${product.dna?.bestUseCase}, Triggers: ${product.dna?.emotionalTriggers}`;
    const newPrompt = { ...stylePreset.prompt, product: productDetails };
    return newPrompt;
}

export const createFinalPrompt = (prompt: ModularPrompt): string => {
  return Object.entries(prompt)
    .map(([key, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return '';
      const keyName = key.replace(/([A-Z])/g, ' $1').trim();
      const formattedKey = keyName.charAt(0).toUpperCase() + keyName.slice(1);
      const formattedValue = Array.isArray(value) ? value.join(', ') : value;
      return `${formattedKey}: ${formattedValue}`;
    })
    .filter(Boolean)
    .join('. ');
};