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

  // Update local state when prop changes
  useEffect(() => {
    setEditInterview(interview);
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Interview</DialogTitle>
          <DialogDescription>
            Update the interview details and assignments
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleUpdateInterview}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Interview"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
