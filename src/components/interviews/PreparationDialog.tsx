
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PreparationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartInterview: (settings: any) => void;
  interview: any;
}

interface PrepFormValues {
  language: string;
  interviewer_style: string;
  stress_level: string;
  virtual_background: string;
}

export const PreparationDialog = ({
  open,
  onOpenChange,
  onStartInterview,
  interview,
}: PreparationDialogProps) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const form = useForm<PrepFormValues>({
    defaultValues: {
      language: "english",
      interviewer_style: "friendly",
      stress_level: "normal",
      virtual_background: interview?.settings?.environment || "office",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setResumeFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (values: PrepFormValues) => {
    try {
      // If a resume file is selected, upload it
      if (resumeFile && user) {
        setIsUploading(true);
        
        // Create storage bucket if it doesn't exist (this is handled by Supabase)
        const fileName = `${user.id}-${Date.now()}-${resumeFile.name}`;
        
        // Upload file
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, resumeFile);
        
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);
          
        // Update profile with resume URL
        if (urlData) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ resume_url: urlData.publicUrl })
            .eq('id', user.id);
            
          if (updateError) {
            console.error('Error updating profile with resume:', updateError);
          }
        }
      }
      
      // Combine interview settings with user preferences
      onStartInterview(values);
    } catch (error) {
      console.error('Error in interview preparation:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Interview Preparation</DialogTitle>
          <DialogDescription>
            Get ready for your interview by setting up your preferences.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-medium">Upload Resume</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Upload your latest resume for the interviewer to reference
                </p>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="resume">Resume</Label>
                  <input
                    id="resume"
                    type="file"
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold
                    file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                  />
                  <p className="text-xs text-gray-500">
                    Accepted formats: PDF, DOC, DOCX
                  </p>
                </div>
              </div>

              <Separator />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Interview Language</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="english" id="english" />
                          <Label htmlFor="english">English</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="chinese" id="chinese" />
                          <Label htmlFor="chinese">Chinese</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      Select the language for your interview
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interviewer_style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interviewer Style</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select interviewer style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="tough">Tough</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the interviewer's personality style
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stress_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stress Simulation Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select stress level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Set the interview pressure level
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="virtual_background"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Virtual Background</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select virtual background" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="conference">Conference Room</SelectItem>
                        <SelectItem value="library">Library</SelectItem>
                        <SelectItem value="startup">Startup Space</SelectItem>
                        <SelectItem value="home">Home Office</SelectItem>
                        <SelectItem value="outdoor">Outdoor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose your interview environment
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? "Preparing..." : "Start Interview"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
