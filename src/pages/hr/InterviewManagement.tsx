
import { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PlusCircle, FileText, Calendar, User, RefreshCcw, Book, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define types for our data
interface Interview {
  id: string;
  candidate_name: string;
  position: string;
  date: string;
  status: string; // Changed from enum to string to match database type
  interviewers?: User[];
  assessments?: Assessment[];
  exams?: Exam[];
}

interface User {
  id: string;
  email?: string; // Made optional since profiles table doesn't have email
  first_name: string | null;
  last_name: string | null;
}

interface Assessment {
  id: string;
  title: string;
  assessmentType: "technical" | "behavioral";
  status?: "pending" | "in_progress" | "completed" | "canceled";
}

interface Exam {
  id: string;
  title: string;
  difficulty: string;
  category: string;
}

interface InterviewFormValues {
  candidate_name: string;
  position: string;
  date: string;
  interviewer_ids: string[];
  exam_id?: string;
}

const InterviewManagement = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [availableAssessments, setAvailableAssessments] = useState<Assessment[]>([]);
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const form = useForm<InterviewFormValues>({
    defaultValues: {
      candidate_name: "",
      position: "",
      date: "",
      interviewer_ids: [],
      exam_id: undefined,
    },
  });

  // Fetch interviews, users, assessments and exams from the database
  useEffect(() => {
    fetchInterviews();
    fetchUsers();
    fetchAssessments();
    fetchExams();
  }, []);

  const fetchInterviews = async () => {
    try {
      setIsLoading(true);
      
      // Fetch interviews
      const { data: interviewsData, error: interviewsError } = await supabase
        .from('interviews')
        .select('*')
        .order('date', { ascending: true });
      
      if (interviewsError) throw interviewsError;
      
      // For each interview, fetch its interviewers and exams
      const interviewsWithDetails = await Promise.all(
        interviewsData.map(async (interview) => {
          // Fetch interviewers
          const { data: interviewersData, error: interviewersError } = await supabase
            .from('interview_interviewers')
            .select('user_id')
            .eq('interview_id', interview.id);
          
          if (interviewersError) throw interviewersError;
          
          // Get full user data for each interviewer
          const userIds = interviewersData.map(item => item.user_id);
          let interviewers: User[] = [];
          
          if (userIds.length > 0) {
            const { data: usersData, error: usersError } = await supabase
              .from('profiles')
              .select('id, first_name, last_name')
              .in('id', userIds);
            
            if (usersError) throw usersError;
            interviewers = usersData as User[];
          }
          
          // Fetch assigned exams
          const { data: examsData, error: examsError } = await supabase
            .from('interview_exams')
            .select('exam_id')
            .eq('interview_id', interview.id);
            
          if (examsError) {
            console.error("Error fetching exam assignments:", examsError);
            return {
              ...interview,
              interviewers,
              exams: [],
            } as Interview;
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
              exams = examDetails as Exam[];
            }
          }
          
          return {
            ...interview,
            interviewers,
            exams,
          } as Interview;
        })
      );
      
      setInterviews(interviewsWithDetails);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      toast.error("Failed to load interviews");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name');
      
      if (error) throw error;
      
      setUsers(data as User[]);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('id, title, assessment_type');
      
      if (error) throw error;
      
      if (data) {
        setAvailableAssessments(data.map(item => ({
          id: item.id,
          title: item.title,
          assessmentType: item.assessment_type as "technical" | "behavioral"
        })));
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
      toast.error("Failed to load assessments");
    }
  };

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exam_bank')
        .select('id, title, difficulty, category');
      
      if (error) throw error;
      
      if (data) {
        setAvailableExams(data as Exam[]);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("Failed to load exams");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleScheduleInterview = async () => {
    try {
      setIsLoading(true);
      
      // Get values from form
      const values = form.getValues();
      
      // Insert the interview
      const { data: interview, error: insertError } = await supabase
        .from('interviews')
        .insert({
          candidate_name: values.candidate_name,
          position: values.position,
          date: values.date,
          status: 'Scheduled'
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // Insert the interviewers
      if (values.interviewer_ids.length > 0) {
        const interviewerInserts = values.interviewer_ids.map(user_id => ({
          interview_id: interview.id,
          user_id
        }));
        
        const { error: interviewersError } = await supabase
          .from('interview_interviewers')
          .insert(interviewerInserts);
        
        if (interviewersError) throw interviewersError;
      }
      
      // Assign exam if selected
      if (values.exam_id) {
        const { error: examError } = await supabase
          .from('interview_exams')
          .insert({
            interview_id: interview.id,
            exam_id: values.exam_id
          });
        
        if (examError) {
          console.error("Error assigning exam:", examError);
          toast.error("Interview scheduled but exam assignment failed");
        }
      }
      
      toast.success("Interview scheduled successfully");
      setIsScheduleModalOpen(false);
      form.reset();
      fetchInterviews();
    } catch (error) {
      console.error("Error scheduling interview:", error);
      toast.error("Failed to schedule interview");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAssessment = () => {
    if (selectedInterview && selectedAssessment) {
      // In a real app, we would call the API to link the assessment to the interview
      // For now, we're just updating the UI
      const updatedInterviews = interviews.map(interview => {
        if (interview.id === selectedInterview.id) {
          const assessment = availableAssessments.find(a => a.id === selectedAssessment);
          if (assessment) {
            const newAssessment: Assessment = {
              id: assessment.id,
              title: assessment.title,
              assessmentType: assessment.assessmentType,
              status: "pending"
            };
            
            return {
              ...interview,
              assessments: [
                ...(interview.assessments || []),
                newAssessment
              ]
            };
          }
        }
        return interview;
      });
      
      setInterviews(updatedInterviews);
      toast.success("Assessment added to interview");
      setIsAssessmentModalOpen(false);
      setSelectedAssessment("");
    } else {
      toast.error("Please select an assessment");
    }
  };

  const handleAddExam = async () => {
    if (selectedInterview && selectedExam) {
      try {
        const { error } = await supabase
          .from('interview_exams')
          .insert({
            interview_id: selectedInterview.id,
            exam_id: selectedExam
          });
          
        if (error) throw error;
        
        // Update local state
        const updatedInterviews = interviews.map(interview => {
          if (interview.id === selectedInterview.id) {
            const exam = availableExams.find(e => e.id === selectedExam);
            if (exam) {
              return {
                ...interview,
                exams: [
                  ...(interview.exams || []),
                  exam
                ]
              };
            }
          }
          return interview;
        });
        
        setInterviews(updatedInterviews);
        toast.success("Exam assigned to interview");
        setIsExamModalOpen(false);
        setSelectedExam("");
      } catch (error) {
        console.error("Error assigning exam:", error);
        toast.error("Failed to assign exam");
      }
    } else {
      toast.error("Please select an exam");
    }
  };

  const openAssessmentModal = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsAssessmentModalOpen(true);
  };

  const openExamModal = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsExamModalOpen(true);
  };

  const refreshData = () => {
    setIsRefreshing(true);
    fetchInterviews();
  };

  const getUserFullName = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user.first_name) {
      return user.first_name;
    } else if (user.email) {
      return user.email;
    } else {
      return `User ${user.id.slice(0, 8)}`;
    }
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
    <AdminLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Interview Management</h1>
          <div className="flex space-x-2">
            <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Interview
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule New Interview</DialogTitle>
                  <DialogDescription>
                    Fill in the details to schedule a new interview.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleScheduleInterview)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="candidate_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Candidate Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter candidate name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter position" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date & Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="interviewer_ids"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interviewers</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange([...field.value, value])}
                            value=""
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select interviewers" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {users.map((user) => (
                                <SelectItem 
                                  key={user.id} 
                                  value={user.id}
                                  disabled={field.value.includes(user.id)}
                                >
                                  {getUserFullName(user)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {field.value.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium mb-1">Selected interviewers:</p>
                              <div className="flex flex-wrap gap-2">
                                {field.value.map((userId) => {
                                  const selectedUser = users.find(u => u.id === userId);
                                  return (
                                    <div 
                                      key={userId} 
                                      className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-xs"
                                    >
                                      <span>{selectedUser ? getUserFullName(selectedUser) : userId}</span>
                                      <button
                                        type="button"
                                        onClick={() => field.onChange(field.value.filter(id => id !== userId))}
                                        className="text-gray-500 hover:text-red-500"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="exam_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assign Exam (Optional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an exam" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableExams.map((exam) => (
                                <SelectItem 
                                  key={exam.id} 
                                  value={exam.id}
                                >
                                  {exam.title} ({exam.category}, {exam.difficulty})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Scheduling..." : "Schedule"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={refreshData} disabled={isRefreshing}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading && !isRefreshing ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
              <p>Loading interviews...</p>
            </div>
          ) : interviews.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No interviews found. Schedule your first interview!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Interviewers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assessments</TableHead>
                  <TableHead>Exams</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interviews.map((interview) => (
                  <TableRow key={interview.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {interview.candidate_name}
                      </div>
                    </TableCell>
                    <TableCell>{interview.position}</TableCell>
                    <TableCell>{formatDate(interview.date)}</TableCell>
                    <TableCell>
                      {interview.interviewers && interview.interviewers.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {interview.interviewers.map((interviewer, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">
                                {getUserFullName(interviewer)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">No interviewers assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        interview.status === "Scheduled" ? "bg-blue-100 text-blue-800" : 
                        interview.status === "Completed" ? "bg-green-100 text-green-800" : 
                        interview.status === "In Progress" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {interview.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {interview.assessments && interview.assessments.length > 0 ? (
                          interview.assessments.map((assessment, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <FileText className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">{assessment.title}</span>
                              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                                assessment.status === "completed" ? "bg-green-100 text-green-800" :
                                assessment.status === "in_progress" ? "bg-yellow-100 text-yellow-800" :
                                "bg-blue-100 text-blue-800"
                              }`}>
                                {assessment.status}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">No assessments</span>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-1 h-6 text-xs"
                          onClick={() => openAssessmentModal(interview)}
                        >
                          <PlusCircle className="h-3 w-3 mr-1" />
                          Add Assessment
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {interview.exams && interview.exams.length > 0 ? (
                          interview.exams.map((exam, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">{exam.title}</span>
                              <div className="flex gap-1 ml-1">
                                <span className={`px-1.5 py-0.5 rounded-full text-xs ${getDifficultyColor(exam.difficulty)}`}>
                                  {exam.difficulty}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded-full text-xs ${getCategoryColor(exam.category)}`}>
                                  {exam.category}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">No exams</span>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-1 h-6 text-xs"
                          onClick={() => openExamModal(interview)}
                        >
                          <PlusCircle className="h-3 w-3 mr-1" />
                          Add Exam
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Assessment Assignment Modal */}
      <Dialog open={isAssessmentModalOpen} onOpenChange={setIsAssessmentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Assessment to Interview</DialogTitle>
            <DialogDescription>
              {selectedInterview && (
                <>Assign an assessment to {selectedInterview.candidate_name}'s interview.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="assessment">Select Assessment</Label>
              <Select 
                value={selectedAssessment} 
                onValueChange={setSelectedAssessment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an assessment" />
                </SelectTrigger>
                <SelectContent>
                  {availableAssessments.map((assessment) => (
                    <SelectItem key={assessment.id} value={assessment.id}>
                      {assessment.title} ({assessment.assessmentType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddAssessment} disabled={!selectedAssessment}>
              Assign Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exam Assignment Modal */}
      <Dialog open={isExamModalOpen} onOpenChange={setIsExamModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Exam to Interview</DialogTitle>
            <DialogDescription>
              {selectedInterview && (
                <>Assign an exam to {selectedInterview.candidate_name}'s interview.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="exam">Select Exam</Label>
              <Select 
                value={selectedExam} 
                onValueChange={setSelectedExam}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an exam" />
                </SelectTrigger>
                <SelectContent>
                  {availableExams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.title} ({exam.category}, {exam.difficulty})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddExam} disabled={!selectedExam}>
              Assign Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default InterviewManagement;
