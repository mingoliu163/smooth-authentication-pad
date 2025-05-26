
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/layouts/AdminLayout";
import { InterviewsListCard } from "@/components/interviews/InterviewsListCard";
import { InterviewManagementHeader } from "@/components/interviews/InterviewManagementHeader";
import { useInterviewData } from "@/hooks/useInterviewData";
import { formatCandidatesForForm, getValidCandidates } from "@/utils/candidateUtils";

const InterviewManagement = () => {
  const { isAdmin, isHR } = useAuth();
  const {
    interviews,
    candidates,
    interviewers,
    exams,
    isLoading,
    fetchData
  } = useInterviewData();

  if (!(isAdmin() || isHR())) {
    return null;
  }

  // Create a formatted candidates array with combined name property for InterviewFormDialog
  const formattedCandidates = formatCandidatesForForm(candidates);
  const validCandidates = getValidCandidates(formattedCandidates);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <InterviewManagementHeader
          candidates={validCandidates.length > 0 ? validCandidates : formattedCandidates}
          interviewers={interviewers}
          onInterviewCreated={fetchData}
        />

        <InterviewsListCard 
          isLoading={isLoading}
          interviews={interviews}
          candidates={formattedCandidates}
          interviewers={interviewers}
          exams={exams}
          onRefresh={fetchData}
        />
      </div>
    </AdminLayout>
  );
};

export default InterviewManagement;
