
import { GoogleGenAI } from "@google/genai";

// IMPORTANT: The API key must be available as an environment variable.
// Do not hardcode the API key in the code.
// The execution environment is expected to provide `process.env.API_KEY`.
let ai: GoogleGenAI;
try {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
} catch (error) {
  console.error("Failed to initialize GoogleGenAI. Is API_KEY set?", error);
  // Handle initialization failure gracefully, maybe by disabling AI features.
}


export const generateEventGuidelines = async (prompt: string) => {
  if (!ai) {
    throw new Error("Gemini AI service is not available.");
  }
  
  const model = "gemini-2.5-flash";

  try {
    const responseStream = await ai.models.generateContentStream({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful assistant for a sports management app. Your responses should be formatted as clear, concise guidelines for sporting events.",
      }
    });

    // We need to return an async generator from this function
    return (async function*() {
      for await (const chunk of responseStream) {
        yield chunk.text;
      }
    })();

  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw new Error("Failed to generate AI content. Please try again.");
  }
};
