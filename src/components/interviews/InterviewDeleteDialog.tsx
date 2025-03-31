
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InterviewDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interviewId: string | null;
  onSuccess: () => void;
}

export const InterviewDeleteDialog = ({
  open,
  onOpenChange,
  interviewId,
  onSuccess,
}: InterviewDeleteDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteInterview = async () => {
    try {
      setIsSubmitting(true);

      if (!interviewId) return;

      // First remove any exam assignments
      const { error: examLinkError } = await supabase
        .from("interview_exams")
        .delete()
        .eq("interview_id", interviewId);

      if (examLinkError) throw examLinkError;

      // Then delete the interview
      const { error } = await supabase
        .from("interviews")
        .delete()
        .eq("id", interviewId);

      if (error) throw error;

      toast.success("Interview deleted successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error deleting interview:", error);
      toast.error(error.message || "Failed to delete interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this interview? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteInterview}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Deleting..." : "Delete Interview"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
