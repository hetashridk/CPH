
import { Type, GenerateContentResponse } from '@google/genai';
import { ai } from '../../core/api/ai';
import { callAiWithRetry } from '../../core/api/aiUtils';
import { ensureBase64 } from '../../core/utils/imageUtils';
import type { Product, ProductDNA } from '../../core/types';

interface AnalysisResult {
    name: string;
    description: string;
    dimensions: Product['dimensions'];
    dna: ProductDNA;
}

// Helper for schema definition to avoid repetition
const commonResponseSchema = {
    type: Type.OBJECT,
    properties: {
        productName: { type: Type.STRING },
        productDescription: { type: Type.STRING },
        bestUseCase: { type: Type.STRING },
        emotionalTriggers: { type: Type.STRING },
        productDimensions: {
            type: Type.OBJECT,
            properties: {
                width: { type: Type.NUMBER },
                height: { type: Type.NUMBER },
                depth: { type: Type.NUMBER },
                unit: { type: Type.STRING }
            },
            required: ["width", "height", "depth", "unit"]
        }
    },
    required: ["productName", "productDescription", "bestUseCase", "emotionalTriggers", "productDimensions"]
};

// Map the AI JSON response to our application type
const mapResponseToProduct = (parsed: any): AnalysisResult => ({
    name: parsed.productName,
    description: parsed.productDescription,
    dimensions: parsed.productDimensions,
    dna: {
        bestUseCase: parsed.bestUseCase,
        emotionalTriggers: parsed.emotionalTriggers
    }
});

/**
 * Unified Product Analysis
 * Dynamically selects the best prompting strategy based on the industry keywords.
 */
export async function analyzeProduct(productImages: string[], industry: string, direction?: string): Promise<AnalysisResult> {
    if (productImages.length === 0) throw new Error("No images provided for analysis.");

    try {
        const base64Images = await Promise.all(productImages.map(img => ensureBase64(img)));
        const imageParts = base64Images.map(imgData => ({ inlineData: { mimeType: 'image/jpeg', data: imgData.split(',')[1] } }));
        
        // 1. Determine Context based on Industry Keywords
        const ind = industry.toLowerCase();
        let role = `You are an expert product analyst in the ${industry} industry.`;
        let specificFocus = "";

        if (ind.includes('food') || ind.includes('beverage') || ind.includes('snack') || ind.includes('drink') || ind.includes('nutrition')) {
            // Food & Beverage Logic
            specificFocus = `
            2. **Description**: Describe the product, packaging visuals, flavor cues, and any visible key ingredients.
            3. **Best Use Case**: (e.g. "On-the-go snacking", "Gourmet cooking").
            `;
        } else if (ind.includes('estate') || ind.includes('property') || ind.includes('architect') || ind.includes('home')) {
            // Real Estate / Home Logic
            specificFocus = `
            2. **Description**: Describe the architectural style, interior design, materials, and ambiance.
            3. **Best Use Case**: Who is this space for? (e.g. "Growing family", "Urban professional").
            `;
        } else if (ind.includes('fashion') || ind.includes('apparel') || ind.includes('wear')) {
            // Fashion Logic
            specificFocus = `
            2. **Description**: Focus on fabric, fit, drape, and key design details (stitching, hardware).
            3. **Best Use Case**: Occasion (e.g. "Casual weekend", "Formal gala").
            `;
        } else {
            // Generic / Tech / Other
            specificFocus = `
            2. **Description**: Focus on material, shape, color, functionality, and key features.
            3. **Best Use Case**: How is this product best used?
            `;
        }

        // 2. Construct Dynamic Prompt
        let promptText = `${role} Analyze these images to create a comprehensive Product DNA. Provide:
1. **SEO Friendly Product Name**: A concise, accurate, and search-optimized title.
${specificFocus}
4. **Emotional Triggers**: What emotion triggers the purchase? (e.g., "Nostalgia", "Status", "Comfort").
5. **Dimensions**: Estimate real-world dimensions (width, height, depth).
${direction ? `User guidance: "${direction}"` : ''}
Your response MUST be a single, valid JSON object.`;

        // 3. Call AI
        const response = await callAiWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [...imageParts, { text: promptText }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: commonResponseSchema
            },
        }));
        
        if (!response.text) throw new Error("AI generated empty response.");
        return mapResponseToProduct(JSON.parse(response.text));

    } catch (error) {
        console.error(`Product analysis failed for industry: ${industry}`, error);
        throw error;
    }
}

export async function autoGroupImages(images: { data: string }[]): Promise<{ groupName: string; indices: number[] }[]> {
    const base64Images = await Promise.all(images.map(img => ensureBase64(img.data)));
    const imageParts = base64Images.map(b64 => ({ inlineData: { mimeType: 'image/jpeg', data: b64.split(',')[1] } }));
    const response = await callAiWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [{ text: `Analyze these product images. Group images that show the exact same physical product from different angles. Return a JSON array of objects. Each object should represent a group and have a "groupName" (e.g., "product_1") and an "indices" array containing the indices of the images in that group.` }, ...imageParts] },
        config: {
            responseMimeType: "application/json",
            responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { groupName: { type: Type.STRING }, indices: { type: Type.ARRAY, items: { type: Type.INTEGER } } }, required: ["groupName", "indices"] } }
        }
    }));
    
    if (!response.text) throw new Error("AI generated empty response.");
    return JSON.parse(response.text);
}

export async function autoCategorizeProducts(productsToCategorize: Product[]): Promise<{ productId: string, category: string }[]> {
    const productInfoForAI = productsToCategorize.map(p => ({ id: p.id, name: p.name, description: p.description }));
    const response = await callAiWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `For each product in this JSON list, suggest a concise, one or two-word category name. Group similar products into the same category. Return the result as a JSON array of objects, each with "productId" and "category". Product list: ${JSON.stringify(productInfoForAI)}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        productId: { type: Type.STRING },
                        category: { type: Type.STRING },
                    },
                    propertyOrdering: ["productId", "category"],
                },
            },
        }
    }));
    if (!response.text) throw new Error("AI generated empty response.");
    return JSON.parse(response.text);
}
