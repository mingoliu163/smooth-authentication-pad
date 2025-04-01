
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const LoadingState = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
