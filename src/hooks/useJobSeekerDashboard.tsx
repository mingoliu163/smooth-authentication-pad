
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

export const useJobSeekerDashboard = (): DashboardData => {
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
        
        // Fetch interviews for this candidate
        console.log("Fetching interviews for user:", user.id, user.email);
        
        // First attempt: Using candidate_id exact match
        let { data: interviewsByIdData, error: interviewsByIdError } = await supabase
          .from("interviews")
          .select("*")
          .eq("candidate_id", user.id)
          .order("date", { ascending: true });
        
        console.log("Interviews by candidate_id:", interviewsByIdData?.length || 0);
        
        // Second attempt: Using candidate_name exact match (email)
        let { data: interviewsByNameData, error: interviewsByNameError } = await supabase
          .from("interviews")
          .select("*")
          .eq("candidate_name", user.email)
          .order("date", { ascending: true });
        
        console.log("Interviews by candidate_name with email:", interviewsByNameData?.length || 0);
        
        // Third attempt: Using candidate_name with pattern match (could be just first name, etc)
        let { data: interviewsByPartialNameData, error: interviewsByPartialNameError } = 
          user.email ? await supabase
            .from("interviews")
            .select("*")
            .ilike("candidate_name", `%${user.email.split("@")[0]}%`)
            .order("date", { ascending: true })
          : { data: null, error: null };
            
        console.log("Interviews by partial name:", interviewsByPartialNameData?.length || 0);
        
        // Combine all results, removing duplicates by ID
        const allInterviews = [
          ...(interviewsByIdData || []),
          ...(interviewsByNameData || []),
          ...(interviewsByPartialNameData || [])
        ];
        
        // Remove duplicates by ID
        const uniqueInterviews = Array.from(
          new Map(allInterviews.map(item => [item.id, item])).values()
        );
        
        console.log("Total unique interviews found:", uniqueInterviews.length);
        
        // Since there's no applications table, we can create a mock or placeholder
        const mockApplications: JobApplication[] = [];
        
        setJobs(jobsData || []);
        setInterviews(uniqueInterviews);
        setApplications(mockApplications);
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  return { jobs, applications, interviews, isLoading };
};
