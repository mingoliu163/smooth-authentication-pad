
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
        
        // Fetch interviews for this candidate
        console.log("Fetching interviews for user:", user.id, user.email);
        
        const fetchPromises = [];
        
        // Method 1: Using candidate_id direct match
        if (user.id) {
          fetchPromises.push(
            supabase
              .from("interviews")
              .select("*")
              .eq("candidate_id", user.id)
              .order("date", { ascending: true })
          );
        }
        
        // Method 2: Using candidate_name exact match (email)
        if (user.email) {
          fetchPromises.push(
            supabase
              .from("interviews")
              .select("*")
              .eq("candidate_name", user.email)
              .order("date", { ascending: true })
          );
        }
        
        // Method 3: Using candidate_name with pattern match (first part of email)
        if (user.email) {
          const emailUsername = user.email.split("@")[0];
          fetchPromises.push(
            supabase
              .from("interviews")
              .select("*")
              .ilike("candidate_name", `%${emailUsername}%`)
              .order("date", { ascending: true })
          );
        }
        
        // Method 4: Get all interviews and filter client-side 
        // (use this as a last resort if the database doesn't have proper indexes)
        fetchPromises.push(
          supabase
            .from("interviews")
            .select("*")
            .order("date", { ascending: true })
            .limit(100) // Limit to avoid fetching too much data
        );
        
        // Execute all fetch methods
        const results = await Promise.all(fetchPromises);
        
        // Log the number of results from each method for debugging
        results.forEach((result, index) => {
          console.log(`Method ${index + 1} found ${result.data?.length || 0} interviews`);
          
          // If this is the catch-all method, do client-side filtering
          if (index === 3 && user.email && result.data) {
            const filteredInterviews = result.data.filter(interview => 
              interview.candidate_name?.toLowerCase().includes(user.email!.toLowerCase()) ||
              (user.id && interview.candidate_id === user.id)
            );
            console.log(`After client-side filtering: ${filteredInterviews.length} interviews`);
          }
        });
        
        // Combine all results, removing duplicates by ID
        const allInterviews = results.flatMap(result => result.data || []);
        
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
  }, [user, refreshTrigger]);

  return { jobs, applications, interviews, isLoading };
};
