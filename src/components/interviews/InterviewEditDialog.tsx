
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Interview, Candidate, Interviewer } from "./InterviewsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface InterviewEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interview: Interview | null;
  candidates: Candidate[];
  interviewers: Interviewer[];
  onSuccess: () => void;
}

export const InterviewEditDialog = ({
  open,
  onOpenChange,
  interview,
  candidates,
  interviewers,
  onSuccess,
}: InterviewEditDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editInterview, setEditInterview] = useState<Interview | null>(interview);
  const [candidatesWithProfiles, setCandidatesWithProfiles] = useState<Candidate[]>([]);
  const [currentTab, setCurrentTab] = useState("basic");
  const [interviewSettings, setInterviewSettings] = useState({
    ai_technical_test: false,
    personality_test: false,
    interview_mode: 'video',
    experience_level: 'mid',
    interview_type: 'technical',
    environment: 'office',
    lighting: 'day',
    notes: '',
  });

  // Update local state when prop changes
  useEffect(() => {
    setEditInterview(interview);
    if (interview?.settings) {
      setInterviewSettings({
        ai_technical_test: interview.settings.ai_technical_test || false,
        personality_test: interview.settings.personality_test || false,
        interview_mode: interview.settings.interview_mode || 'video',
        experience_level: interview.settings.experience_level || 'mid',
        interview_type: interview.settings.interview_type || 'technical',
        environment: interview.settings.environment || 'office',
        lighting: interview.settings.lighting || 'day',
        notes: interview.settings.notes || '',
      });
    }
  }, [interview]);

  // Fetch candidate profiles when candidates or open state changes
  useEffect(() => {
    const fetchCandidateProfiles = async () => {
      if (!open || candidates.length === 0) return;
      
      try {
        // Get user_ids from candidates that have them
        const userIds = candidates
          .filter(c => c.user_id)
          .map(c => c.user_id);
        
        if (userIds.length === 0) {
          setCandidatesWithProfiles(candidates);
          return;
        }
        
        // Fetch profiles for these user_ids
        const { data: profilesData, error } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", userIds);
          
        if (error) throw error;
        
        // Map profiles to candidates
        const enhancedCandidates = candidates.map(candidate => {
          if (!candidate.user_id) return candidate;
          
          const matchingProfile = profilesData?.find(
            profile => profile.id === candidate.user_id
          );
          
          if (!matchingProfile) return candidate;
          
          return {
            ...candidate,
            first_name: matchingProfile.first_name,
            last_name: matchingProfile.last_name
          };
        });
        
        setCandidatesWithProfiles(enhancedCandidates);
      } catch (error) {
        console.error("Error fetching candidate profiles:", error);
        setCandidatesWithProfiles(candidates);
      }
    };
    
    fetchCandidateProfiles();
  }, [open, candidates]);

  const handleUpdateInterview = async () => {
    try {
      setIsSubmitting(true);

      if (!editInterview) return;

      const { data, error } = await supabase
        .from("interviews")
        .update({
          date: editInterview.date,
          candidate_id: editInterview.candidate_id,
          interviewer_id: editInterview.interviewer_id,
          position: editInterview.position,
          status: editInterview.status,
          settings: interviewSettings
        })
        .eq("id", editInterview.id)
        .select();

      if (error) throw error;

      toast.success("Interview updated successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error updating interview:", error);
      toast.error(error.message || "Failed to update interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCandidateDisplayName = (candidate: Candidate) => {
    // If candidate has profile data (first_name, last_name), use that
    if (candidate.first_name || candidate.last_name) {
      const fullName = `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim();
      return fullName ? `${fullName} (${candidate.email})` : candidate.email;
    }
    
    // Otherwise fall back to just the name or email
    return candidate.name || candidate.email;
  };

  const getFullName = (firstName: string | null, lastName: string | null, email: string) => {
    const name = `${firstName || ""} ${lastName || ""}`.trim();
    return name || email;
  };

  if (!editInterview) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Interview</DialogTitle>
          <DialogDescription>
            Update the interview details and assignments
          </DialogDescription>
        </DialogHeader>
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="tests">Test Options</TabsTrigger>
            <TabsTrigger value="settings">Interview Settings</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-position" className="text-right">
                Position
              </Label>
              <Input
                id="edit-position"
                value={editInterview.position}
                onChange={(e) =>
                  setEditInterview({
                    ...editInterview,
                    position: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-candidate" className="text-right">
                Candidate
              </Label>
              <Select
                value={editInterview.candidate_id}
                onValueChange={(value) =>
                  setEditInterview({
                    ...editInterview,
                    candidate_id: value,
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select candidate" />
                </SelectTrigger>
                <SelectContent>
                  {candidatesWithProfiles.map((candidate) => (
                    <SelectItem key={candidate.id} value={candidate.id}>
                      {getCandidateDisplayName(candidate)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-interviewer" className="text-right">
                Interviewer
              </Label>
              <Select
                value={editInterview.interviewer_id || "none"}
                onValueChange={(value) =>
                  setEditInterview({
                    ...editInterview,
                    interviewer_id: value === "none" ? null : value,
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select interviewer (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {interviewers.map((interviewer) => (
                    <SelectItem key={interviewer.id} value={interviewer.id}>
                      {getFullName(
                        interviewer.first_name,
                        interviewer.last_name,
                        interviewer.email
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-date" className="text-right">
                Date & Time
              </Label>
              <Input
                id="edit-date"
                type="datetime-local"
                value={editInterview.date}
                onChange={(e) =>
                  setEditInterview({
                    ...editInterview,
                    date: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Status
              </Label>
              <Select
                value={editInterview.status}
                onValueChange={(value) =>
                  setEditInterview({
                    ...editInterview,
                    status: value,
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="tests" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ai_technical_test"
                checked={interviewSettings.ai_technical_test}
                onCheckedChange={(checked) =>
                  setInterviewSettings({
                    ...interviewSettings,
                    ai_technical_test: checked === true,
                  })
                }
              />
              <label
                htmlFor="ai_technical_test"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                AI Technical Test
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="personality_test"
                checked={interviewSettings.personality_test}
                onCheckedChange={(checked) =>
                  setInterviewSettings({
                    ...interviewSettings,
                    personality_test: checked === true,
                  })
                }
              />
              <label
                htmlFor="personality_test"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Personality Test
              </label>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interview_mode" className="text-right">
                Interview Mode
              </Label>
              <Select
                value={interviewSettings.interview_mode}
                onValueChange={(value) =>
                  setInterviewSettings({
                    ...interviewSettings,
                    interview_mode: value,
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select interview mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="experience_level" className="text-right">
                Experience Level
              </Label>
              <Select
                value={interviewSettings.experience_level}
                onValueChange={(value) =>
                  setInterviewSettings({
                    ...interviewSettings,
                    experience_level: value,
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                  <SelectItem value="leadership">Leadership Position</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interview_type" className="text-right">
                Interview Type
              </Label>
              <Select
                value={interviewSettings.interview_type}
                onValueChange={(value) =>
                  setInterviewSettings({
                    ...interviewSettings,
                    interview_type: value,
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select interview type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="panel">Panel Interview</SelectItem>
                  <SelectItem value="case">Case Interview</SelectItem>
                  <SelectItem value="informational">Informational</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right pt-2">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={interviewSettings.notes}
                onChange={(e) =>
                  setInterviewSettings({
                    ...interviewSettings,
                    notes: e.target.value,
                  })
                }
                placeholder="Additional notes about the interview"
                className="col-span-3"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="environment" className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="environment" className="text-right">
                Environment
              </Label>
              <Select
                value={interviewSettings.environment}
                onValueChange={(value) =>
                  setInterviewSettings({
                    ...interviewSettings,
                    environment: value,
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
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
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lighting" className="text-right">
                Lighting
              </Label>
              <Select
                value={interviewSettings.lighting}
                onValueChange={(value) =>
                  setInterviewSettings({
                    ...interviewSettings,
                    lighting: value,
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select lighting" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4">
          <div className="flex justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <div className="space-x-2">
              {currentTab !== "basic" && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (currentTab === "tests") {
                      setCurrentTab("basic");
                    } else if (currentTab === "settings") {
                      setCurrentTab("tests");
                    } else if (currentTab === "environment") {
                      setCurrentTab("settings");
                    }
                  }}
                >
                  Previous
                </Button>
              )}
              
              {currentTab !== "environment" ? (
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
              ) : (
                <Button
                  type="submit"
                  onClick={handleUpdateInterview}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Interview"}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
