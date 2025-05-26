
import { InterviewFormDialog } from "@/components/interviews/InterviewFormDialog";
import { Candidate, Interviewer } from "@/components/interviews/InterviewsTable";

interface InterviewManagementHeaderProps {
  candidates: Candidate[];
  interviewers: Interviewer[];
  onInterviewCreated: () => void;
}

export const InterviewManagementHeader = ({
  candidates,
  interviewers,
  onInterviewCreated,
}: InterviewManagementHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Interview Management</h1>
      <InterviewFormDialog 
        candidates={candidates}
        interviewers={interviewers}
        onInterviewCreated={onInterviewCreated}
      />
    </div>
  );
};
