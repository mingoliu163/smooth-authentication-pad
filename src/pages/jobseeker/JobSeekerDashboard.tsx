
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, BriefcaseIcon, ClockIcon, BookmarkIcon, LogOutIcon, FileTextIcon } from "lucide-react";
import { toast } from "sonner";

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  created_at: string;
}

interface Interview {
  id: string;
  date: string;
  candidate_name: string;
  position: string;
  status: string;
  exams: Exam[];
}

interface Exam {
  id: string;
  title: string;
  difficulty: string;
  category: string;
}

const JobSeekerDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const [recentJobs, setRecentJobs] = useState<JobListing[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInterviewsLoading, setIsInterviewsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("jobs")
          .select("id, title, company, location, type, created_at")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) {
          throw error;
        }

        setRecentJobs(data || []);
      } catch (err: any) {
        console.error("Error fetching recent jobs:", err);
        setError(err.message || "Failed to load recent jobs");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchInterviews = async () => {
      if (!user) return;
      
      try {
        setIsInterviewsLoading(true);
        
        // Fetch interviews where candidate_name matches user's full name or email
        const searchName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
        const userEmail = user.email;
        
        console.log("Searching for interviews with name:", searchName, "or email:", userEmail);
        
        const { data: interviewsData, error: interviewsError } = await supabase
          .from('interviews')
          .select('*')
          .or(`candidate_name.ilike.%${searchName}%,candidate_name.ilike.%${userEmail}%`)
          .order('date', { ascending: true });
        
        if (interviewsError) {
          console.error("Error fetching interviews:", interviewsError);
          throw interviewsError;
        }
        
        console.log("Found interviews:", interviewsData);
        
        // Fetch exams for each interview
        const interviewsWithExams = await Promise.all(
          interviewsData.map(async (interview) => {
            const { data: examsData, error: examsError } = await supabase
              .from('interview_exams')
              .select('exam_id')
              .eq('interview_id', interview.id);
              
            if (examsError) {
              console.error("Error fetching exam assignments:", examsError);
              return {
                ...interview,
                exams: [],
              };
            }
              
            // Get full exam data
            let exams: Exam[] = [];
            if (examsData && examsData.length > 0) {
              const examIds = examsData.map(item => item.exam_id);
              const { data: examDetails, error: examDetailsError } = await supabase
                .from('exam_bank')
                .select('id, title, difficulty, category')
                .in('id', examIds);
                
              if (!examDetailsError && examDetails) {
                exams = examDetails;
              } else if (examDetailsError) {
                console.error("Error fetching exam details:", examDetailsError);
              }
            }
            
            return {
              ...interview,
              exams,
            };
          })
        );
        
        setInterviews(interviewsWithExams);
      } catch (err: any) {
        console.error("Error fetching interviews:", err);
        toast.error("Failed to load interviews");
      } finally {
        setIsInterviewsLoading(false);
      }
    };

    fetchRecentJobs();
    fetchInterviews();
  }, [user, profile]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
    } catch (err) {
      toast.error("Failed to sign out");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Advanced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Technical': return 'bg-indigo-100 text-indigo-800';
      case 'Behavioral': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.first_name || "Job Seeker"}</h1>
          <p className="text-gray-600">Here's an overview of your job search progress</p>
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={handleSignOut}
        >
          <LogOutIcon className="w-4 h-4" />
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Applied Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BriefcaseIcon className="h-6 w-6 text-blue-500 mr-2" />
              <span className="text-2xl font-bold">0</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CalendarIcon className="h-6 w-6 text-green-500 mr-2" />
              <span className="text-2xl font-bold">{interviews.length}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ClockIcon className="h-6 w-6 text-yellow-500 mr-2" />
              <span className="text-2xl font-bold">0</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Saved Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BookmarkIcon className="h-6 w-6 text-purple-500 mr-2" />
              <span className="text-2xl font-bold">0</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent-jobs" className="mb-8">
        <TabsList>
          <TabsTrigger value="recent-jobs">Recent Jobs</TabsTrigger>
          <TabsTrigger value="my-applications">My Applications</TabsTrigger>
          <TabsTrigger value="upcoming-interviews">Upcoming Interviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent-jobs">
          <Card>
            <CardHeader>
              <CardTitle>Latest Job Opportunities</CardTitle>
              <CardDescription>Discover new job postings that match your profile</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex flex-col space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : recentJobs.length > 0 ? (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="flex flex-col border-b pb-4 last:border-0">
                      <h3 className="text-lg font-semibold">
                        <Link to={`/jobs/${job.id}`} className="hover:text-brand-600 hover:underline">
                          {job.title}
                        </Link>
                      </h3>
                      <div className="text-sm text-gray-600">{job.company} • {job.location}</div>
                      <div className="flex items-center mt-2">
                        <span className="text-xs bg-gray-100 rounded-full px-2 py-1">{job.type}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No jobs found at the moment.</p>
                  <p className="text-sm">Check back later for new opportunities.</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to="/jobs">View All Jobs</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="my-applications">
          <Card>
            <CardHeader>
              <CardTitle>Your Job Applications</CardTitle>
              <CardDescription>Track the status of your applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven't applied to any jobs yet.</p>
                <p className="text-sm">Start applying to see your applications here.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to="/jobs">Browse Jobs</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="upcoming-interviews">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Interviews</CardTitle>
              <CardDescription>Prepare for your scheduled interviews</CardDescription>
            </CardHeader>
            <CardContent>
              {isInterviewsLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, index) => (
                    <div key={index} className="flex flex-col space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : interviews.length > 0 ? (
                <div className="space-y-6">
                  {interviews.map((interview) => (
                    <Card key={interview.id} className="shadow-sm border-l-4 border-l-blue-500">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{interview.position}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                              <CalendarIcon className="w-4 h-4 inline-block mr-1" />
                              {formatDate(interview.date)}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            interview.status === "Scheduled" ? "bg-blue-100 text-blue-800" : 
                            interview.status === "Completed" ? "bg-green-100 text-green-800" : 
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {interview.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {interview.exams && interview.exams.length > 0 ? (
                          <div className="mt-3">
                            <p className="text-sm font-medium mb-2">Required Assessments:</p>
                            <div className="flex flex-wrap gap-2">
                              {interview.exams.map((exam) => (
                                <div key={exam.id} className="flex items-center gap-1">
                                  <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(exam.difficulty)}`}>
                                    {exam.title}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(exam.category)}`}>
                                    {exam.category}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </CardContent>
                      <CardFooter>
                        <Button asChild className="w-full">
                          <Link to={`/interviews/${interview.id}`}>
                            Prepare for Interview
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No upcoming interviews scheduled.</p>
                  <p className="text-sm">Your interview invitations will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Interview Prep</CardTitle>
            <CardDescription>Practice for your interviews with our AI assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Get ready for your interviews with our AI-powered practice sessions. Answer common interview questions and receive feedback to improve your responses.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/ai-interview">Start Practicing</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>Increase your chances of getting hired</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              A complete profile helps employers find you and increases your chances of getting hired. Add your skills, experience, and preferences.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link to="/profile">Update Profile</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
