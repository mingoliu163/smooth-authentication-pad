import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, PlusCircle, Trash2, GripVertical, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AssessmentQuestion {
  id?: string;
  questionText: string;
  questionType: "multiple_choice" | "text" | "coding";
  options?: { text: string; isCorrect: boolean }[];
  expectedAnswer?: string;
  points: number;
  questionOrder: number;
  isNew?: boolean;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  assessmentType: "technical" | "behavioral";
}

const AssessmentEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // New question form state
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState<AssessmentQuestion>({
    questionText: "",
    questionType: "text",
    options: [{ text: "", isCorrect: false }],
    expectedAnswer: "",
    points: 1,
    questionOrder: 0
  });

  // Delete confirmation
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAssessmentAndQuestions();
    }
  }, [id]);

  const fetchAssessmentAndQuestions = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      
      // Fetch assessment details
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', id)
        .single();

      if (assessmentError) throw assessmentError;

      if (assessmentData) {
        setAssessment({
          id: assessmentData.id,
          title: assessmentData.title,
          description: assessmentData.description || '',
          assessmentType: assessmentData.assessment_type as "technical" | "behavioral",
        });
        
        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('assessment_questions')
          .select('*')
          .eq('assessment_id', id)
          .order('question_order', { ascending: true });

        if (questionsError) throw questionsError;

        if (questionsData) {
          // Convert the data to the expected format
          const formattedQuestions: AssessmentQuestion[] = questionsData.map(q => ({
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
          
          setQuestions(formattedQuestions);
        }
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
      toast.error("Failed to load assessment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.questionText.trim()) {
      toast.error("Question text is required");
      return;
    }

    // Add new question to the list
    const updatedQuestions = [...questions];
    const nextOrder = questions.length > 0 
      ? Math.max(...questions.map(q => q.questionOrder)) + 1 
      : 0;
    
    updatedQuestions.push({
      ...newQuestion,
      questionOrder: nextOrder,
      isNew: true
    });
    
    setQuestions(updatedQuestions);
    resetNewQuestionForm();
    setShowQuestionForm(false);
    toast.success("Question added");
  };

  const handleDeleteQuestion = (questionId?: string) => {
    if (!questionId) return;
    
    setQuestionToDelete(questionId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteQuestion = async () => {
    if (!questionToDelete) return;

    try {
      // If it's an existing question (has an ID but not isNew), delete from database
      const questionToRemove = questions.find(q => q.id === questionToDelete);
      
      if (questionToRemove && questionToRemove.id && !questionToRemove.isNew) {
        const { error } = await supabase
          .from('assessment_questions')
          .delete()
          .eq('id', questionToDelete);

        if (error) throw error;
      }
      
      // Remove from state
      setQuestions(questions.filter(q => q.id !== questionToDelete));
      toast.success("Question removed");
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error("Failed to delete question");
    } finally {
      setShowDeleteDialog(false);
      setQuestionToDelete(null);
    }
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    if (!updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options = [];
    }
    updatedQuestions[questionIndex].options![optionIndex] = {
      ...updatedQuestions[questionIndex].options![optionIndex],
      text: value
    };
    setQuestions(updatedQuestions);
  };

  const handleCorrectOptionChange = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    if (!updatedQuestions[questionIndex].options) return;
    
    // Set all options to false first
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options!.map(
      (opt, idx) => ({ ...opt, isCorrect: idx === optionIndex })
    );
    
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    if (!updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options = [];
    }
    updatedQuestions[questionIndex].options!.push({ text: "", isCorrect: false });
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options!.splice(optionIndex, 1);
    setQuestions(updatedQuestions);
  };

  const handleQuestionChange = (index: number, field: keyof AssessmentQuestion, value: any) => {
    const updatedQuestions = [...questions];
    
    // Special handling for question type change
    if (field === 'questionType') {
      if (value === 'multiple_choice' && (!updatedQuestions[index].options || updatedQuestions[index].options!.length === 0)) {
        updatedQuestions[index].options = [{ text: "", isCorrect: true }];
      }
    }
    
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    
    setQuestions(updatedQuestions);
  };

  const saveAssessment = async () => {
    if (!assessment) return;
    
    try {
      setIsSaving(true);
      
      // For each question, either insert new or update existing
      for (const question of questions) {
        if (question.isNew || !question.id) {
          // Insert new question
          const { error } = await supabase
            .from('assessment_questions')
            .insert({
              assessment_id: assessment.id,
              question_text: question.questionText,
              question_type: question.questionType,
              options: question.options || null,
              expected_answer: question.expectedAnswer || null,
              points: question.points,
              question_order: question.questionOrder
            });
          
          if (error) throw error;
        } else {
          // Update existing question
          const { error } = await supabase
            .from('assessment_questions')
            .update({
              question_text: question.questionText,
              question_type: question.questionType,
              options: question.options || null,
              expected_answer: question.expectedAnswer || null,
              points: question.points,
              question_order: question.questionOrder
            })
            .eq('id', question.id);
          
          if (error) throw error;
        }
      }
      
      toast.success("Assessment saved successfully");
      
      // Refresh data to get new IDs
      fetchAssessmentAndQuestions();
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error("Failed to save assessment");
    } finally {
      setIsSaving(false);
    }
  };

  const resetNewQuestionForm = () => {
    setNewQuestion({
      questionText: "",
      questionType: "text",
      options: [{ text: "", isCorrect: true }],
      expectedAnswer: "",
      points: 1,
      questionOrder: 0
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-8">
          <div className="text-center">Loading assessment...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!assessment) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-8">
          <div className="text-center">Assessment not found</div>
          <Button 
            className="mt-4 mx-auto block" 
            onClick={() => navigate('/hr/assessments')}
          >
            Back to Assessments
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="mr-2"
              onClick={() => navigate('/hr/assessments')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Editing: {assessment.title}</h1>
          </div>
          <Button 
            onClick={saveAssessment}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Assessment"}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Assessment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    value={assessment.title} 
                    onChange={(e) => setAssessment({...assessment, title: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={assessment.assessmentType} 
                    onValueChange={(value) => setAssessment({...assessment, assessmentType: value as "technical" | "behavioral"})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select assessment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="behavioral">Behavioral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={assessment.description} 
                  onChange={(e) => setAssessment({...assessment, description: e.target.value})}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Questions ({questions.length})</h2>
            <Button 
              onClick={() => {
                resetNewQuestionForm();
                setShowQuestionForm(!showQuestionForm);
              }}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add Question
            </Button>
          </div>

          {/* New Question Form */}
          {showQuestionForm && (
            <Card className="mb-6 border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">New Question</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="questionText">Question Text</Label>
                    <Textarea 
                      id="questionText" 
                      value={newQuestion.questionText} 
                      onChange={(e) => setNewQuestion({...newQuestion, questionText: e.target.value})}
                      className="mt-1"
                      rows={3}
                      placeholder="Enter your question here..."
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="questionType">Question Type</Label>
                      <Select 
                        value={newQuestion.questionType} 
                        onValueChange={(value) => {
                          setNewQuestion({
                            ...newQuestion, 
                            questionType: value as "multiple_choice" | "text" | "coding",
                            options: value === "multiple_choice" ? [{ text: "", isCorrect: true }] : undefined
                          });
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text Response</SelectItem>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="coding">Coding Challenge</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="points">Points</Label>
                      <Input 
                        id="points" 
                        type="number" 
                        min="1"
                        value={newQuestion.points} 
                        onChange={(e) => setNewQuestion({...newQuestion, points: parseInt(e.target.value) || 1})}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {newQuestion.questionType === "multiple_choice" && (
                    <div className="mt-2">
                      <Label className="mb-2 block">Answer Options</Label>
                      {newQuestion.options?.map((option, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2 mb-2">
                          <Input 
                            value={option.text} 
                            onChange={(e) => {
                              const updatedOptions = [...(newQuestion.options || [])];
                              updatedOptions[optIdx] = { ...updatedOptions[optIdx], text: e.target.value };
                              setNewQuestion({...newQuestion, options: updatedOptions});
                            }}
                            placeholder={`Option ${optIdx + 1}`}
                            className="flex-grow"
                          />
                          <Button 
                            type="button" 
                            variant={option.isCorrect ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const updatedOptions = [...(newQuestion.options || [])].map(
                                (opt, idx) => ({ ...opt, isCorrect: idx === optIdx })
                              );
                              setNewQuestion({...newQuestion, options: updatedOptions});
                            }}
                            className="whitespace-nowrap"
                          >
                            {option.isCorrect ? "Correct Answer" : "Mark as Correct"}
                          </Button>
                          {(newQuestion.options?.length || 0) > 1 && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const updatedOptions = [...(newQuestion.options || [])];
                                updatedOptions.splice(optIdx, 1);
                                setNewQuestion({...newQuestion, options: updatedOptions});
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const updatedOptions = [...(newQuestion.options || [])];
                          updatedOptions.push({ text: "", isCorrect: false });
                          setNewQuestion({...newQuestion, options: updatedOptions});
                        }}
                        className="mt-2"
                      >
                        Add Option
                      </Button>
                    </div>
                  )}

                  {(newQuestion.questionType === "text" || newQuestion.questionType === "coding") && (
                    <div>
                      <Label htmlFor="expectedAnswer">Expected Answer (Optional)</Label>
                      <Textarea 
                        id="expectedAnswer" 
                        value={newQuestion.expectedAnswer || ''} 
                        onChange={(e) => setNewQuestion({...newQuestion, expectedAnswer: e.target.value})}
                        className="mt-1"
                        rows={3}
                        placeholder="Enter an example of a good answer for reference..."
                      />
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowQuestionForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddQuestion}
                  disabled={!newQuestion.questionText.trim()}
                >
                  Add Question
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Existing Questions */}
          {questions.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">No questions added yet</p>
                <Button 
                  variant="outline" 
                  onClick={() => setShowQuestionForm(true)}
                  className="mx-auto"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add your first question
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {questions.map((question, qIdx) => (
                <Card key={question.id || `new-${qIdx}`} className="relative">
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-muted rounded-full w-6 h-6 flex items-center justify-center">
                        <span className="text-xs font-medium">{qIdx + 1}</span>
                      </div>
                      <CardTitle className="text-base">
                        {question.questionText.length > 60 
                          ? `${question.questionText.substring(0, 60)}...` 
                          : question.questionText}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        question.questionType === "multiple_choice" 
                          ? "bg-blue-100 text-blue-800" 
                          : question.questionType === "coding"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {question.questionType === "multiple_choice" 
                          ? "Multiple Choice" 
                          : question.questionType === "coding"
                          ? "Coding Challenge"
                          : "Text Response"}
                      </span>
                      <span className="text-xs text-gray-500">{question.points} {question.points === 1 ? 'point' : 'points'}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor={`q-${qIdx}-text`}>Question Text</Label>
                        <Textarea 
                          id={`q-${qIdx}-text`}
                          value={question.questionText} 
                          onChange={(e) => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`q-${qIdx}-type`}>Question Type</Label>
                          <Select 
                            value={question.questionType} 
                            onValueChange={(value) => handleQuestionChange(qIdx, 'questionType', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select question type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text Response</SelectItem>
                              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                              <SelectItem value="coding">Coding Challenge</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor={`q-${qIdx}-points`}>Points</Label>
                          <Input 
                            id={`q-${qIdx}-points`}
                            type="number" 
                            min="1"
                            value={question.points} 
                            onChange={(e) => handleQuestionChange(qIdx, 'points', parseInt(e.target.value) || 1)}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      {question.questionType === "multiple_choice" && (
                        <div className="mt-2">
                          <Label className="mb-2 block">Answer Options</Label>
                          {question.options?.map((option, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2 mb-2">
                              <Input 
                                value={option.text} 
                                onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                                placeholder={`Option ${optIdx + 1}`}
                                className="flex-grow"
                              />
                              <Button 
                                type="button" 
                                variant={option.isCorrect ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleCorrectOptionChange(qIdx, optIdx)}
                                className="whitespace-nowrap"
                              >
                                {option.isCorrect ? "Correct Answer" : "Mark as Correct"}
                              </Button>
                              {(question.options?.length || 0) > 1 && (
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => removeOption(qIdx, optIdx)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => addOption(qIdx)}
                            className="mt-2"
                          >
                            Add Option
                          </Button>
                        </div>
                      )}

                      {(question.questionType === "text" || question.questionType === "coding") && (
                        <div>
                          <Label htmlFor={`q-${qIdx}-expected`}>Expected Answer (Optional)</Label>
                          <Textarea 
                            id={`q-${qIdx}-expected`}
                            value={question.expectedAnswer || ''} 
                            onChange={(e) => handleQuestionChange(qIdx, 'expectedAnswer', e.target.value)}
                            className="mt-1"
                            rows={3}
                            placeholder="Enter an example of a good answer for reference..."
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove Question
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          {questions.length > 0 && (
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={saveAssessment}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Assessment"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Question Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteQuestion}
            >
              Delete Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AssessmentEditor;
