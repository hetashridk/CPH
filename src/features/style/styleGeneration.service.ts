import { Type, GenerateContentResponse, Modality } from '@google/genai';
import { ai } from '../../core/api/ai';
import { callAiWithRetry } from '../../core/api/aiUtils';
import { ensureBase64 } from '../../core/utils/imageUtils';
import type { Product, ModularPrompt, StylePreset } from '../../core/types';
import { DEFAULT_SYSTEM_INSTRUCTIONS } from '../settings/systemPrompts';

// Helper to safely load an image or return null if it fails
const tryLoadImage = async (url: string | undefined): Promise<string | null> => {
    if (!url) return null;
    try {
        const b64 = await ensureBase64(url);
        return b64.split(',')[1];
    } catch (e) {
        console.warn("Could not load context image for style generation, proceeding with text only.", url);
        return null;
    }
};

// Common schema for the new Prompt DNA structure
const promptSchema = {
    type: Type.OBJECT,
    properties: {
        goal: { type: Type.STRING },
        product: { type: Type.STRING },
        subject: { type: Type.STRING },
        storyline: { type: Type.STRING },
        mentalCamera: { type: Type.STRING },
        lighting: { type: Type.STRING },
        surfacesMaterials: { type: Type.STRING },
        environment: { type: Type.STRING },
        realism: { type: Type.ARRAY, items: { type: Type.STRING } },
        styleDNA: { type: Type.STRING },
        colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
        imperfections: { type: Type.ARRAY, items: { type: Type.STRING } },
        negativePrompting: { type: Type.STRING }
    },
    required: ["goal", "product", "subject", "storyline", "mentalCamera", "lighting", "surfacesMaterials", "environment", "realism", "styleDNA", "colorPalette", "imperfections", "negativePrompting"]
};

export async function generatePromptFromIdea(product: Product, userIdea: string, refImage: string | null): Promise<ModularPrompt> {
    const systemInstruction = DEFAULT_SYSTEM_INSTRUCTIONS.generatePromptFromIdea;
    const contents: any[] = [{ text: `Generate a detailed Prompt DNA.` }];
    contents.push({ text: `Product Context: ${product.name} - ${product.description}` });
    
    const productSourceB64 = await tryLoadImage(product.sourceImages[0]?.data);
    if (productSourceB64) {
        contents.push({ inlineData: { mimeType: 'image/jpeg', data: productSourceB64 } });
    }
    
    if (userIdea.trim()) contents.push({ text: `User Idea: ${userIdea}` });
    if (refImage) {
        const refImageB64 = await tryLoadImage(refImage);
        if (refImageB64) {
            contents.push({ text: `Visual Style Reference Image:` }, { inlineData: { mimeType: 'image/jpeg', data: refImageB64 } });
        }
    }
    
    const response = await callAiWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: contents },
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: promptSchema
        }
    }));
    
    if (!response.text) throw new Error("AI generated empty response.");
    return JSON.parse(response.text);
}

export async function generateStyleFromBatch(product: Product, styleImageData: string): Promise<ModularPrompt> {
    const systemInstruction = DEFAULT_SYSTEM_INSTRUCTIONS.generateStyleFromBatch;
    
    const productSourceB64 = await tryLoadImage(product.sourceImages[0]?.data);
    const styleImageB64 = await tryLoadImage(styleImageData);

    if (!styleImageB64) {
        throw new Error("Failed to load reference image for style generation.");
    }

    const contents: any[] = [
        { text: `Generate a detailed Prompt DNA from the reference image.` },
        { text: `Product Context: ${product.name} - ${product.description}` },
    ];

    if (productSourceB64) {
        contents.push({ inlineData: { mimeType: 'image/jpeg', data: productSourceB64 } });
    }
    
    contents.push({ text: `Visual Style Reference Image:` });
    contents.push({ inlineData: { mimeType: 'image/jpeg', data: styleImageB64 } });

    const response = await callAiWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: contents },
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: promptSchema
        }
    }));
    
    if (!response.text) throw new Error("AI generated empty response.");
    return JSON.parse(response.text);
}

