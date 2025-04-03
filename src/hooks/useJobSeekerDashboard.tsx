
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
  user_id?: string; // Added user_id to match the database schema
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
        
        // Fetch interviews directly using user_id (much simpler now!)
        console.log("Fetching interviews for user:", user.id);
        
        const { data: interviewsData, error: interviewsError } = await supabase
          .from("interviews")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: true });
          
        if (interviewsError) {
          console.error("Error fetching interviews by user_id:", interviewsError);
        } else {
          console.log(`Found ${interviewsData?.length || 0} interviews with direct user_id match`);
        }
        
        // If no interviews found directly by user_id, try fetching by candidate ID first
        if (!interviewsData?.length) {
          console.log("No interviews found directly. Trying to find candidate record...");
          
          // First find if this user has a candidate record
          const { data: candidateData, error: candidateError } = await supabase
            .from("candidates")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();
            
          if (candidateError) {
            console.error("Error finding candidate by user_id:", candidateError);
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
              if (candidateInterviews?.length) {
                setInterviews(candidateInterviews);
                setJobs(jobsData || []);
                setApplications([]);
                setIsLoading(false);
                return;
              }
            }
          }
        }
        
        // Fallback: Still try the email match as before if we haven't found anything
        if (!interviewsData?.length && user.email) {
          console.log("Attempting fallback: find candidate by email:", user.email);
          
          // First try to find a candidate with matching email
          const { data: emailCandidateData, error: emailCandidateError } = await supabase
            .from("candidates")
            .select("*")
            .eq("email", user.email)
            .maybeSingle();
            
          if (emailCandidateError) {
            console.error("Error finding candidate by email:", emailCandidateError);
          } else if (emailCandidateData) {
            console.log("Found candidate by email:", emailCandidateData);
            
            // Update the candidate with user_id if not already set
            if (!emailCandidateData.user_id) {
              const { error: updateError } = await supabase
                .from("candidates")
                .update({ user_id: user.id })
                .eq("id", emailCandidateData.id);
                
              if (updateError) {
                console.error("Error linking candidate to user:", updateError);
              } else {
                console.log("Successfully linked candidate to user");
              }
            }
            
            // Fetch interviews for this candidate
            const { data: candidateInterviews, error: ciError } = await supabase
              .from("interviews")
              .select("*")
              .eq("candidate_id", emailCandidateData.id)
              .order("date", { ascending: true });
              
            if (ciError) {
              console.error("Error fetching interviews for email-matched candidate:", ciError);
            } else {
              console.log(`Found ${candidateInterviews?.length || 0} interviews for email-matched candidate`);
              if (candidateInterviews?.length) {
                // Also update the interviews with user_id
                await Promise.all(candidateInterviews.map(async (interview) => {
                  if (!interview.user_id) {
                    await supabase
                      .from("interviews")
                      .update({ user_id: user.id })
                      .eq("id", interview.id);
                  }
                }));
                
                setInterviews(candidateInterviews);
                setJobs(jobsData || []);
                setApplications([]);
                setIsLoading(false);
                return;
              }
            }
          }
        }
        
        // Final fallback: Try name-based search if everything else failed
        if (!interviewsData?.length) {
          console.log("Attempting final fallback with name-based search");
          
          // Fetch a limited number of interviews and filter on the client side
          const { data: allInterviews, error: allError } = await supabase
            .from("interviews")
            .select("*")
            .order("date", { ascending: true })
            .limit(100);
            
          if (allError) {
            console.error("Error fetching all interviews:", allError);
          } else if (allInterviews?.length && user.email) {
            // Filter interviews that might match our user
            const matchingInterviews = allInterviews.filter(interview => 
              interview.candidate_name?.toLowerCase().includes(user.email!.toLowerCase())
            );
            
            if (matchingInterviews.length) {
              console.log(`Found ${matchingInterviews.length} interviews after client-side filtering`);
              
              // Also update these matches with user_id for future fast lookups
              await Promise.all(matchingInterviews.map(async (interview) => {
                if (!interview.user_id) {
                  await supabase
                    .from("interviews")
                    .update({ user_id: user.id })
                    .eq("id", interview.id);
                }
              }));
              
              setInterviews(matchingInterviews);
              setJobs(jobsData || []);
              setApplications([]);
              setIsLoading(false);
              return;
            }
          }
        }
        
        // Set interviews from original query if it worked, or empty array if all fallbacks failed
        setInterviews(interviewsData || []);
        setJobs(jobsData || []);
        setApplications([]);
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
