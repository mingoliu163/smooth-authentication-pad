
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { InterviewFormDialog } from "./InterviewFormDialog";

interface EmptyInterviewStateProps {
  candidates: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  interviewers: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  onSuccess: () => void;
}

export const EmptyInterviewState = ({
  candidates,
  interviewers,
  onSuccess,
}: EmptyInterviewStateProps) => {
  return (
    <div className="text-center p-8 border rounded-lg bg-gray-50">
      <Calendar className="mx-auto h-10 w-10 text-gray-400 mb-2" />
      <h3 className="text-lg font-medium">No interviews scheduled</h3>
      <p className="text-gray-600 mb-4">
        Schedule your first interview to get started
      </p>
      <InterviewFormDialog
        candidates={candidates}
        interviewers={interviewers}
        onInterviewCreated={onSuccess}
      />
    </div>
  );
};
