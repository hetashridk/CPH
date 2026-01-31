import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { ai } from '../../core/api/ai';
import { callAiWithRetry } from '../../core/api/aiUtils';
import { ensureBase64 } from '../../core/utils/imageUtils';
import { VideoPromptDNA } from '../../core/types';

const EXPERT_VIDEO_PROMPT_SYSTEM_INSTRUCTION = `You are a Master Cinematographer and AI Film Director, an expert in using the Veo 3.1 model. Your task is to translate a user's creative concept into a hyper-detailed, 14-field Video Prompt DNA object for generating a world-class cinematic product video.

YOUR THOUGHT PROCESS:
1.  **DECONSTRUCT THE INPUT**:
    -   If an image is provided: Analyze its existing composition, lighting (key, fill, rim), mood, color palette, and subject placement. This is your 'reality'.
    -   Analyze the user's core idea (e.g., "make it feel epic," "a cozy morning vibe"). This is your 'intent'.

2.  **SYNTHESIZE & EXTRAPOLATE**:
    -   Bridge the static reality of the image with the dynamic intent of the idea. How does this scene come to life? What happens in the seconds *before* or *after* this frozen moment?
    -   Think in terms of motivated action. Why is the camera moving? What story is the subject's action telling? How does the light interact with the movement?

3.  **TRANSLATE TO VEO 3.1 LANGUAGE**:
    -   Convert cinematic concepts into rich, descriptive language that the AI model can interpret literally. Use professional filmmaking terminology. Be specific and evocative. Avoid ambiguity.

4.  **POPULATE THE DNA (Field-by-Field Guidance)**:
    -   **shotType**: Be precise. Is it a 'dutch angle medium shot' or a 'macro extreme close-up'?
    -   **cameraMovement**: Describe the path and quality. 'Slow, deliberate crane up revealing the product' is better than 'moves up'. Consider 'Jib shot', 'Steadicam tracking', 'Dolly zoom'.
    -   **cameraAngle**: Specify the relationship to the subject. 'Low-angle hero shot', 'Top-down flat lay'.
    -   **subjectAction**: Describe the physics and story. 'Condensation slowly trickles down the bottle', 'Fabric ripples gently in a phantom breeze'.
    -   **sceneDescription**: Paint a vivid picture of the entire scene, not just the subject. Mention background, foreground, and textural details.
    -   **lightingStyle**: Build upon the source image's light. Use terms like 'Volumetric light rays', 'Softbox key light', 'Rim lighting from a tungsten source', 'Caustic reflections'.
    -   **timeOfDay**: 'Golden hour sunrise', 'Overcast noon', 'Blue hour twilight'.
    -   **environment**: Be specific. 'A minimalist brutalist concrete atrium', 'A lush, misty Pacific Northwest forest floor'.
    -   **mood**: Use emotional and atmospheric keywords. 'Serene and contemplative', 'High-energy and triumphant', 'Mysterious and suspenseful'.
    -   **colorGrade**: Describe the color treatment. 'Desaturated film noir palette with deep blacks', 'Warm, nostalgic analog film tones', 'Vibrant, high-contrast cyberpunk neons'.
    -   **filmStock**: Specify the texture and look. 'Crisp Arri Alexa digital footage', 'Grainy Kodak Portra 400 35mm film look', '8mm vintage celluloid feel'.
    -   **fx**: Detail subtle, realistic effects. 'Subtle anamorphic lens flare', 'Wisps of dry ice smoke drift across the floor', 'Slow-motion water droplets hang in the air'.
    -   **duration**: A practical suggestion, e.g., '4-6 seconds'.
    -   **negativePrompt**: What to avoid to maintain quality. 'Avoid harsh shadows, no people, no text, not blurry, avoid oversaturation'.

**CRITICAL OUTPUT RULE**: Your entire response MUST be a single, valid JSON object conforming to the schema. Do not add any extra text, explanations, or markdown formatting.`;

// Fix: Define properties separately to avoid "used before declaration" error.
const videoDnaSchemaProperties = {
    shotType: { type: Type.STRING, description: "e.g., Extreme Close-Up, Long Shot, POV" },
    cameraMovement: { type: Type.STRING, description: "e.g., Static, Slow Pan Left, Crane Up, Dolly Zoom" },
    cameraAngle: { type: Type.STRING, description: "e.g., Eye-Level, High-Angle, Low-Angle" },
    subjectAction: { type: Type.STRING, description: "Action of the main subject. e.g., 'Product rotates slowly', 'A hand reaches for the product'" },
    sceneDescription: { type: Type.STRING, description: "Detailed description of the scene and background elements." },
    lightingStyle: { type: Type.STRING, description: "e.g., 'Soft, diffused morning light', 'Dramatic Rembrandt lighting', 'Neon backlighting'" },
    timeOfDay: { type: Type.STRING, description: "e.g., Golden Hour, Mid-day, Blue Hour, Night" },
    environment: { type: Type.STRING, description: "Overall environment. e.g., 'Misty forest floor', 'Minimalist concrete studio', 'Cozy cafe'" },
    mood: { type: Type.STRING, description: "The emotional tone. e.g., 'Serene and peaceful', 'Energetic and vibrant', 'Mysterious and moody'" },
    colorGrade: { type: Type.STRING, description: "e.g., 'Warm and desaturated vintage tones', 'Cool, high-contrast cyberpunk palette'" },
    filmStock: { type: Type.STRING, description: "e.g., 'Kodak Portra 400 film grain', 'Crisp digital look', '8mm vintage feel'" },
    fx: { type: Type.STRING, description: "Special effects. e.g., 'Subtle lens flare', 'Light smoke drifting', 'Slow-motion water droplets'" },
    duration: { type: Type.STRING, description: "Suggested shot duration. e.g., '3-5 seconds'" },
    negativePrompt: { type: Type.STRING, description: "Elements to avoid. e.g., 'No people, no text, avoid oversaturation'" },
};

