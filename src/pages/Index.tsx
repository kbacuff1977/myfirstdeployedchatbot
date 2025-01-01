import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { initializeChat, generateResponse } from "@/services/chat";
import { useToast } from "@/components/ui/use-toast";
import { ApiKeyDialog } from "@/components/ApiKeyDialog";
import { Button } from "@/components/ui/button";
import { Key, LogOut } from "lucide-react";
import { AISettingsDialog } from "@/components/AISettingsDialog";
import { supabase } from "@/lib/supabase";

interface Message {
  content: string;
  isAi: boolean;
}

interface AISettings {
  systemInstructions: string;
  promptPrefix: string;
  temperature: number;
}

const defaultSettings: AISettings = {
  systemInstructions: "",
  promptPrefix: "",
  temperature: 0.7,
};

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [settings, setSettings] = useState<AISettings>(() => {
    const saved = localStorage.getItem("aiSettings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const apiKey = localStorage.getItem("GEMINI_API_KEY");
    if (apiKey) {
      initializeChat(apiKey);
    } else {
      setShowApiKeyDialog(true);
    }
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("GEMINI_API_KEY");
    localStorage.removeItem("userEmail");
    navigate("/signin");
  };

  const handleSendMessage = async (content: string) => {
    const apiKey = localStorage.getItem("GEMINI_API_KEY");
    if (!apiKey) {
      setShowApiKeyDialog(true);
      return;
    }

    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      toast({
        title: "Error",
        description: "You must be signed in to send messages.",
        variant: "destructive",
      });
      return;
    }

    setMessages((prev) => [...prev, { content, isAi: false }]);
    setIsLoading(true);

    try {
      const response = await generateResponse(content, settings, user.data.user.id);
      setMessages((prev) => [...prev, { content: response, isAi: true }]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h1 className="text-lg font-semibold">Emmy's SengineAI</h1>
        <div className="flex gap-2">
          <AISettingsDialog settings={settings} onSave={setSettings} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowApiKeyDialog(true)}
          >
            <Key className="mr-2 h-4 w-4" />
            API Key
          </Button>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            content={message.content}
            isAi={message.isAi}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      <ApiKeyDialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog} />
    </div>
  );
};

export default Index;