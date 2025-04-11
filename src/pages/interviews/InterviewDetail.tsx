
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Info, User, Video } from "lucide-react";
import { InterviewHeader } from "@/components/interviews/InterviewHeader";
import { AIChat } from "@/components/interviews/AIChat";
import { ExamCard } from "@/components/interviews/ExamCard";
import { EmptyInterviewState } from "@/components/interviews/EmptyInterviewState";
import { NoAssessments } from "@/components/interviews/NoAssessments";
import { PreparationDialog } from "@/components/interviews/PreparationDialog";

interface Interview {
  id: string;
  date: string;
  candidate_id: string;
  candidate_name: string;
  interviewer_id: string | null;
  position: string;
  status: string;
  settings?: {
    interview_mode?: string;
    interview_type?: string;
    environment?: string;
    lighting?: string;
    experience_level?: string;
    ai_technical_test?: boolean;
    personality_test?: boolean;
    notes?: string;
  };
}

interface Exam {
  id: string;
  title: string;
  difficulty: string;
  category: string;
}

const InterviewDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isPreparationDialogOpen, setIsPreparationDialogOpen] = useState(false);
  const [interviewSettings, setInterviewSettings] = useState<any>({});

  const { data: interview, isLoading: interviewLoading } = useQuery({
    queryKey: ["interview", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interviews")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Interview;
    },
  });

  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ["interview-exams", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interview_exams")
        .select(`
          exam_id,
          exam_bank(id, title, difficulty, category)
        `)
        .eq("interview_id", id);

      if (error) throw error;
      return data.map((item) => item.exam_bank) as Exam[];
    },
  });

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleStartAIInterview = () => {
    setIsPreparationDialogOpen(true);
  };

  const handleStartInterview = (settings: any) => {
    setInterviewSettings({
      ...interview?.settings,
      ...settings
    });
    setIsPreparationDialogOpen(false);
    setActiveTab("ai-interview");
  };

  if (interviewLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Interview Not Found</CardTitle>
            <CardDescription>
              The interview you're looking for could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <InterviewHeader interview={interview} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="ai-interview">AI Interview</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
              <CardDescription>
                Information about the scheduled interview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Date
                  </div>
                  <div className="font-medium">{formatDate(interview.date)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Candidate
                  </div>
                  <div className="font-medium">{interview.candidate_name}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500 flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Position
                  </div>
                  <div className="font-medium">{interview.position}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Status
                  </div>
                  <Badge variant={interview.status === "Completed" ? "success" : "default"}>
                    {interview.status}
                  </Badge>
                </div>
              </div>

              {interview.settings && (
                <>
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="font-medium text-lg mb-4">Interview Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {interview.settings.interview_mode && (
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Interview Mode</div>
                          <div className="font-medium capitalize">
                            {interview.settings.interview_mode}
                          </div>
                        </div>
                      )}
                      {interview.settings.interview_type && (
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Interview Type</div>
                          <div className="font-medium capitalize">
                            {interview.settings.interview_type}
                          </div>
                        </div>
                      )}
                      {interview.settings.experience_level && (
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Experience Level</div>
                          <div className="font-medium capitalize">
                            {interview.settings.experience_level === 'entry' ? 'Entry Level' :
                             interview.settings.experience_level === 'mid' ? 'Mid Level' :
                             interview.settings.experience_level === 'senior' ? 'Senior Level' :
                             'Leadership Position'}
                          </div>
                        </div>
                      )}
                      {interview.settings.environment && (
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Environment</div>
                          <div className="font-medium capitalize">
                            {interview.settings.environment}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6">
                      <h4 className="font-medium mb-2">Tests</h4>
                      <div className="flex flex-wrap gap-2">
                        {interview.settings.ai_technical_test && (
                          <Badge variant="outline">Technical Test</Badge>
                        )}
                        {interview.settings.personality_test && (
                          <Badge variant="outline">Personality Test</Badge>
                        )}
                        {!interview.settings.ai_technical_test && !interview.settings.personality_test && (
                          <span className="text-gray-500">No tests assigned</span>
                        )}
                      </div>
                    </div>

                    {interview.settings.notes && (
                      <div className="mt-6">
                        <h4 className="font-medium mb-2">Notes</h4>
                        <p className="text-gray-700 whitespace-pre-line">
                          {interview.settings.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="mt-6 pt-6 border-t border-gray-100">
                <Button onClick={handleStartAIInterview}>
                  <Video className="mr-2 h-4 w-4" />
                  Start AI Interview
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="mt-6">
          {examsLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ) : exams && exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          ) : (
            <NoAssessments />
          )}
        </TabsContent>

        <TabsContent value="ai-interview" className="mt-6">
          {activeTab === "ai-interview" ? (
            <AIChat 
              interviewId={id || ''} 
              candidateName={interview.candidate_name}
              position={interview.position}
              settings={interviewSettings}
            />
          ) : (
            <EmptyInterviewState onStart={handleStartAIInterview} />
          )}
        </TabsContent>
      </Tabs>

      <PreparationDialog 
        open={isPreparationDialogOpen} 
        onOpenChange={setIsPreparationDialogOpen}
        onStartInterview={handleStartInterview}
        interview={interview}
      />
    </div>
  );
};

export default InterviewDetail;
