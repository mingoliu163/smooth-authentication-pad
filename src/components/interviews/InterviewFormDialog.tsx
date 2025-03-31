
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { PlusCircle } from "lucide-react";

interface InterviewFormDialogProps {
  candidates: Candidate[];
  interviewers: Interviewer[];
  onSuccess: () => void;
  trigger?: React.ReactNode;
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

export const InterviewFormDialog = ({
  candidates,
  interviewers,
  onSuccess,
  trigger,
}: InterviewFormDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newInterview, setNewInterview] = useState({
    date: "",
    candidate_id: "",
    interviewer_id: "",
    position: "",
    status: "Scheduled",
  });

  const handleCreateInterview = async () => {
    try {
      setIsSubmitting(true);

      if (!newInterview.candidate_id) {
        toast.error("Please select a candidate");
        return;
      }

      if (!newInterview.date) {
        toast.error("Please set an interview date");
        return;
      }

      if (!newInterview.position) {
        toast.error("Please enter a position title");
        return;
      }

      // Get candidate information for notification
      const candidate = candidates.find(c => c.id === newInterview.candidate_id);
      const candidateName = candidate 
        ? `${candidate.first_name || ""} ${candidate.last_name || ""}`.trim() || candidate.email
        : "the candidate";

      // Create the interview
      const { data, error } = await supabase
        .from("interviews")
        .insert({
          date: newInterview.date,
          candidate_id: newInterview.candidate_id,
          interviewer_id: newInterview.interviewer_id || null,
          position: newInterview.position,
          status: newInterview.status,
        })
        .select();

      if (error) throw error;

      toast.success(`Interview scheduled for ${candidateName}`);
      
      // Reset the form
      setNewInterview({
        date: "",
        candidate_id: "",
        interviewer_id: "",
        position: "",
        status: "Scheduled",
      });
      
      // Refresh the interviews list
      onSuccess();
    } catch (error: any) {
      console.error("Error creating interview:", error);
      toast.error(error.message || "Failed to create interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFullName = (firstName: string | null, lastName: string | null, email: string) => {
    const name = `${firstName || ""} ${lastName || ""}`.trim();
    return name || email;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Schedule Interview
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule New Interview</DialogTitle>
          <DialogDescription>
            Create a new interview session and assign a candidate and interviewer.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="position" className="text-right">
              Position
            </Label>
            <Input
              id="position"
              value={newInterview.position}
              onChange={(e) =>
                setNewInterview({
                  ...newInterview,
                  position: e.target.value,
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="candidate" className="text-right">
              Candidate
            </Label>
            <Select
              value={newInterview.candidate_id}
              onValueChange={(value) =>
                setNewInterview({
                  ...newInterview,
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
            <Label htmlFor="interviewer" className="text-right">
              Interviewer
            </Label>
            <Select
              value={newInterview.interviewer_id}
              onValueChange={(value) =>
                setNewInterview({
                  ...newInterview,
                  interviewer_id: value,
                })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select interviewer (optional)" />
              </SelectTrigger>
              <SelectContent>
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
            <Label htmlFor="date" className="text-right">
              Date & Time
            </Label>
            <Input
              id="date"
              type="datetime-local"
              value={newInterview.date}
              onChange={(e) =>
                setNewInterview({
                  ...newInterview,
                  date: e.target.value,
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              value={newInterview.status}
              onValueChange={(value) =>
                setNewInterview({
                  ...newInterview,
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
            type="submit"
            onClick={handleCreateInterview}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Scheduling..." : "Schedule Interview"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
