
import { Type, GenerateContentResponse } from '@google/genai';
import { ai } from '../../core/api/ai';
import { callAiWithRetry } from '../../core/api/aiUtils';
import { BrandDNA, Industry } from '../../core/types';
import { DEFAULT_SYSTEM_INSTRUCTIONS } from '../settings/systemPrompts';

export async function analyzeBrandFromUrl(urlOrName: string): Promise<{ dna: BrandDNA, brandName: string, industry: Industry }> {
    try {
        // Use Gemini 2.5 Flash for cost-effective analysis with Search Grounding
        const response = await callAiWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the following brand website or name: "${urlOrName}"`,
            config: {
                systemInstruction: DEFAULT_SYSTEM_INSTRUCTIONS.analyzeBrandFromUrl,
                tools: [{ googleSearch: {} }],
            },
        }));

        if (!response.text) {
            throw new Error("AI generated an empty response for brand analysis.");
        }
        
        // The model is now instructed to return ONLY JSON, so we can parse directly.
        // We'll add a simple cleanup for potential markdown fences as a safeguard.
        let jsonString = response.text.trim();
        
        // Robust cleanup for markdown code blocks
        if (jsonString.startsWith('```')) {
             jsonString = jsonString.replace(/^```(json)?\s*/i, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(jsonString);
        
        // Directly use the AI's determined industry, fallback to 'Unknown' if missing.
        const industry: Industry = parsed.industry || 'Creative Exploration';

        return {
            brandName: parsed.brandName || "Unknown Brand",
            industry: industry,
            dna: {
                brandEssence: parsed.brandEssence || "",
                targetAudience: parsed.targetAudience || "",
                visualStyle: Array.isArray(parsed.visualStyle) ? parsed.visualStyle : [],
                toneOfVoice: Array.isArray(parsed.toneOfVoice) ? parsed.toneOfVoice : [],
            }
        };

    } catch (error) {
        console.error("Brand analysis failed:", error);
        if (error instanceof SyntaxError) {
             throw new Error(`The AI returned an invalid data structure. Please try again.`);
        }
        throw error;
    }
}
