import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { PlusCircle, Edit, Trash2, FileText, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AssessmentQuestion {
  id: string;
  questionText: string;
  questionType: "multiple_choice" | "text" | "coding";
  options?: { text: string; isCorrect: boolean }[];
  expectedAnswer?: string;
  points: number;
  questionOrder: number;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  assessmentType: "technical" | "behavioral";
  created_at: string;
  questions: AssessmentQuestion[];
}

const AssessmentManagement = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assessmentType, setAssessmentType] = useState<"technical" | "behavioral">("technical");

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setIsLoading(true);
      
      // Fetch assessments
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (assessmentsError) throw assessmentsError;

      if (assessmentsData) {
        // For each assessment, fetch its questions
        const assessmentsWithQuestions = await Promise.all(
          assessmentsData.map(async (assessment) => {
            const { data: questionsData, error: questionsError } = await supabase
              .from('assessment_questions')
              .select('*')
              .eq('assessment_id', assessment.id)
              .order('question_order', { ascending: true });

            if (questionsError) console.error('Error fetching questions:', questionsError);

            // Properly convert the questions data
            const questions: AssessmentQuestion[] = (questionsData || []).map(q => ({
              id: q.id,
              questionText: q.question_text,
              questionType: q.question_type as "multiple_choice" | "text" | "coding",
              options: q.options ? (Array.isArray(q.options) 
                ? q.options as { text: string; isCorrect: boolean }[]
                : [{ text: String(q.options), isCorrect: true }])
                : undefined,
              expectedAnswer: q.expected_answer || '',
              points: q.points,
              questionOrder: q.question_order
            }));

            return {
              id: assessment.id,
              title: assessment.title,
              description: assessment.description || '',
              assessmentType: assessment.assessment_type as "technical" | "behavioral",
              created_at: assessment.created_at,
              questions
            };
          })
        );

        setAssessments(assessmentsWithQuestions);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast.error("Failed to load assessments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAssessment = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      setIsLoading(true);
      
      // Insert the new assessment
      const { data, error } = await supabase
        .from('assessments')
        .insert({
          title,
          description,
          assessment_type: assessmentType,
          created_by: 'system' // This would be the actual user ID in a real app
        })
        .select();

      if (error) throw error;

      if (data && data[0]) {
        toast.success("Assessment created successfully");
        setIsCreateModalOpen(false);
        resetForm();
        
        // Navigate to edit page for the new assessment
        navigate(`/hr/assessments/${data[0].id}/edit`);
      }
    } catch (error) {
      console.error('Error creating assessment:', error);
      toast.error("Failed to create assessment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAssessment = async () => {
    if (!selectedAssessment) return;

    try {
      setIsLoading(true);
      
      // First delete the questions
      const { error: questionsError } = await supabase
        .from('assessment_questions')
        .delete()
        .eq('assessment_id', selectedAssessment.id);

      if (questionsError) throw questionsError;
      
      // Then delete the assessment
      const { error: assessmentError } = await supabase
        .from('assessments')
        .delete()
        .eq('id', selectedAssessment.id);

      if (assessmentError) throw assessmentError;

      toast.success("Assessment deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedAssessment(null);
      
      // Remove from state
      setAssessments(assessments.filter(a => a.id !== selectedAssessment.id));
    } catch (error) {
      console.error('Error deleting assessment:', error);
      toast.error("Failed to delete assessment");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAssessmentType("technical");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Assessment Management</h1>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Create Assessment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Assessment</DialogTitle>
                <DialogDescription>
                  Create a new assessment template for interviews
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Assessment Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., JavaScript Technical Assessment" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Briefly describe this assessment" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Assessment Type</Label>
                  <Select 
                    value={assessmentType} 
                    onValueChange={(value) => setAssessmentType(value as "technical" | "behavioral")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assessment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="behavioral">Behavioral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleCreateAssessment} 
                  disabled={isLoading || !title.trim()}
                >
                  {isLoading ? "Creating..." : "Create & Edit Questions"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading && assessments.length === 0 ? (
          <div className="text-center py-8">Loading assessments...</div>
        ) : assessments.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">No assessments found</p>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateModalOpen(true)}
                className="mx-auto"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create your first assessment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessments.map((assessment) => (
              <Card key={assessment.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{assessment.title}</CardTitle>
                      <CardDescription>
                        {assessment.assessmentType.charAt(0).toUpperCase() + assessment.assessmentType.slice(1)} Assessment
                      </CardDescription>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      assessment.assessmentType === "technical" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-purple-100 text-purple-800"
                    }`}>
                      {assessment.assessmentType}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                    {assessment.description || "No description provided"}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <FileText className="h-3 w-3 mr-1" />
                    {assessment.questions.length} {assessment.questions.length === 1 ? 'question' : 'questions'}
                  </div>
                  <div className="text-xs text-gray-400">
                    Created {formatDate(assessment.created_at)}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/hr/assessments/${assessment.id}/edit`)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toast.success("Duplicated assessment")}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Duplicate
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => confirmDelete(assessment)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the assessment "{selectedAssessment?.title}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAssessment}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Assessment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AssessmentManagement;
