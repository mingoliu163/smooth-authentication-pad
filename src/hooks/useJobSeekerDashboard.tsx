
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
        
        // Fetch interviews for this candidate - using email and user ID
        // The email comparison handles legacy entries, and the ID ensures future assignments work
        console.log("Fetching interviews for user:", user.id, user.email);
        
        let queryString = '';
        
        // Build the query string more carefully to avoid syntax errors
        if (user.id) {
          queryString = `candidate_id.eq.${user.id}`;
        }
        
        if (user.email) {
          if (queryString) {
            queryString += `,candidate_name.eq.${user.email}`;
          } else {
            queryString = `candidate_name.eq.${user.email}`;
          }
        }
        
        // Only execute the query if we have something to query by
        if (queryString) {
          const { data: interviewsData, error: interviewsError } = await supabase
            .from("interviews")
            .select("*")
            .or(queryString)
            .order("date", { ascending: true });
          
          if (interviewsError) {
            console.error("Interview fetch error:", interviewsError);
            
            // Fallback to try each condition separately
            if (user.email) {
              const { data: nameInterviews, error: nameError } = await supabase
                .from("interviews")
                .select("*")
                .eq("candidate_name", user.email)
                .order("date", { ascending: true });
                
              if (!nameError) {
                console.log("Found interviews by name:", nameInterviews?.length);
                setInterviews(nameInterviews || []);
              }
            }
            
            if (user.id) {
              const { data: idInterviews, error: idError } = await supabase
                .from("interviews")
                .select("*")
                .eq("candidate_id", user.id)
                .order("date", { ascending: true });
                
              if (!idError && idInterviews && idInterviews.length > 0) {
                console.log("Found interviews by ID:", idInterviews.length);
                // If we already have interviews from the name query, combine them
                setInterviews(prevInterviews => {
                  // Create a map of existing interview IDs to avoid duplicates
                  const existingIds = new Set(prevInterviews.map(i => i.id));
                  // Filter out duplicates and combine arrays
                  const uniqueNewInterviews = idInterviews.filter(i => !existingIds.has(i.id));
                  return [...prevInterviews, ...uniqueNewInterviews];
                });
              }
            }
          } else {
            console.log("Found interviews:", interviewsData?.length);
            setInterviews(interviewsData || []);
          }
        } else {
          // No valid query criteria
          console.log("No valid query criteria for interviews");
          setInterviews([]);
        }
        
        // Since there's no applications table, we can create a mock or placeholder
        // In a real scenario, you would create and query a proper applications table
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
  }, [user]);

  return { jobs, applications, interviews, isLoading };
};
