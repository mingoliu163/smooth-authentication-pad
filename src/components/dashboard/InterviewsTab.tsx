
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, CalendarIcon, RefreshCw, Video } from "lucide-react";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { Badge } from "@/components/ui/badge";

interface Interview {
  id: string;
  date: string;
  candidate_id?: string;
  candidate_name: string;
  position: string;
  status: string;
  settings?: {
    interview_type?: string;
    ai_technical_test?: boolean;
    personality_test?: boolean;
  };
}

interface InterviewsTabProps {
  interviews: Interview[];
  isLoading: boolean;
  formatDate: (dateString: string) => string;
  onRefresh: () => void;
}

export const InterviewsTab = ({ 
  interviews, 
  isLoading, 
  formatDate,
  onRefresh
}: InterviewsTabProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Upcoming Interviews</CardTitle>
          <CardDescription>
            Your scheduled interviews and assessments
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState message="Loading your interviews..." />
        ) : interviews.length > 0 ? (
          <div className="space-y-4">
            {interviews.map((interview) => (
              <div key={interview.id} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{interview.position} Interview</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                      {formatDate(interview.date)}
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                    interview.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                    interview.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {interview.status}
                  </span>
                </div>
                
                {interview.settings && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {interview.settings.interview_type && (
                      <Badge variant="outline" className="capitalize">{interview.settings.interview_type}</Badge>
                    )}
                    {interview.settings.ai_technical_test && (
                      <Badge variant="outline">Technical Test</Badge>
                    )}
                    {interview.settings.personality_test && (
                      <Badge variant="outline">Personality Test</Badge>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between mt-3">
                  <Button asChild variant="secondary" size="sm">
                    <Link to={`/interviews/${interview.id}`}>
                      <Video className="mr-2 h-4 w-4" />
                      AI Interview
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/interviews/${interview.id}`}>
                      View Details
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            title="No interviews found" 
            message="No interviews are currently associated with your account. If you believe this is an error, please try refreshing or contact support."
            icon={<CalendarIcon className="mx-auto h-10 w-10 text-gray-400 mb-3" />}
            onRefresh={onRefresh}
          />
        )}
      </CardContent>
    </Card>
  );
};
