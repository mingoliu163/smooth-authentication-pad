
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  AlertCircle, 
  Briefcase, 
  Calendar, 
  ChevronRight,
  FileCheck,
  LogOut
} from "lucide-react";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  created_at: string;
}

// Define the proper types based on database schema
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

const JobSeekerDashboard = () => {
  const { user, signOut } = useAuth();
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
        // Use multiple conditions to find interviews for this user
        const { data: interviewsData, error: interviewsError } = await supabase
          .from("interviews")
          .select("*")
          .or(`candidate_id.eq.${user.id},candidate_name.eq.${user.email}`)
          .order("date", { ascending: true });
        
        if (interviewsError) {
          console.error("Interview fetch error:", interviewsError);
          // Try alternative query if the first one fails
          const { data: altInterviewsData, error: altError } = await supabase
            .from("interviews")
            .select("*")
            .eq("candidate_name", user.email)
            .order("date", { ascending: true });
            
          if (!altError) {
            setInterviews(altInterviewsData || []);
          }
        } else {
          setInterviews(interviewsData || []);
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

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.email}</p>
        </div>
        <Button 
          variant="outline" 
          onClick={signOut}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
      
      <Tabs defaultValue="interviews" className="space-y-6">
        <TabsList>
          <TabsTrigger value="interviews" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Interviews
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center">
            <FileCheck className="mr-2 h-4 w-4" />
            Applications
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center">
            <Briefcase className="mr-2 h-4 w-4" />
            Recommended Jobs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="interviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Interviews</CardTitle>
              <CardDescription>
                Your scheduled interviews and assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
                </div>
              ) : interviews.length > 0 ? (
                <div className="space-y-4">
                  {interviews.map((interview) => (
                    <div key={interview.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{interview.position} Interview</h3>
                          <p className="text-sm text-gray-600">{formatDate(interview.date)}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          interview.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          interview.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {interview.status}
                        </span>
                      </div>
                      <div className="flex justify-end mt-2">
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/interviews/${interview.id}`}>
                            View Details
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border rounded-lg bg-gray-50">
                  <AlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">No interviews scheduled</h3>
                  <p className="text-gray-600 mb-4">
                    You don't have any upcoming interviews at the moment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Applications</CardTitle>
              <CardDescription>
                Track the status of your job applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
                </div>
              ) : applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{application.job?.title || "Unknown Position"}</h3>
                          <p className="text-sm text-gray-600">{application.job?.company || "Unknown Company"}</p>
                          <p className="text-xs text-gray-500 mt-1">Applied on {new Date(application.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          application.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                          application.status === 'Accepted' ? 'bg-green-100 text-green-800' : 
                          application.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {application.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border rounded-lg bg-gray-50">
                  <AlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">No applications yet</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't applied to any jobs yet. Browse available positions and submit your first application.
                  </p>
                  <Button asChild>
                    <Link to="/jobs">Browse Jobs</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommended for You</CardTitle>
              <CardDescription>
                Jobs that match your profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
                </div>
              ) : jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div>
                        <h3 className="font-semibold">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.company}</p>
                        <p className="text-sm text-gray-600">{job.location}</p>
                      </div>
                      <div className="flex justify-end mt-2">
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/jobs/${job.id}`}>
                            View Job
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border rounded-lg bg-gray-50">
                  <AlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">No recommendations yet</h3>
                  <p className="text-gray-600 mb-4">
                    We're still learning about your preferences. Check back later for personalized job recommendations.
                  </p>
                  <Button asChild>
                    <Link to="/jobs">Browse All Jobs</Link>
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to="/jobs">View All Available Jobs</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobSeekerDashboard;
