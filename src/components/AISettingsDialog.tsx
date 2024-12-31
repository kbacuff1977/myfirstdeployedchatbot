import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings } from "lucide-react";
import { useState } from "react";

interface AISettings {
  systemInstructions: string;
  promptPrefix: string;
  temperature: number;
}

export const AISettingsDialog = ({
  settings,
  onSave,
}: {
  settings: AISettings;
  onSave: (settings: AISettings) => void;
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSave(localSettings);
    localStorage.setItem("aiSettings", JSON.stringify(localSettings));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          AI Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Configuration</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="systemInstructions">System Instructions</Label>
            <Textarea
              id="systemInstructions"
              placeholder="Enter system instructions for the AI..."
              value={localSettings.systemInstructions}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  systemInstructions: e.target.value,
                })
              }
              className="h-32"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="promptPrefix">Prompt Prefix</Label>
            <Input
              id="promptPrefix"
              placeholder="Optional prefix for all prompts..."
              value={localSettings.promptPrefix}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  promptPrefix: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="temperature">
              Temperature ({localSettings.temperature})
            </Label>
            <Input
              id="temperature"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={localSettings.temperature}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  temperature: parseFloat(e.target.value),
                })
              }
            />
          </div>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};