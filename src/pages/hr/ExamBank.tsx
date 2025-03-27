
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
import { Book, PlusCircle, Edit, Trash2, RefreshCcw, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Exam {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  category: string;
  created_at: string;
}

const ExamBank = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<string>("Beginner");
  const [category, setCategory] = useState<string>("Technical");

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('exam_bank')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setExams(data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error("Failed to load exams");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleCreateExam = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('exam_bank')
        .insert({
          title,
          description: description || null,
          difficulty,
          category,
          created_by: user?.id
        })
        .select();

      if (error) throw error;

      toast.success("Exam created successfully");
      setIsCreateModalOpen(false);
      resetForm();
      fetchExams();
    } catch (error) {
      console.error('Error creating exam:', error);
      toast.error("Failed to create exam");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExam = async () => {
    if (!selectedExam) return;

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('exam_bank')
        .delete()
        .eq('id', selectedExam.id);

      if (error) throw error;

      toast.success("Exam deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedExam(null);
      
      // Remove from state
      setExams(exams.filter(e => e.id !== selectedExam.id));
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error("Failed to delete exam");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (exam: Exam) => {
    setSelectedExam(exam);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDifficulty("Beginner");
    setCategory("Technical");
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
    <AdminLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Exam Bank</h1>
          <div className="flex space-x-2">
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Create Exam
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Exam</DialogTitle>
                  <DialogDescription>
                    Add a new exam to the exam bank
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Exam Title</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g., JavaScript Fundamentals" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Briefly describe this exam" 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select 
                      value={difficulty} 
                      onValueChange={setDifficulty}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={category} 
                      onValueChange={setCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Behavioral">Behavioral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleCreateExam} 
                    disabled={isLoading || !title.trim()}
                  >
                    {isLoading ? "Creating..." : "Create Exam"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={() => {
              setIsRefreshing(true);
              fetchExams();
            }} disabled={isRefreshing}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        {isLoading && !isRefreshing ? (
          <div className="text-center py-8">Loading exams...</div>
        ) : exams.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">No exams found</p>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateModalOpen(true)}
                className="mx-auto"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create your first exam
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam) => (
              <Card key={exam.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-primary" />
                        {exam.title}
                      </CardTitle>
                      <CardDescription>
                        {exam.description || "No description provided"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exam.difficulty)}`}>
                      {exam.difficulty}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(exam.category)}`}>
                      {exam.category}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Created {formatDate(exam.created_at)}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toast.info("Edit feature coming soon")}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => confirmDelete(exam)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
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
              Are you sure you want to delete the exam "{selectedExam?.title}"? 
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
              onClick={handleDeleteExam}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Exam"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ExamBank;
