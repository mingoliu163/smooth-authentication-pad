import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Send, CalendarIcon, Clock, RefreshCw, CheckCircle2, BookOpen, Bot } from "lucide-react";

interface Interview {
  id: string;
  date: string;
  candidate_name: string;
  position: string;
  status: string;
}

interface Exam {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  description: string | null;
}

interface AIMessage {
  role: "assistant" | "user";
  content: string;
}

const InterviewDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInterviewDetails();
  }, [id]);

  const fetchInterviewDetails = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      
      // Fetch the interview
      const { data: interviewData, error: interviewError } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', id)
        .single();
      
      if (interviewError) {
        throw interviewError;
      }
      
      if (!interviewData) {
        throw new Error("Interview not found");
      }
      
      setInterview(interviewData);
      
      // Fetch exams for this interview
      const { data: examLinks, error: examLinksError } = await supabase
        .from('interview_exams')
        .select('exam_id')
        .eq('interview_id', id);
      
      if (examLinksError) {
        throw examLinksError;
      }
      
      if (examLinks && examLinks.length > 0) {
        const examIds = examLinks.map(link => link.exam_id);
        
        const { data: examsData, error: examsError } = await supabase
          .from('exam_bank')
          .select('*')
          .in('id', examIds);
        
        if (examsError) {
          throw examsError;
        }
        
        if (examsData && examsData.length > 0) {
          setExams(examsData);
          setSelectedExam(examsData[0]); // Select the first exam by default
          
          // Initialize AI conversation for the first exam
          const initialPrompt = getInitialPrompt(examsData[0]);
          setMessages([{ role: "assistant", content: initialPrompt }]);
        }
      }
      
    } catch (error: any) {
      console.error("Error fetching interview details:", error);
      toast.error("Failed to load interview details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const getInitialPrompt = (exam: Exam) => {
    if (exam.category === "Technical") {
      return `Hello! I'm your technical interviewer for the ${exam.title} assessment. This is a ${exam.difficulty} level technical evaluation. ${exam.description || ''}

I'll ask you a series of technical questions related to the position you're applying for. Please respond to each question with your best answer. I'll provide feedback and follow-up questions based on your responses.

Let's begin with your first question: Please introduce yourself and explain your relevant technical experience for this position.`;
    } else {
      return `Hello! I'm your interviewer for the ${exam.title} assessment. This is designed to evaluate your ${exam.category.toLowerCase()} skills and fit for the role. ${exam.description || ''}

I'll ask you a series of questions to better understand your work style, problem-solving approach, and how you handle various professional situations.

Let's begin with your first question: Could you tell me about yourself and what interests you about this position?`;
    }
  };

  const handleSelectExam = (exam: Exam) => {
    setSelectedExam(exam);
    
    // Reset the conversation with a new initial prompt for this exam
    const initialPrompt = getInitialPrompt(exam);
    setMessages([{ role: "assistant", content: initialPrompt }]);
    
    // Scroll to the bottom
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !selectedExam) return;
    
    const userMessage = { role: "user" as const, content: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput("");
    setIsAILoading(true);
    
    // Simulate AI thinking (in a real app, we would call an API endpoint)
    setTimeout(() => {
      let aiResponse = "";
      
      // Generate a contextual response based on the exam type and user input
      if (selectedExam.category === "Technical") {
        if (userInput.toLowerCase().includes("experience") || messages.length <= 1) {
          aiResponse = "Thank you for sharing that. Now, let's dive into some technical questions.\n\nCan you explain how you would approach debugging a complex issue in a production environment?";
        } else if (userInput.toLowerCase().includes("debug") || userInput.toLowerCase().includes("production")) {
          aiResponse = "That's a good approach to debugging. Let's move to a more specific question related to your technical skills.\n\n";
          
          // Add a domain-specific question
          if (selectedExam.title.toLowerCase().includes("frontend")) {
            aiResponse += "How would you optimize the performance of a React application that's rendering a large dataset?";
          } else if (selectedExam.title.toLowerCase().includes("backend")) {
            aiResponse += "How would you design a scalable API that needs to handle high traffic and maintain data consistency?";
          } else if (selectedExam.title.toLowerCase().includes("data")) {
            aiResponse += "Can you explain your approach to cleaning and preparing a large dataset for analysis?";
          } else {
            aiResponse += "Tell me about a challenging technical project you worked on and how you overcame obstacles.";
          }
        } else {
          aiResponse = "Thank you for your detailed answer. One more question: How do you stay updated with the latest technologies and best practices in your field?";
        }
      } else { // Behavioral questions
        if (messages.length <= 1) {
          aiResponse = "Thank you for introducing yourself. I'd like to understand more about your work style.\n\nCan you describe a challenging situation you faced in a previous role and how you handled it?";
        } else if (userInput.toLowerCase().includes("challenge") || userInput.toLowerCase().includes("situation")) {
          aiResponse = "That's a great example of problem-solving. Now I'd like to know:\n\nHow do you prioritize tasks when you have multiple deadlines approaching?";
        } else if (userInput.toLowerCase().includes("prioritize") || userInput.toLowerCase().includes("deadline")) {
          aiResponse = "Effective prioritization is important. Let's talk about teamwork:\n\nCan you tell me about a time when you had to collaborate with a difficult team member? How did you handle it?";
        } else {
          aiResponse = "Thank you for sharing that experience. Final question:\n\nWhere do you see yourself professionally in five years, and how does this role align with your career goals?";
        }
      }
      
      const aiMessage = { role: "assistant" as const, content: aiResponse };
      setMessages(prev => [...prev, aiMessage]);
      setIsAILoading(false);
    }, 2000);
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Loading interview details...</p>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Interview Not Found</h1>
        <p className="text-gray-600 mb-6">The interview you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button asChild>
          <Link to="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{interview.position} Interview</h1>
        <div className="flex items-center text-gray-600 gap-4 mb-4">
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDate(interview.date)}
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            {new Date(interview.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            interview.status === "Scheduled" ? "bg-blue-100 text-blue-800" : 
            interview.status === "Completed" ? "bg-green-100 text-green-800" : 
            "bg-gray-100 text-gray-800"
          }`}>
            {interview.status}
          </div>
        </div>
      </div>

      {exams.length === 0 ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>No Assessments Available</CardTitle>
            <CardDescription>
              There are no assessments assigned to this interview yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Please check back later or contact the hiring team for more information about your interview process.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Assessments</CardTitle>
                <CardDescription>Complete these assessments as part of your interview process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {exams.map((exam) => (
                    <Button 
                      key={exam.id}
                      variant={selectedExam?.id === exam.id ? "default" : "outline"}
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() => handleSelectExam(exam)}
                    >
                      <div className="flex items-start">
                        <BookOpen className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">{exam.title}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(exam.difficulty)}`}>
                              {exam.difficulty}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(exam.category)}`}>
                              {exam.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            {selectedExam && (
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedExam.title}</CardTitle>
                      <CardDescription className="mt-1">
                        AI-powered {selectedExam.category} assessment ({selectedExam.difficulty})
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(selectedExam.difficulty)}`}>
                        {selectedExam.difficulty}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(selectedExam.category)}`}>
                        {selectedExam.category}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-grow overflow-hidden flex flex-col">
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-600">
                      This is an AI-powered assessment. The AI will ask you a series of questions related to the {selectedExam.category.toLowerCase()} aspects of the role. 
                      Answer the questions as you would in a real interview. Your responses will help the hiring team understand your qualifications better.
                    </p>
                  </div>
                  
                  <div className="flex-grow overflow-y-auto mb-4 pr-2" style={{ maxHeight: "400px" }}>
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div key={index} className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
                          <div className={`max-w-[80%] rounded-lg p-4 ${
                            message.role === "assistant" 
                              ? "bg-gray-100 text-gray-800" 
                              : "bg-blue-500 text-white"
                          }`}>
                            {message.role === "assistant" && (
                              <div className="flex items-center mb-2">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarFallback className="bg-purple-100 text-purple-800">AI</AvatarFallback>
                                  <AvatarImage src="/placeholder.svg" />
                                </Avatar>
                                <span className="text-xs font-medium">AI Interviewer</span>
                              </div>
                            )}
                            <div className="whitespace-pre-line">{message.content}</div>
                          </div>
                        </div>
                      ))}
                      {isAILoading && (
                        <div className="flex justify-start">
                          <div className="max-w-[80%] rounded-lg p-4 bg-gray-100">
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarFallback className="bg-purple-100 text-purple-800">AI</AvatarFallback>
                              </Avatar>
                              <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Textarea
                      placeholder="Type your response here..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="resize-none pr-12"
                      rows={3}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      className="absolute bottom-3 right-3"
                      onClick={handleSendMessage}
                      disabled={!userInput.trim() || isAILoading}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between border-t pt-4">
                  <p className="text-xs text-gray-500">
                    <Bot className="h-3 w-3 inline-block mr-1" />
                    AI responses are generated for practice purposes only
                  </p>
                  <Button variant="outline" size="sm" onClick={() => handleSelectExam(selectedExam)}>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Reset Conversation
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewDetail;
