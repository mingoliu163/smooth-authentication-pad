
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { InterviewHeader } from "@/components/interviews/InterviewHeader";
import { NoAssessments } from "@/components/interviews/NoAssessments";
import { ExamSelector } from "@/components/interviews/ExamSelector";
import { ExamCard } from "@/components/interviews/ExamCard";

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

const InterviewDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

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
        }
      }
      
    } catch (error: any) {
      console.error("Error fetching interview details:", error);
      toast.error("Failed to load interview details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectExam = (exam: Exam) => {
    setSelectedExam(exam);
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
      
      <InterviewHeader interview={interview} />

      {exams.length === 0 ? (
        <NoAssessments />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <div className="p-4 border-b">
                <h3 className="text-lg font-medium">Assessments</h3>
                <p className="text-sm text-gray-500">Complete these assessments as part of your interview process</p>
              </div>
              <div className="p-4">
                <ExamSelector 
                  exams={exams}
                  selectedExam={selectedExam}
                  onSelectExam={handleSelectExam}
                />
              </div>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            {selectedExam && (
              <ExamCard selectedExam={selectedExam} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewDetail;
