
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AssignExamsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interviewId: string | null;
  availableExams: Exam[];
  onSuccess: () => void;
}

interface Exam {
  id: string;
  title: string;
  difficulty: string;
  category: string;
}

export const AssignExamsDialog = ({
  open,
  onOpenChange,
  interviewId,
  availableExams,
  onSuccess,
}: AssignExamsDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedExams, setSelectedExams] = useState<string[]>([]);

  useEffect(() => {
    const fetchAssignedExams = async () => {
      if (!interviewId) return;
      
      try {
        const { data, error } = await supabase
          .from("interview_exams")
          .select("exam_id")
          .eq("interview_id", interviewId);

        if (error) throw error;

        const assignedExamIds = data?.map((item) => item.exam_id) || [];
        setSelectedExams(assignedExamIds);
      } catch (error: any) {
        console.error("Error fetching assigned exams:", error);
        toast.error("Failed to load exam assignments");
      }
    };

    if (open && interviewId) {
      fetchAssignedExams();
    }
  }, [open, interviewId]);

  const handleAssignExams = async () => {
    try {
      setIsSubmitting(true);

      if (!interviewId) return;

      // First remove all existing exam assignments
      const { error: deleteError } = await supabase
        .from("interview_exams")
        .delete()
        .eq("interview_id", interviewId);

      if (deleteError) throw deleteError;

      // Then add the new assignments
      if (selectedExams.length > 0) {
        const examAssignments = selectedExams.map((examId) => ({
          interview_id: interviewId,
          exam_id: examId,
        }));

        const { error: insertError } = await supabase
          .from("interview_exams")
          .insert(examAssignments);

        if (insertError) throw insertError;
      }

      toast.success("Exams assigned successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error assigning exams:", error);
      toast.error(error.message || "Failed to assign exams");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Assessment Exams</DialogTitle>
          <DialogDescription>
            Select exams to assign to this interview. The candidate will be able to
            complete these assessments when they log in.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            {availableExams.map((exam) => (
              <div key={exam.id} className="flex items-start space-x-3 p-2 border rounded-md">
                <Checkbox
                  id={exam.id}
                  checked={selectedExams.includes(exam.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedExams([...selectedExams, exam.id]);
                    } else {
                      setSelectedExams(selectedExams.filter((id) => id !== exam.id));
                    }
                  }}
                />
                <div className="space-y-1">
                  <Label htmlFor={exam.id} className="font-medium">
                    {exam.title}
                  </Label>
                  <div className="flex space-x-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      exam.difficulty === "Beginner" ? "bg-green-100 text-green-800" :
                      exam.difficulty === "Intermediate" ? "bg-blue-100 text-blue-800" :
                      "bg-purple-100 text-purple-800"
                    }`}>
                      {exam.difficulty}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      exam.category === "Technical" ? "bg-indigo-100 text-indigo-800" :
                      "bg-amber-100 text-amber-800"
                    }`}>
                      {exam.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
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
            onClick={handleAssignExams}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Assigning..." : "Assign Exams"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
