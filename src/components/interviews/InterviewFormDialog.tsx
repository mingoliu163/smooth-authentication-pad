
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarIcon, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface InterviewFormDialogProps {
  onInterviewCreated: () => void;
  candidates: Array<{
    id: string;
    name: string;
    email: string;
    user_id?: string;
    first_name?: string;
    last_name?: string;
  }>;
  interviewers: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

interface InterviewFormValues {
  candidate_id: string;
  position: string;
  date: Date;
  interviewer_id?: string;
  // New fields
  ai_technical_test: boolean;
  personality_test: boolean;
  interview_mode: string;
  experience_level: string;
  interview_type: string;
  environment: string;
  lighting: string;
  notes: string;
}

export const InterviewFormDialog = ({ 
  onInterviewCreated, 
  candidates,
  interviewers = [] 
}: InterviewFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState("basic");

  const form = useForm<InterviewFormValues>({
    defaultValues: {
      candidate_id: '',
      position: '',
      date: new Date(),
      interviewer_id: 'none',
      ai_technical_test: false,
      personality_test: false,
      interview_mode: 'video',
      experience_level: 'mid',
      interview_type: 'technical',
      environment: 'office',
      lighting: 'day',
      notes: '',
    },
  });

  const onSubmit = async (data: InterviewFormValues) => {
    try {
      setIsSubmitting(true);

      // Validate that a candidate is selected
      if (!data.candidate_id) {
        throw new Error("Please select a candidate for the interview.");
      }

      // Validate that a position is entered
      if (!data.position || data.position.trim() === '') {
        throw new Error("Please enter a position for the interview.");
      }

      // Get candidate from the candidates array
      const selectedCandidate = candidates.find(c => c.id === data.candidate_id);
      
      if (!selectedCandidate) {
        throw new Error("Selected candidate not found. Please select a valid candidate.");
      }
      
      // Determine candidate name with proper fallbacks
      let candidateName = "";
      
      // First priority: use the name field if it exists and is not empty
      if (selectedCandidate.name && selectedCandidate.name.trim() !== '') {
        candidateName = selectedCandidate.name.trim();
      }
      // Second priority: construct from first_name and last_name
      else if (selectedCandidate.first_name || selectedCandidate.last_name) {
        const firstName = selectedCandidate.first_name?.trim() || '';
        const lastName = selectedCandidate.last_name?.trim() || '';
        candidateName = `${firstName} ${lastName}`.trim();
      }
      // Third priority: use email prefix
      else if (selectedCandidate.email && selectedCandidate.email.trim() !== '') {
        candidateName = selectedCandidate.email.split('@')[0];
      }
      
      // Final validation - ensure we have a valid candidate name
      if (!candidateName || candidateName.trim() === '') {
        throw new Error("Cannot determine candidate name. Please ensure the candidate has a valid name or email.");
      }

      console.log("Selected candidate:", selectedCandidate);
      console.log("Determined candidate name:", candidateName);
      
      // Format date for Supabase
      const formattedDate = data.date.toISOString();
      
      // Interview settings to be saved as metadata
      const interviewSettings = {
        ai_technical_test: data.ai_technical_test,
        personality_test: data.personality_test,
        interview_mode: data.interview_mode,
        experience_level: data.experience_level,
        interview_type: data.interview_type,
        environment: data.environment,
        lighting: data.lighting,
        notes: data.notes,
      };

      // Check if this candidate exists in the candidates table
      // If not, create a record to ensure the trigger works correctly
      const { data: existingCandidate, error: candidateCheckError } = await supabase
        .from('candidates')
        .select('id, name')
        .eq('id', data.candidate_id)
        .maybeSingle();

      if (candidateCheckError) {
        console.error("Error checking candidate:", candidateCheckError);
      }

      // If candidate doesn't exist in candidates table, create one
      if (!existingCandidate) {
        console.log("Creating candidate record for:", candidateName);
        const { error: candidateInsertError } = await supabase
          .from('candidates')
          .insert({
            id: data.candidate_id,
            name: candidateName,
            email: selectedCandidate.email || '',
            user_id: selectedCandidate.user_id || null,
            position: data.position,
            status: 'Active',
            applied_date: new Date().toISOString(),
            avatar_url: '',
            tags: []
          });

        if (candidateInsertError) {
          console.error("Error creating candidate:", candidateInsertError);
          // Don't throw here as we can still proceed with explicit candidate_name
        }
      }

      // Prepare the interview data with explicit candidate_name
      // This ensures the trigger will work correctly
      const interviewData = {
        candidate_id: data.candidate_id,
        candidate_name: candidateName, // Explicitly set this
        interviewer_id: data.interviewer_id === 'none' ? null : data.interviewer_id,
        position: data.position.trim(),
        date: formattedDate,
        status: 'Scheduled',
        settings: interviewSettings,
        user_id: selectedCandidate.user_id || null
      };

      console.log("Interview data to insert:", interviewData);

      // Insert new interview
      const { data: result, error } = await supabase
        .from('interviews')
        .insert(interviewData)
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Interview created successfully:", result);
      toast.success('Interview scheduled successfully');
      form.reset();
      setOpen(false);
      onInterviewCreated();
    } catch (error: any) {
      console.error('Error creating interview:', error);
      toast.error(error.message || 'Failed to schedule interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Interview
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Schedule New Interview</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="tests">Test Options</TabsTrigger>
                <TabsTrigger value="settings">Interview Settings</TabsTrigger>
                <TabsTrigger value="environment">Environment</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <FormField
                  control={form.control}
                  name="candidate_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Candidate</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select candidate" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {candidates.map((candidate) => (
                            <SelectItem key={candidate.id} value={candidate.id}>
                              {candidate.name} {candidate.email && `(${candidate.email})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="interviewer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interviewer (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select interviewer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {interviewers.map((interviewer) => (
                            <SelectItem key={interviewer.id} value={interviewer.id}>
                              {interviewer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input placeholder="Job position" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Interview Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP HH:mm")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                          <div className="p-3 border-t border-border">
                            <Input
                              type="time"
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(':');
                                const newDate = new Date(field.value);
                                newDate.setHours(parseInt(hours, 10));
                                newDate.setMinutes(parseInt(minutes, 10));
                                field.onChange(newDate);
                              }}
                              defaultValue={format(field.value, "HH:mm")}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="tests" className="space-y-4">
                <FormField
                  control={form.control}
                  name="ai_technical_test"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>AI Technical Test</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="personality_test"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Personality Test</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <FormField
                  control={form.control}
                  name="interview_mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interview Mode</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select interview mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="experience_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI Interviewer Experience Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="mid">Mid Level</SelectItem>
                          <SelectItem value="senior">Senior Level</SelectItem>
                          <SelectItem value="leadership">Leadership Position</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="interview_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interview Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select interview type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="behavioral">Behavioral</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="panel">Panel Interview</SelectItem>
                          <SelectItem value="case">Case Interview</SelectItem>
                          <SelectItem value="informational">Informational</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes about the interview"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="environment" className="space-y-4">
                <FormField
                  control={form.control}
                  name="environment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Environment</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select environment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="startup">Startup</SelectItem>
                          <SelectItem value="cafe">Cafe</SelectItem>
                          <SelectItem value="conference">Conference Room</SelectItem>
                          <SelectItem value="library">Library</SelectItem>
                          <SelectItem value="home">Home Office</SelectItem>
                          <SelectItem value="outdoor">Outdoor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lighting"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lighting</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select lighting" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="day">Day</SelectItem>
                          <SelectItem value="night">Night</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-between pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  if (currentTab === "basic") {
                    setOpen(false);
                  } else if (currentTab === "tests") {
                    setCurrentTab("basic");
                  } else if (currentTab === "settings") {
                    setCurrentTab("tests");
                  } else if (currentTab === "environment") {
                    setCurrentTab("settings");
                  }
                }}
              >
                {currentTab === "basic" ? "Cancel" : "Back"}
              </Button>
              
              <div className="space-x-2">
                {currentTab !== "environment" && (
                  <Button 
                    type="button"
                    onClick={() => {
                      if (currentTab === "basic") {
                        setCurrentTab("tests");
                      } else if (currentTab === "tests") {
                        setCurrentTab("settings");
                      } else if (currentTab === "settings") {
                        setCurrentTab("environment");
                      }
                    }}
                  >
                    Next
                  </Button>
                )}
                
                {currentTab === "environment" && (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Scheduling...' : 'Schedule Interview'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
