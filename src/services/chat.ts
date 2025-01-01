import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

let genAI: GoogleGenerativeAI;
let model: any;

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

const getRecentMessages = async (userId: string, limit = 10) => {
  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  
  return messages || [];
};

const getUserContext = async (userId: string) => {
  const { data: context } = await supabase
    .from("user_context")
    .select("*")
    .eq("user_id", userId)
    .single();
  
  return context;
};

const saveMessage = async (
  userId: string,
  content: string,
  isAi: boolean,
  contextId: string
) => {
  await supabase.from("chat_messages").insert({
    id: uuidv4(),
    user_id: userId,
    content,
    is_ai: isAi,
    context_id: contextId,
    created_at: new Date().toISOString(),
  });
};

const updateUserContext = async (
  userId: string,
  newPreferences: Record<string, any>
) => {
  const { data: existingContext } = await supabase
    .from("user_context")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (existingContext) {
    await supabase
      .from("user_context")
      .update({
        learned_preferences: {
          ...existingContext.learned_preferences,
          ...newPreferences,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  } else {
    await supabase.from("user_context").insert({
      id: uuidv4(),
      user_id: userId,
      learned_preferences: newPreferences,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
};

export const generateResponse = async (
  message: string,
  settings: AISettings,
  userId: string
) => {
  try {
    console.log("Generating response with context...");
    
    // Get recent message history
    const recentMessages = await getRecentMessages(userId);
    const userContext = await getUserContext(userId);
    
    // Build context-aware prompt
    const contextualPrompt = `
      ${settings.systemInstructions}
      
      Previous context:
      ${recentMessages.map(msg => `${msg.is_ai ? 'AI' : 'User'}: ${msg.content}`).join('\n')}
      
      User preferences and learned patterns:
      ${JSON.stringify(userContext?.learned_preferences || {})}
      
      ${settings.promptPrefix}${message}
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: contextualPrompt }] }],
      generationConfig: {
        temperature: settings.temperature,
      },
    });

    const response = await result.response;
    const responseText = response.text();
    
    // Save the conversation to Supabase
    const contextId = uuidv4();
    await saveMessage(userId, message, false, contextId);
    await saveMessage(userId, responseText, true, contextId);
    
    // Update user context with any learned information
    // This is a simple example - you might want to implement more sophisticated learning
    await updateUserContext(userId, {
      lastInteractionTopic: message.toLowerCase().includes("javascript") ? "programming" : "general",
      interactionCount: (userContext?.learned_preferences?.interactionCount || 0) + 1,
    });

    return responseText;
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
};