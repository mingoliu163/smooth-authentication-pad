
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserRole } from "@/types/auth";

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
  user_id?: string | null;
}

export interface DashboardData {
  jobs: Job[];
  applications: JobApplication[];
  interviews: Interview[];
  isLoading: boolean;
}

export const useJobSeekerDashboard = (refreshTrigger = 0): DashboardData => {
  const { user, userRole } = useAuth();
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

        console.log(`Fetching interviews for user: ${user.id} with role: ${userRole}`);
        
        // Check if the user role is job_seeker
        if (userRole === 'job_seeker') {
          console.log("User is a job seeker, fetching interviews directly by user_id");
          
          // Direct approach - get interviews directly by user_id
          const { data: userInterviews, error: userInterviewsError } = await supabase
            .from("interviews")
            .select("*")
            .eq("user_id", user.id)
            .order("date", { ascending: true });
            
          if (userInterviewsError) {
            console.error("Error fetching interviews by user_id:", userInterviewsError);
          } else if (userInterviews && userInterviews.length > 0) {
            console.log(`Found ${userInterviews.length} interviews with direct user_id match`);
            setInterviews(userInterviews);
            setJobs(jobsData || []);
            setApplications([]);
            setIsLoading(false);
            return;
          } else {
            console.log("No interviews found directly by user_id");
          }
        }

        // If no direct matches or not a job seeker, try to find by candidate association
        console.log("Checking for candidate records associated with this user");
        
        // Find the candidate record by user_id
        const { data: candidateData, error: candidateError } = await supabase
          .from("candidates")
          .select("id, name, email, user_id")
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (candidateError) {
          console.error("Error finding candidate by user_id:", candidateError);
        } else if (candidateData) {
          console.log("Found candidate by user_id:", candidateData);
          
          // Get interviews for this candidate
          const { data: candidateInterviews, error: ciError } = await supabase
            .from("interviews")
            .select("*")
            .eq("candidate_id", candidateData.id)
            .order("date", { ascending: true });
            
          if (ciError) {
            console.error("Error fetching interviews for candidate:", ciError);
          } else if (candidateInterviews && candidateInterviews.length > 0) {
            console.log(`Found ${candidateInterviews.length} interviews by candidate ID`);
            
            // Update interviews with user_id if not already set
            for (const interview of candidateInterviews) {
              if (!interview.user_id) {
                await supabase
                  .from("interviews")
                  .update({ user_id: user.id })
                  .eq("id", interview.id);
              }
            }
            
            setInterviews(candidateInterviews);
            setJobs(jobsData || []);
            setApplications([]);
            setIsLoading(false);
            return;
          } else {
            console.log("No interviews found for this candidate ID");
          }
        } else {
          console.log("No candidate record found with this user_id");
        }
        
        // If we're here, try by email
        console.log("Attempting to find candidate by email:", user.email);
        
        if (user.email) {
          // Try to find by email
          const { data: emailCandidate, error: emailCandidateError } = await supabase
            .from("candidates")
            .select("id, name, email, user_id")
            .eq("email", user.email)
            .maybeSingle();
            
          if (emailCandidateError) {
            console.error("Error finding candidate by email:", emailCandidateError);
          } else if (emailCandidate) {
            console.log("Found candidate by email:", emailCandidate);
            
            // Update candidate record with user_id if not already set
            if (!emailCandidate.user_id) {
              console.log("Linking candidate to user:", user.id);
              await supabase
                .from("candidates")
                .update({ user_id: user.id })
                .eq("id", emailCandidate.id);
            }
            
            // Now get interviews for this candidate
            const { data: emailCandidateInterviews, error: eciError } = await supabase
              .from("interviews")
              .select("*")
              .eq("candidate_id", emailCandidate.id)
              .order("date", { ascending: true });
              
            if (eciError) {
              console.error("Error fetching interviews for email-matched candidate:", eciError);
            } else if (emailCandidateInterviews && emailCandidateInterviews.length > 0) {
              console.log(`Found ${emailCandidateInterviews.length} interviews for email-matched candidate`);
              
              // Update interviews with user_id for future lookups
              for (const interview of emailCandidateInterviews) {
                if (!interview.user_id) {
                  await supabase
                    .from("interviews")
                    .update({ user_id: user.id })
                    .eq("id", interview.id);
                }
              }
              
              setInterviews(emailCandidateInterviews);
              setJobs(jobsData || []);
              setApplications([]);
              setIsLoading(false);
              return;
            } else {
              console.log("No interviews found for this email-matched candidate");
            }
          } else {
            console.log("No candidate found with this email");
          }
          
          // Last attempt: check by candidate name that might include the email
          // This is a fallback for legacy data
          console.log("Performing final check for interviews by candidate name containing email parts");
          
          // Extract name part from email (e.g., "john" from "john@example.com")
          const emailNamePart = user.email.split('@')[0];
          
          // Get all interviews and filter on client side
          const { data: allInterviews, error: allError } = await supabase
            .from("interviews")
            .select("*")
            .order("date", { ascending: true })
            .limit(100);
            
          if (allError) {
            console.error("Error fetching all interviews:", allError);
          } else if (allInterviews && allInterviews.length > 0) {
            // Find interviews where candidate_name contains the email name part
            // or the whole email
            const matchingInterviews = allInterviews.filter(interview => 
              interview.candidate_name?.toLowerCase().includes(emailNamePart.toLowerCase()) ||
              interview.candidate_name?.toLowerCase().includes(user.email!.toLowerCase())
            );
            
            if (matchingInterviews.length > 0) {
              console.log(`Found ${matchingInterviews.length} interviews by candidate name match`);
              
              // Update these with user_id
              for (const interview of matchingInterviews) {
                if (!interview.user_id) {
                  await supabase
                    .from("interviews")
                    .update({ user_id: user.id })
                    .eq("id", interview.id);
                }
              }
              
              setInterviews(matchingInterviews);
              setJobs(jobsData || []);
              setApplications([]);
              setIsLoading(false);
              return;
            } else {
              console.log("No interviews found matching candidate name");
            }
          }
        }
        
        // Finally, just ensure we return something even if nothing was found
        console.log("No interviews found for this user through any method");
        setInterviews([]);
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
  }, [user, userRole, refreshTrigger]);

  return { jobs, applications, interviews, isLoading };
};
