import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatMessageProps {
  content: string;
  isAi: boolean;
}

export const ChatMessage = ({ content, isAi }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full items-start gap-2 animate-fade-in",
        isAi ? "flex-row" : "flex-row-reverse"
      )}
    >
      <Avatar className={cn("h-8 w-8", isAi ? "bg-secondary" : "bg-primary")}>
        <AvatarFallback className="text-background">
          {isAi ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
          isAi
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        {content}
      </div>
    </div>
  );
};