
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/layouts/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { InterviewFormDialog } from "@/components/interviews/InterviewFormDialog";
import { InterviewsListCard } from "@/components/interviews/InterviewsListCard";

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

interface Job {
  id: string;
  title: string;
  company: string;
}

interface Candidate {
  id: string;
  name: string;
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

interface Exam {
  id: string;
  title: string;
  difficulty: string;
  category: string;
}

const InterviewManagement = () => {
  const { user, isAdmin, isHR } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title, company");

      if (jobsError) throw jobsError;

      // Fetch interviews with candidate and interviewer names
      const { data: interviewsData, error: interviewsError } = await supabase
        .from("interviews")
        .select(`
          *,
          candidates:candidate_id (email, first_name, last_name),
          interviewers:interviewer_id (email, first_name, last_name)
        `)
        .order("date", { ascending: false });

      if (interviewsError) throw interviewsError;

      // Fetch candidates (job seekers)
      const { data: candidatesData, error: candidatesError } = await supabase
        .from("candidates")
        .select("id, name, email");

      if (candidatesError) {
        console.error("Error fetching candidates:", candidatesError);
        // Set default empty array if there's an error
        setCandidates([]);
      } else {
        // Set candidates data if successful
        setCandidates(candidatesData || []);
      }

      // Fetch potential interviewers (HR and admin users)
      const { data: interviewersData, error: interviewersError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .or("role.eq.hr,role.eq.admin")
        .eq("approved", true);

      if (interviewersError) {
        console.error("Error fetching interviewers:", interviewersError);
        // Set default empty array if there's an error
        setInterviewers([]);
      } else {
        // Format interviewers data to include email (even though we don't have it from profiles)
        const formattedInterviewers: Interviewer[] = (interviewersData || []).map(interviewer => ({
          id: interviewer.id,
          email: "", // Since we don't have email in profiles, setting to empty string
          first_name: interviewer.first_name,
          last_name: interviewer.last_name
        }));
        setInterviewers(formattedInterviewers);
      }

      // Fetch all available exams
      const { data: examsData, error: examsError } = await supabase
        .from("exam_bank")
        .select("id, title, difficulty, category");

      if (examsError) throw examsError;

      // Format the interviews data
      const formattedInterviews: Interview[] = interviewsData.map((interview: any) => ({
        id: interview.id,
        date: interview.date,
        candidate_id: interview.candidate_id,
        candidate_name: interview.candidates
          ? `${interview.candidates.first_name || ""} ${
              interview.candidates.last_name || ""
            }`.trim() || interview.candidates.email
          : interview.candidate_name || "Unknown",
        interviewer_id: interview.interviewer_id,
        interviewer_name: interview.interviewers
          ? `${interview.interviewers.first_name || ""} ${
              interview.interviewers.last_name || ""
            }`.trim() || interview.interviewers.email
          : null,
        position: interview.position,
        status: interview.status,
      }));

      setJobs(jobsData || []);
      setInterviews(formattedInterviews);
      setExams(examsData || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load interview data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!(isAdmin() || isHR())) {
      return;
    }
    fetchData();
  }, [isAdmin, isHR, user?.id]);

  // Create a formatted candidates array with name property for InterviewFormDialog
  const formattedCandidates = candidates.map(candidate => ({
    id: candidate.id,
    name: candidate.name || `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || candidate.email,
    email: candidate.email
  }));

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Interview Management</h1>
          <InterviewFormDialog 
            candidates={formattedCandidates}
            interviewers={interviewers}
            onInterviewCreated={fetchData}
          />
        </div>

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