const videoDnaSchema = {
    type: Type.OBJECT,
    properties: videoDnaSchemaProperties,
    required: Object.keys(videoDnaSchemaProperties)
};

export async function generateCreativeVideoIdeas(image: { imageData: string, prompt: any, productName: string }): Promise<string[]> {
    const systemInstruction = `You are an expert Creative Director. Analyze the provided product image and its original generation prompt. Brainstorm 10 distinct, cinematic, and engaging video shot ideas that could be created from this static image. Focus on creative concepts, camera work, and mood. Your response must be a valid JSON array of 10 strings.`;

    const imageB64 = await ensureBase64(image.imageData);
    const mimeType = imageB64.substring(imageB64.indexOf(":") + 1, imageB64.indexOf(";"));
    const cleanB64 = imageB64.split(',')[1];
    
    const response = await callAiWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: { parts: [
            { text: `Product Name: ${image.productName}` },
            { text: `Original Image Prompt Context: ${JSON.stringify(image.prompt)}` },
            { inlineData: { mimeType, data: cleanB64 } }
        ]},
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
    }));
    
    if (!response.text) throw new Error("AI failed to generate creative ideas.");
    return JSON.parse(response.text);
}

export async function generateVideoDna(
    productName: string, 
    idea: string, 
    image?: { imageData: string }
): Promise<VideoPromptDNA> {
    
    const contents: any[] = [
        { text: `Product Name: ${productName}` },
        { text: `Creative Idea to execute: "${idea}"` }
    ];

    if (image) {
        const imageB64 = await ensureBase64(image.imageData);
        const mimeType = imageB64.substring(imageB64.indexOf(":") + 1, imageB64.indexOf(";"));
        const cleanB64 = imageB64.split(',')[1];
        contents.push({ inlineData: { mimeType, data: cleanB64 } });
    }

    const response = await callAiWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: { parts: contents },
        config: {
            systemInstruction: EXPERT_VIDEO_PROMPT_SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: videoDnaSchema
        }
    }));

    if (!response.text) throw new Error("AI failed to generate Video Prompt DNA.");
    return JSON.parse(response.text);
}

async function generateVideo(
    prompt: string,
    config: { aspectRatio: string, resolution: string },
    image?: { imageData: string }
): Promise<Blob> {
    // 1. Check/Request API Key
    const win = window as any;
    if (win.aistudio) {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            try {
                await win.aistudio.openSelectKey();
            } catch (e) {
                console.error("Failed to open key selector", e);
                throw new Error("API Key selection failed or was cancelled.");
            }
        }
    }

    // 2. Initialize AI with the (potentially new) environment key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 3. Prepare generation payload
    const payload: any = {
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
            numberOfVideos: 1,
            resolution: config.resolution,
            aspectRatio: config.aspectRatio,
        }
    };

    if (image) {
        const base64Image = await ensureBase64(image.imageData);
        const mimeType = base64Image.substring(base64Image.indexOf(":") + 1, base64Image.indexOf(";"));
        const cleanBase64 = base64Image.split(',')[1];
        payload.image = { imageBytes: cleanBase64, mimeType };
    }

    // 4. Start Operation
    console.log("Starting Veo video generation...");
    let operation = await ai.models.generateVideos(payload);

    // 5. Poll for completion
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        console.log("Polling video generation status...");
        try {
            operation = await ai.operations.getVideosOperation({ operation: operation });
        } catch (e) {
            console.error("Polling failed", e);
            throw new Error("Failed to check video generation status.");
        }
    }

    if (operation.error) {
        console.error("Video generation operation error:", operation.error);
        throw new Error(`Video generation failed: ${operation.error.message || 'Unknown error'}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        console.error("Complete Operation Object:", JSON.stringify(operation, null, 2));
        throw new Error("Generation completed but no download link was provided. The result might have been filtered due to safety settings.");
    }

    // 6. Fetch the video blob
    const videoUrlWithKey = `${downloadLink}&key=${process.env.API_KEY}`;
    const response = await fetch(videoUrlWithKey);
    if (!response.ok) {
        throw new Error(`Failed to download generated video: ${response.statusText}`);
    }

    return await response.blob();
}

export const generateVideoFromImage = (imageData: string, prompt: string, config: { aspectRatio: string, resolution: string }) => 
    generateVideo(prompt, config, { imageData });

export const generateVideoFromText = (prompt: string, config: { aspectRatio: string, resolution: string }) => 
    generateVideo(prompt, config);