
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  created_at: string;
}

interface JobApplication {
  id: string;
  user_id: string;
  job_id: string;
  status: string;
  created_at: string;
  job?: {
    title: string;
    company: string;
  };
}

interface Interview {
  id: string;
  date: string;
  candidate_id?: string;
  candidate_name: string;
  position: string;
  status: string;
}

export interface DashboardData {
  jobs: Job[];
  applications: JobApplication[];
  interviews: Interview[];
  isLoading: boolean;
}

export const useJobSeekerDashboard = (refreshTrigger = 0): DashboardData => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        if (!user) return;
        
        // Fetch recommended jobs
        const { data: jobsData, error: jobsError } = await supabase
          .from("jobs")
          .select("*")
          .limit(5);
        
        if (jobsError) throw jobsError;
        
        // Fetch interviews for this candidate using EXACT email match only
        console.log("Fetching interviews for user:", user.id, user.email);
        
        if (!user.email) {
          console.error("User email is missing");
          setInterviews([]);
          setIsLoading(false);
          return;
        }
        
        // Method: Using candidate_name exact match (email)
        const { data: interviewsData, error: interviewsError } = await supabase
          .from("interviews")
          .select("*")
          .eq("candidate_name", user.email)
          .order("date", { ascending: true });
        
        if (interviewsError) {
          console.error("Error fetching interviews:", interviewsError);
          toast.error("Failed to load interview data");
          setInterviews([]);
        } else {
          console.log(`Found ${interviewsData?.length || 0} interviews for ${user.email}`);
          setInterviews(interviewsData || []);
        }
        
        // Since there's no applications table, we can create a mock or placeholder
        const mockApplications: JobApplication[] = [];
        
        setJobs(jobsData || []);
        setApplications(mockApplications);
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user, refreshTrigger]);

  return { jobs, applications, interviews, isLoading };
};
