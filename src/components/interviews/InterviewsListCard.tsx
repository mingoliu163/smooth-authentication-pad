
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InterviewsTable } from "./InterviewsTable";
import { EmptyInterviewState } from "./EmptyInterviewState";

interface InterviewsListCardProps {
  isLoading: boolean;
  interviews: any[];
  candidates: any[];
  interviewers: any[];
  exams: any[];
  onRefresh: () => void;
}

export const InterviewsListCard = ({
  isLoading,
  interviews,
  candidates,
  interviewers,
  exams,
  onRefresh,
}: InterviewsListCardProps) => {
  // 添加一个处理开始面试的函数
  const handleStartInterview = () => {
    console.log("Starting interview preparation...");
    // 这里可以添加导航到面试准备页面的逻辑
  };

  return (
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
          <EmptyInterviewState 
            onStart={handleStartInterview}
            candidates={candidates}
            interviewers={interviewers}
            onSuccess={onRefresh}
          />
        ) : (
          <InterviewsTable 
            interviews={interviews}
            candidates={candidates}
            interviewers={interviewers}
            exams={exams}
            onRefresh={onRefresh}
          />
        )}
      </CardContent>
    </Card>
  );
};
