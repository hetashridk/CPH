import { GenerateContentResponse } from '@google/genai';

const MAX_ATTEMPTS = 4; // 1 initial call + 3 retries
const RETRY_DELAY_MS = 1000;

/**
 * A helper for AI API calls that includes automatic retries for transient server errors.
 * It retries up to a maximum number of attempts with an increasing delay on 5xx and 429 errors.
 * @param apiCall The async function to call.
 * @returns A promise that resolves with the result of the API call.
 */
export async function callAiWithRetry<T>(apiCall: () => Promise<T>): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      lastError = error;
      const errorString = error ? error.toString().toLowerCase() : '';
      
      const isRateLimit = errorString.includes('429') || errorString.includes('resource_exhausted');
      // The 503 error from the user log includes a status of "UNAVAILABLE".
      const isServerError = errorString.includes('500') || errorString.includes('503') || errorString.includes('unavailable') || errorString.includes('502') || errorString.includes('504');

      // Only retry on specific transient errors. If we're on the last attempt, don't wait, just let it fail through to the error classification below.
      if ((isRateLimit || isServerError) && attempt < MAX_ATTEMPTS) {
        console.warn(`AI call failed on attempt ${attempt} with a transient error. Retrying in ${RETRY_DELAY_MS * attempt}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt)); // Basic exponential backoff
        continue; // Go to the next attempt in the loop
      }
      
      // If it's not a retryable error OR we've exhausted all retries, classify the error for a user-friendly message and throw.
      if (isRateLimit) {
        console.error("AI Service Error (Rate Limit):", error);
        throw new Error("Too many requests sent to the AI service. Please wait a moment before trying again.");
      }
      
      if (isServerError) {
        console.error("AI Service Error (Server Issue):", error);
        throw new Error("The AI service is currently experiencing temporary issues. Please try again in a few moments.");
      }

      // For all other errors (e.g., 400 Bad Request), log and re-throw the original.
      console.error("An unexpected AI service error occurred:", error);
      throw error;
    }
  }

  // This part is a fallback and should ideally not be reached, but it ensures we always throw a meaningful error.
  console.error(`AI call failed after ${MAX_ATTEMPTS - 1} retries.`, lastError);
  throw new Error("The AI service is currently experiencing temporary issues. Please try again in a few moments.");
}