import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI;
let model: any;
let chat: any;

interface AISettings {
  systemInstructions: string;
  promptPrefix: string;
  temperature: number;
}

export const initializeChat = (apiKey: string) => {
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: "gemini-pro" });
  console.log("Chat initialized with Gemini");
};

export const generateResponse = async (
  message: string,
  settings: AISettings
) => {
  try {
    const prompt = `${settings.systemInstructions}\n\n${settings.promptPrefix}${message}`;
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: settings.temperature,
      },
    });
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
};