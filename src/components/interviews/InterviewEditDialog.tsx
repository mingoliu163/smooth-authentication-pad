
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

interface InterviewEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interview: Interview | null;
  candidates: Candidate[];
  interviewers: Interviewer[];
  onSuccess: () => void;
}

interface Interview {
  id: string;
  date: string;
  candidate_id: string;
  candidate_name: string;
  interviewer_id: string | null;
  interviewer_name: string | null;
  position: string;
  status: string;
}

interface Candidate {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface Interviewer {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
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

  // Update local state when prop changes
  useEffect(() => {
    setEditInterview(interview);
  }, [interview]);

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
                {candidates.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {getFullName(
                      candidate.first_name,
                      candidate.last_name,
                      candidate.email
                    )}
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
              value={editInterview.interviewer_id || ""}
              onValueChange={(value) =>
                setEditInterview({
                  ...editInterview,
                  interviewer_id: value || null,
                })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select interviewer (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
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
