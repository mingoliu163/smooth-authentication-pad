
import { Candidate } from "@/components/interviews/InterviewsTable";

export const formatCandidatesForForm = (candidates: Candidate[]) => {
  return candidates.map(candidate => {
    const fullName = candidate.first_name || candidate.last_name ? 
      `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() : 
      candidate.name;
      
    return {
      id: candidate.id,
      name: fullName || candidate.email || "Unknown Candidate",
      email: candidate.email || "",
      user_id: candidate.user_id,
      first_name: candidate.first_name || "",
      last_name: candidate.last_name || ""
    };
  });
};

export const getValidCandidates = (formattedCandidates: ReturnType<typeof formatCandidatesForForm>) => {
  return formattedCandidates.filter(c => 
    c.name && c.name !== "Unknown Candidate" && c.name.trim() !== ""
  );
};