export async function generateStylePresetName(prompt: ModularPrompt): Promise<string> {
    try {
        const response = await callAiWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${DEFAULT_SYSTEM_INSTRUCTIONS.generateStylePresetName} ${JSON.stringify(prompt, null, 2)}`
        }));
        return response.text ? response.text.trim().replace(/"/g, '') : "Untitled Style";
    } catch (error) {
        console.error("Style preset naming failed:", error);
        throw error;
    }
}

export async function createStylePresetFromIdea(
    product: Product,
    idea: string
): Promise<Omit<StylePreset, 'id'>> {
    const systemInstruction = DEFAULT_SYSTEM_INSTRUCTIONS.createStylePresetFromIdea;
    
    const contents: any[] = [{ text: `Product Context: ${product.name} - ${product.description}` }];
    
    const productSourceB64 = await tryLoadImage(product.sourceImages[0]?.data);
    if (productSourceB64) {
        contents.push({ inlineData: { mimeType: 'image/jpeg', data: productSourceB64 } });
    }

    contents.push({ text: `Creative Idea: ${idea}` });

    const response = await callAiWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: contents },
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    prompt: promptSchema // Use common schema
                },
                required: ["name", "prompt"]
            }
        }
    }));
    
    if (!response.text) throw new Error("AI generated empty response.");
    const result = JSON.parse(response.text);
    return { ...result, referenceImages: [], status: 'pending_image' };
}

export async function generateStylePresetsFromDirection(
    products: Product[],
    direction: string,
    count: number,
    industry?: string
): Promise<Omit<StylePreset, 'id' | 'status'>[]> {
    let systemInstruction = `You are an Expert AI Creative Director. Conceptualize ${count} distinct, high-quality Style Presets using the following PROMPT DNA STRUCTURE.
    
**PROMPT DNA SPECIFICATION:**
1. **goal**: What is the specific Goal to generate this image?
2. **product**: Product details. (Generic placeholder like "The featured product").
3. **subject**: The Character Persona and Mood and Expression and Action Details.
4. **storyline**: What the photo shot narrate as a story what emotion it should evoke.
5. **mentalCamera**: which camera to be used with what lens and what lens filter and what should be the iso, shutter speed, aperture details.
6. **lighting**: what kind of lighting is needed to create the photograph.
7. **surfacesMaterials**: what surfaces and materials is to be used for the scene.
8. **environment**: enviorment and ambience details and real life fx and other elemental details.
9. **realism**: (Array) keywords to create hyper realistic, ultra realistic images.
10. **styleDNA**: the style details of the photograph we want to generate.
11. **colorPalette**: (Array) the color palette that should justify the above details to create a really good quality and highly relatable for the desired outcome.
12. **imperfections**: (Array) keywords for adding imperfection for avoiding the ai generated look or feel.
13. **negativePrompting**: keywords which can share what should not be in the generation based on the above info.

**CRITICAL RULES:**
- **\`product\`**: **NON-NEGOTIABLE RULE.** Do NOT describe the specific product. Use generic placeholders.
- Populate all DNA fields with rich, professional terms based on the specifications above.

**OUTPUT FORMAT:**
Clean JSON array of objects. Each object has "name" and "prompt".`;

    if (industry === 'Real Estate') {
        systemInstruction += "\n\n**INDUSTRY OVERRIDE: REAL ESTATE**\nFor Real Estate, the 'product' is the property itself.";
    }

    const productInfo = products.map(p => `${p.name}: ${p.description}`).join('\n');
    const contents: any[] = [
        { text: `Generate ${count} style presets.` },
        { text: `Product Context: ${productInfo}` },
        { text: `Creative Direction: ${direction}` }
    ];
    
    if (products.length > 0 && products[0].sourceImages.length > 0) {
         const firstImgB64 = await tryLoadImage(products[0].sourceImages[0].data);
         if (firstImgB64) {
             contents.push({ inlineData: { mimeType: 'image/jpeg', data: firstImgB64 } });
         }
    }

    const response = await callAiWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: contents },
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        prompt: promptSchema
                    },
                    required: ["name", "prompt"]
                }
            }
        }
    }));

    if (!response.text) throw new Error("AI generated empty response.");
    const parsed = JSON.parse(response.text);
    // Return objects without status or ID, letting the Modal logic assign those based on context
    return parsed.map((p: any) => ({ ...p, referenceImages: [] }));
}

export async function generateReferenceImageForPreset(prompt: ModularPrompt, systemInstruction: string, subject: string = "a sleek minimalist white ceramic bottle on a pedestal"): Promise<string> {
    const fullLivePrompt = Object.entries(prompt).map(([key, value]) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return '';
        const keyName = key.replace('Details', '').replace(/([A-Z])/g, ' $1').trim();
        const formattedKey = keyName.charAt(0).toUpperCase() + keyName.slice(1);
        const formattedValue = Array.isArray(value) ? value.join(', ') : value;
        return `${formattedKey}: ${formattedValue}`;
    }).filter(Boolean).join('. ');

    const finalPrompt = `${systemInstruction.replace('{subject}', subject)} ${fullLivePrompt}`;

    try {
        const response = await callAiWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash-image', // Efficient preview model, approx 512-1024px depending on aspect ratio
            contents: { parts: [{ text: finalPrompt }] },
            config: {
                imageConfig: {
                    aspectRatio: '1:1'
                }
            }
        }));

        const imagePart = response.candidates?.[0]?.content.parts.find(p => p.inlineData);
        if (imagePart?.inlineData?.data) {
            return imagePart.inlineData.data;
        }
    } catch (error) {
        console.error("Gemini 2.5 Flash Image preview failed:", error);
    }

    throw new Error("API did not return an image for the style preset.");
}