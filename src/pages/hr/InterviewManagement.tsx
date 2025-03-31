
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/layouts/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Calendar,
  PlusCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Clock,
  Book,
} from "lucide-react";

interface Interview {
  id: string;
  date: string;
  candidate_id: string;
  candidate_name: string;
  interviewer_id: string | null;
  interviewer_name: string | null;
  position: string;
  status: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
}

interface Candidate {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface Interviewer {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface Exam {
  id: string;
  title: string;
  difficulty: string;
  category: string;
}

const InterviewManagement = () => {
  const { user, isAdmin, isHR } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignExamsDialogOpen, setIsAssignExamsDialogOpen] = useState(false);
  const [deleteInterviewId, setDeleteInterviewId] = useState<string | null>(null);

  const [editInterview, setEditInterview] = useState<Interview | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null);
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);

  const [newInterview, setNewInterview] = useState({
    date: "",
    candidate_id: "",
    interviewer_id: "",
    position: "",
    status: "Scheduled",
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title, company");

      if (jobsError) throw jobsError;

      // Fetch interviews with candidate and interviewer names
      const { data: interviewsData, error: interviewsError } = await supabase
        .from("interviews")
        .select(`
          *,
          candidates:candidate_id (email, first_name, last_name),
          interviewers:interviewer_id (email, first_name, last_name)
        `)
        .order("date", { ascending: false });

      if (interviewsError) throw interviewsError;

      // Fetch candidates (job seekers)
      const { data: candidatesData, error: candidatesError } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name")
        .eq("role", "job_seeker");

      if (candidatesError) throw candidatesError;

      // Fetch potential interviewers (HR and admin users)
      const { data: interviewersData, error: interviewersError } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name")
        .or("role.eq.hr,role.eq.admin")
        .eq("approved", true);

      if (interviewersError) throw interviewersError;

      // Fetch all available exams
      const { data: examsData, error: examsError } = await supabase
        .from("exam_bank")
        .select("id, title, difficulty, category");

      if (examsError) throw examsError;

      // Format the interviews data
      const formattedInterviews: Interview[] = interviewsData.map((interview: any) => ({
        id: interview.id,
        date: interview.date,
        candidate_id: interview.candidate_id,
        candidate_name: interview.candidates
          ? `${interview.candidates.first_name || ""} ${
              interview.candidates.last_name || ""
            }`.trim() || interview.candidates.email
          : "Unknown",
        interviewer_id: interview.interviewer_id,
        interviewer_name: interview.interviewers
          ? `${interview.interviewers.first_name || ""} ${
              interview.interviewers.last_name || ""
            }`.trim() || interview.interviewers.email
          : null,
        position: interview.position,
        status: interview.status,
      }));

      setJobs(jobsData || []);
      setInterviews(formattedInterviews);
      setCandidates(candidatesData || []);
      setInterviewers(interviewersData || []);
      setExams(examsData || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load interview data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!(isAdmin() || isHR())) {
      return;
    }
    fetchData();
  }, [isAdmin, isHR, user?.id]);

  const handleCreateInterview = async () => {
    try {
      setIsSubmitting(true);

      if (!newInterview.candidate_id) {
        toast.error("Please select a candidate");
        return;
      }

      if (!newInterview.date) {
        toast.error("Please set an interview date");
        return;
      }

      if (!newInterview.position) {
        toast.error("Please enter a position title");
        return;
      }

      // Get candidate information for notification
      const candidate = candidates.find(c => c.id === newInterview.candidate_id);
      const candidateName = candidate 
        ? `${candidate.first_name || ""} ${candidate.last_name || ""}`.trim() || candidate.email
        : "the candidate";

      // Create the interview
      const { data, error } = await supabase
        .from("interviews")
        .insert({
          date: newInterview.date,
          candidate_id: newInterview.candidate_id,
          interviewer_id: newInterview.interviewer_id || null,
          position: newInterview.position,
          status: newInterview.status,
        })
        .select();

      if (error) throw error;

      toast.success(`Interview scheduled for ${candidateName}`);
      
      // Reset the form
      setNewInterview({
        date: "",
        candidate_id: "",
        interviewer_id: "",
        position: "",
        status: "Scheduled",
      });
      
      // Refresh the interviews list
      fetchData();
    } catch (error: any) {
      console.error("Error creating interview:", error);
      toast.error(error.message || "Failed to create interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateInterview = async () => {
    try {
      setIsSubmitting(true);

      if (!editInterview) return;

      const { data, error } = await supabase
        .from("interviews")
        .update({
          date: editInterview.date,
          candidate_id: editInterview.candidate_id,
          interviewer_id: editInterview.interviewer_id,
          position: editInterview.position,
          status: editInterview.status,
        })
        .eq("id", editInterview.id)
        .select();

      if (error) throw error;

      toast.success("Interview updated successfully");
      setIsEditDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error updating interview:", error);
      toast.error(error.message || "Failed to update interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInterview = async () => {
    try {
      setIsSubmitting(true);

      if (!deleteInterviewId) return;

      // First remove any exam assignments
      const { error: examLinkError } = await supabase
        .from("interview_exams")
        .delete()
        .eq("interview_id", deleteInterviewId);

      if (examLinkError) throw examLinkError;

      // Then delete the interview
      const { error } = await supabase
        .from("interviews")
        .delete()
        .eq("id", deleteInterviewId);

      if (error) throw error;

      toast.success("Interview deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeleteInterviewId(null);
      fetchData();
    } catch (error: any) {
      console.error("Error deleting interview:", error);
      toast.error(error.message || "Failed to delete interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAssignExamsDialog = async (interviewId: string) => {
    try {
      // Fetch already assigned exams for this interview
      const { data: assignedExams, error: assignedError } = await supabase
        .from("interview_exams")
        .select("exam_id")
        .eq("interview_id", interviewId);

      if (assignedError) throw assignedError;

      const assignedExamIds = assignedExams?.map((item) => item.exam_id) || [];
      setSelectedExams(assignedExamIds);
      setSelectedInterviewId(interviewId);
      setAvailableExams(exams);
      setIsAssignExamsDialogOpen(true);
    } catch (error: any) {
      console.error("Error fetching assigned exams:", error);
      toast.error("Failed to load exam assignments");
    }
  };

  const handleAssignExams = async () => {
    try {
      setIsSubmitting(true);

      if (!selectedInterviewId) return;

      // First remove all existing exam assignments
      const { error: deleteError } = await supabase
        .from("interview_exams")
        .delete()
        .eq("interview_id", selectedInterviewId);

      if (deleteError) throw deleteError;

      // Then add the new assignments
      if (selectedExams.length > 0) {
        const examAssignments = selectedExams.map((examId) => ({
          interview_id: selectedInterviewId,
          exam_id: examId,
        }));

        const { error: insertError } = await supabase
          .from("interview_exams")
          .insert(examAssignments);

        if (insertError) throw insertError;
      }

      toast.success("Exams assigned successfully");
      setIsAssignExamsDialogOpen(false);
      setSelectedInterviewId(null);
      setSelectedExams([]);
    } catch (error: any) {
      console.error("Error assigning exams:", error);
      toast.error(error.message || "Failed to assign exams");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getFullName = (firstName: string | null, lastName: string | null, email: string) => {
    const name = `${firstName || ""} ${lastName || ""}`.trim();
    return name || email;
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Interview Management</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Schedule Interview
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Schedule New Interview</DialogTitle>
                <DialogDescription>
                  Create a new interview session and assign a candidate and interviewer.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="position" className="text-right">
                    Position
                  </Label>
                  <Input
                    id="position"
                    value={newInterview.position}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        position: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="candidate" className="text-right">
                    Candidate
                  </Label>
                  <Select
                    value={newInterview.candidate_id}
                    onValueChange={(value) =>
                      setNewInterview({
                        ...newInterview,
                        candidate_id: value,
                      })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select candidate" />
                    </SelectTrigger>
                    <SelectContent>
                      {candidates.map((candidate) => (
                        <SelectItem key={candidate.id} value={candidate.id}>
                          {getFullName(
                            candidate.first_name,
                            candidate.last_name,
                            candidate.email
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="interviewer" className="text-right">
                    Interviewer
                  </Label>
                  <Select
                    value={newInterview.interviewer_id}
                    onValueChange={(value) =>
                      setNewInterview({
                        ...newInterview,
                        interviewer_id: value,
                      })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select interviewer (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {interviewers.map((interviewer) => (
                        <SelectItem key={interviewer.id} value={interviewer.id}>
                          {getFullName(
                            interviewer.first_name,
                            interviewer.last_name,
                            interviewer.email
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date & Time
                  </Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={newInterview.date}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        date: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={newInterview.status}
                    onValueChange={(value) =>
                      setNewInterview({
                        ...newInterview,
                        status: value,
                      })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleCreateInterview}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Scheduling..." : "Schedule Interview"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Interviews</CardTitle>
            <CardDescription>
              View and manage all scheduled interviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="w-8 h-8 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
              </div>
            ) : interviews.length === 0 ? (
              <div className="text-center p-8 border rounded-lg bg-gray-50">
                <Calendar className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                <h3 className="text-lg font-medium">No interviews scheduled</h3>
                <p className="text-gray-600 mb-4">
                  Schedule your first interview to get started
                </p>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Schedule Interview
                  </Button>
                </DialogTrigger>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Interviewer</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interviews.map((interview) => (
                      <TableRow key={interview.id}>
                        <TableCell className="font-medium">
                          {interview.position}
                        </TableCell>
                        <TableCell>{interview.candidate_name}</TableCell>
                        <TableCell>
                          {interview.interviewer_name || "Not assigned"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-gray-500" />
                            {formatDate(interview.date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              interview.status === "Scheduled"
                                ? "bg-blue-100 text-blue-800"
                                : interview.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {interview.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenAssignExamsDialog(interview.id)}
                            >
                              <Book className="h-4 w-4" />
                              <span className="sr-only md:not-sr-only md:ml-2">
                                Exams
                              </span>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditInterview(interview);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setDeleteInterviewId(interview.id);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Interview Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Interview</DialogTitle>
            <DialogDescription>
              Update the interview details and assignments
            </DialogDescription>
          </DialogHeader>
          {editInterview && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-position" className="text-right">
                  Position
                </Label>
                <Input
                  id="edit-position"
                  value={editInterview.position}
                  onChange={(e) =>
                    setEditInterview({
                      ...editInterview,
                      position: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-candidate" className="text-right">
                  Candidate
                </Label>
                <Select
                  value={editInterview.candidate_id}
                  onValueChange={(value) =>
                    setEditInterview({
                      ...editInterview,
                      candidate_id: value,
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.id}>
                        {getFullName(
                          candidate.first_name,
                          candidate.last_name,
                          candidate.email
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-interviewer" className="text-right">
                  Interviewer
                </Label>
                <Select
                  value={editInterview.interviewer_id || ""}
                  onValueChange={(value) =>
                    setEditInterview({
                      ...editInterview,
                      interviewer_id: value || null,
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select interviewer (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {interviewers.map((interviewer) => (
                      <SelectItem key={interviewer.id} value={interviewer.id}>
                        {getFullName(
                          interviewer.first_name,
                          interviewer.last_name,
                          interviewer.email
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-date" className="text-right">
                  Date & Time
                </Label>
                <Input
                  id="edit-date"
                  type="datetime-local"
                  value={editInterview.date}
                  onChange={(e) =>
                    setEditInterview({
                      ...editInterview,
                      date: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <Select
                  value={editInterview.status}
                  onValueChange={(value) =>
                    setEditInterview({
                      ...editInterview,
                      status: value,
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleUpdateInterview}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Interview"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this interview? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteInterview}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Interview"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Exams Dialog */}
      <Dialog open={isAssignExamsDialogOpen} onOpenChange={setIsAssignExamsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Assessment Exams</DialogTitle>
            <DialogDescription>
              Select exams to assign to this interview. The candidate will be able to
              complete these assessments when they log in.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              {availableExams.map((exam) => (
                <div key={exam.id} className="flex items-start space-x-3 p-2 border rounded-md">
                  <Checkbox
                    id={exam.id}
                    checked={selectedExams.includes(exam.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedExams([...selectedExams, exam.id]);
                      } else {
                        setSelectedExams(selectedExams.filter((id) => id !== exam.id));
                      }
                    }}
                  />
                  <div className="space-y-1">
                    <Label htmlFor={exam.id} className="font-medium">
                      {exam.title}
                    </Label>
                    <div className="flex space-x-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        exam.difficulty === "Beginner" ? "bg-green-100 text-green-800" :
                        exam.difficulty === "Intermediate" ? "bg-blue-100 text-blue-800" :
                        "bg-purple-100 text-purple-800"
                      }`}>
                        {exam.difficulty}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        exam.category === "Technical" ? "bg-indigo-100 text-indigo-800" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {exam.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignExamsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleAssignExams}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Assigning..." : "Assign Exams"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default InterviewManagement;
