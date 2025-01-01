export type ChatMessage = {
  id: string;
  user_id: string;
  content: string;
  is_ai: boolean;
  created_at: string;
  context_id: string;
}

export type UserContext = {
  id: string;
  user_id: string;
  learned_preferences: Record<string, any>;
  system_instructions: string;
  created_at: string;
  updated_at: string;
}