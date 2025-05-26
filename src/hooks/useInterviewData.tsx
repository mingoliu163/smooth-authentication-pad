
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Interview, Candidate, Interviewer, Exam } from "@/components/interviews/InterviewsTable";

export const useInterviewData = () => {
  const { user, isAdmin, isHR } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
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

      // Fetch interviews with proper relationships and settings
      const { data: interviewsData, error: interviewsError } = await supabase
        .from("interviews")
        .select(`
          *,
          candidates:candidate_id (id, name, email, user_id),
          profiles:interviewer_id (id, first_name, last_name)
        `)
        .order("date", { ascending: false });

      if (interviewsError) throw interviewsError;

      // Strategy for job seekers
      // 1. Get candidates table data (legacy approach)
      const { data: candidatesData, error: candidatesError } = await supabase
        .from("candidates")
        .select("id, name, email, user_id");

      if (candidatesError) {
        console.error("Error fetching candidates:", candidatesError);
      }

      // 2. Get profiles with job_seeker role
      const { data: jobSeekerProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, role")
        .eq("role", "job_seeker");

      if (profilesError) {
        console.error("Error fetching job seeker profiles:", profilesError);
      }

      // Combine both sources
      const allCandidates: Candidate[] = [];
      
      // Add candidates from candidates table
      if (candidatesData) {
        candidatesData.forEach(candidate => {
          // If the candidate has a user_id, find matching profile
          const profile = candidate.user_id && jobSeekerProfiles ? 
            jobSeekerProfiles.find(p => p.id === candidate.user_id) : null;
          
          allCandidates.push({
            id: candidate.id,
            name: candidate.name || "",
            email: candidate.email || "",
            user_id: candidate.user_id,
            first_name: profile?.first_name || null,
            last_name: profile?.last_name || null
          });
        });
      }
      
      // Add job seekers that might not have a candidate record
      if (jobSeekerProfiles) {
        jobSeekerProfiles.forEach(profile => {
          // Check if this profile is already included via candidates table
          const existingCandidate = allCandidates.find(c => c.user_id === profile.id);
          
          if (!existingCandidate) {
            // Need to create a new candidate record for this job seeker
            allCandidates.push({
              id: profile.id, // Use profile ID temporarily
              name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unnamed',
              email: '', // We don't have email from profiles table
              user_id: profile.id,
              first_name: profile.first_name || "",
              last_name: profile.last_name || ""
            });
          }
        });
      }

      // Ensure we don't have empty names
      const validatedCandidates = allCandidates.map(candidate => {
        if (!candidate.name || candidate.name.trim() === "") {
          candidate.name = candidate.email ? candidate.email.split("@")[0] : "Unknown Candidate";
        }
        return candidate;
      });

      // Fetch potential interviewers (HR and admin users)
      const { data: interviewersData, error: interviewersError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .or("role.eq.hr,role.eq.admin")
        .eq("approved", true);

      if (interviewersError) {
        console.error("Error fetching interviewers:", interviewersError);
        setInterviewers([]);
      } else {
        const formattedInterviewers: Interviewer[] = (interviewersData || []).map(interviewer => ({
          id: interviewer.id,
          first_name: interviewer.first_name || "",
          last_name: interviewer.last_name || "",
          email: "", // Since profiles doesn't have email, we provide an empty string
          name: `${interviewer.first_name || ''} ${interviewer.last_name || ''}`.trim() || "Unnamed Interviewer"
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
          candidate_name: interview.candidate_name || (candidate?.name || "Unknown"),
          interviewer_id: interviewer?.id || null,
          interviewer_name: interviewer ? 
            `${interviewer.first_name || ""} ${interviewer.last_name || ""}`.trim() || "Unnamed Interviewer" : 
            null,
          position: interview.position,
          status: interview.status,
          user_id: interview.user_id || candidate?.user_id || null,
          settings: interview.settings || {}
        };
      });

      setJobs(jobsData || []);
      setInterviews(formattedInterviews);
      setCandidates(validatedCandidates);
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

  return {
    interviews,
    jobs,
    candidates,
    interviewers,
    exams,
    isLoading,
    fetchData
  };
};
