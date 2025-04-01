
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  created_at: string;
}

interface RecommendationsTabProps {
  jobs: Job[];
  isLoading: boolean;
}

export const RecommendationsTab = ({ jobs, isLoading }: RecommendationsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended for You</CardTitle>
        <CardDescription>
          Jobs that match your profile and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState />
        ) : jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4">
                <div>
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="text-sm text-gray-600">{job.company}</p>
                  <p className="text-sm text-gray-600">{job.location}</p>
                </div>
                <div className="flex justify-end mt-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/jobs/${job.id}`}>
                      View Job
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            title="No recommendations yet" 
            message="We're still learning about your preferences. Check back later for personalized job recommendations." 
            actionLabel="Browse All Jobs" 
            actionLink="/jobs" 
          />
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link to="/jobs">View All Available Jobs</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
