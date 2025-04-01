
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

      // Fetch interviews with proper relationships
      const { data: interviewsData, error: interviewsError } = await supabase
        .from("interviews")
        .select(`
          *,
          candidates:candidate_id (id, name, email),
          profiles:interviewer_id (id, first_name, last_name)
        `)
        .order("date", { ascending: false });

      if (interviewsError) throw interviewsError;

      // Fetch candidates (job seekers)
      const { data: candidatesData, error: candidatesError } = await supabase
        .from("candidates")
        .select("id, name, email");

      if (candidatesError) {
        console.error("Error fetching candidates:", candidatesError);
        setCandidates([]);
      } else {
        // Transform the candidates data to match the Candidate interface
        const formattedCandidates: Candidate[] = (candidatesData || []).map(candidate => ({
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          first_name: null,  // Add these properties to match the Candidate interface
          last_name: null    // Add these properties to match the Candidate interface
        }));
        setCandidates(formattedCandidates);
      }

      // Fetch potential interviewers (HR and admin users)
      const { data: interviewersData, error: interviewersError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .or("role.eq.hr,role.eq.admin")
        .eq("approved", true);

      if (interviewersError) {
        console.error("Error fetching interviewers:", interviewersError);
        setInterviewers([]);
      } else {
        const formattedInterviewers: Interviewer[] = (interviewersData || []).map(interviewer => ({
          id: interviewer.id,
          email: interviewer.email || "",
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

      // Format the interviews data with proper relationship handling
      const formattedInterviews: Interview[] = (interviewsData || []).map((interview: any) => {
        const candidate = interview.candidates;
        const interviewer = interview.profiles;
        
        return {
          id: interview.id,
          date: interview.date,
          candidate_id: candidate?.id || "",
          candidate_name: candidate?.name || interview.candidate_name || "Unknown",
          interviewer_id: interviewer?.id || null,
          interviewer_name: interviewer ? 
            `${interviewer.first_name || ""} ${interviewer.last_name || ""}`.trim() || "Unnamed Interviewer" : 
            null,
          position: interview.position,
          status: interview.status,
        };
      });

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
