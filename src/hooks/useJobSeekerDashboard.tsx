
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
        
        // Fetch interviews using multiple approaches to ensure we find all relevant interviews
        console.log("Fetching interviews for user:", user.id, user.email);
        
        if (!user.email) {
          console.error("User email is missing");
          setInterviews([]);
          setIsLoading(false);
          return;
        }
        
        // First attempt: Exact match on candidate_name (email)
        let { data: interviewsData, error: interviewsError } = await supabase
          .from("interviews")
          .select("*")
          .eq("candidate_name", user.email)
          .order("date", { ascending: true });
          
        if (interviewsError) {
          console.error("Error fetching interviews by exact email:", interviewsError);
        } else {
          console.log(`Found ${interviewsData?.length || 0} interviews with exact email match for ${user.email}`);
        }
        
        // If no interviews found or there was an error, try a case-insensitive search
        if (!interviewsData?.length || interviewsError) {
          const { data: ilikeCandidates, error: ilikeError } = await supabase
            .from("interviews")
            .select("*")
            .ilike("candidate_name", `%${user.email}%`)
            .order("date", { ascending: true });
            
          if (ilikeError) {
            console.error("Error fetching interviews with ilike:", ilikeError);
          } else {
            console.log(`Found ${ilikeCandidates?.length || 0} interviews with partial email match`);
            
            if (ilikeCandidates?.length) {
              interviewsData = ilikeCandidates;
            }
          }
        }
        
        // As a fallback, let's also check candidates table to find associated interviews
        if ((!interviewsData?.length || interviewsError) && user.email) {
          console.log("Attempting to find candidate by email:", user.email);
          
          // Find the candidate ID by email
          const { data: candidateData, error: candidateError } = await supabase
            .from("candidates")
            .select("id, name")
            .eq("email", user.email)
            .single();
            
          if (candidateError) {
            console.error("Error finding candidate by email:", candidateError);
          } else if (candidateData) {
            console.log("Found candidate:", candidateData);
            
            // Now fetch interviews by candidate ID
            const { data: candidateInterviews, error: ciError } = await supabase
              .from("interviews")
              .select("*")
              .eq("candidate_id", candidateData.id)
              .order("date", { ascending: true });
              
            if (ciError) {
              console.error("Error fetching interviews by candidate ID:", ciError);
            } else {
              console.log(`Found ${candidateInterviews?.length || 0} interviews by candidate ID`);
              interviewsData = candidateInterviews;
            }
          }
        }
        
        // Final fallback: Fetch a limited number of all interviews and filter on the client side
        if (!interviewsData?.length || interviewsError) {
          console.log("Using fallback interview fetch method");
          
          const { data: allInterviews, error: allError } = await supabase
            .from("interviews")
            .select("*")
            .order("date", { ascending: true })
            .limit(100);
            
          if (allError) {
            console.error("Error fetching all interviews:", allError);
          } else if (allInterviews?.length) {
            console.log(`Fetched ${allInterviews.length} interviews for client-side filtering`);
            
            // Filter interviews that might match our user
            const matchingInterviews = allInterviews.filter(interview => 
              interview.candidate_name?.toLowerCase().includes(user.email!.toLowerCase()) ||
              interview.candidate_id === user.id
            );
            
            if (matchingInterviews.length) {
              console.log(`Found ${matchingInterviews.length} interviews after client-side filtering`);
              interviewsData = matchingInterviews;
            }
          }
        }
        
        // Set interviews or empty array if nothing found
        setInterviews(interviewsData || []);
        
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
