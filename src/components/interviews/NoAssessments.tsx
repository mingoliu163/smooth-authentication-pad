
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const NoAssessments = () => {
  return (
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
  );
};
