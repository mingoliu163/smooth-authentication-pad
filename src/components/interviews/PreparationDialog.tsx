
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface PreparationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartInterview: (settings: any) => void;
  interview: any;
}

export const PreparationDialog = ({
  open,
  onOpenChange,
  onStartInterview,
  interview,
}: PreparationDialogProps) => {
  const [settings, setSettings] = useState({
    language: "english",
    interviewer_style: "friendly",
    stress_level: "normal",
    virtual_background: "office",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      console.log("Submitting interview preparation with settings:", settings);
      
      // Simply pass the settings to start the interview without any file operations
      onStartInterview(settings);
      
      toast.success("Interview preparation complete!");
    } catch (error) {
      console.error("Error in interview preparation:", error);
      toast.error("Failed to prepare interview. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prepare for AI Interview</DialogTitle>
          <DialogDescription>
            Configure your interview settings before starting the AI interview session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Interview Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => handleInputChange("language", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewer_style">Interviewer Style</Label>
              <Select
                value={settings.interviewer_style}
                onValueChange={(value) => handleInputChange("interviewer_style", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="tough">Challenging</SelectItem>
                  <SelectItem value="technical">Technical Focus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stress_level">Interview Intensity</Label>
              <Select
                value={settings.stress_level}
                onValueChange={(value) => handleInputChange("stress_level", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select intensity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Relaxed</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High Pressure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="virtual_background">Virtual Background</Label>
              <Select
                value={settings.virtual_background}
                onValueChange={(value) => handleInputChange("virtual_background", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select background" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="library">Library</SelectItem>
                  <SelectItem value="home">Home Office</SelectItem>
                  <SelectItem value="meeting-room">Meeting Room</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any specific areas you'd like to focus on during the interview..."
              value={settings.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Upload Resume (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  Resume upload feature will be available soon
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  The AI will use your interview settings to conduct the session
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Preparing..." : "Start Interview"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
