import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { initializeChat, generateResponse } from "@/services/chat";
import { useToast } from "@/components/ui/use-toast";
import { ApiKeyDialog } from "@/components/ApiKeyDialog";
import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";

interface Message {
  content: string;
  isAi: boolean;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  const handleSendMessage = async (content: string) => {
    const apiKey = localStorage.getItem("GEMINI_API_KEY");
    if (!apiKey) {
      setShowApiKeyDialog(true);
      return;
    }

    setMessages((prev) => [...prev, { content, isAi: false }]);
    setIsLoading(true);

    try {
      const response = await generateResponse(content);
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
        <h1 className="text-lg font-semibold">Gemini Chat</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowApiKeyDialog(true)}
        >
          <Key className="mr-2 h-4 w-4" />
          API Key
        </Button>
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
      <ApiKeyDialog
        open={showApiKeyDialog}
        onOpenChange={setShowApiKeyDialog}
      />
    </div>
  );
};

export default Index;