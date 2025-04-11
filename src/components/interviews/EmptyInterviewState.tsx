
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

interface EmptyInterviewStateProps {
  onStart: () => void;
}

export const EmptyInterviewState: React.FC<EmptyInterviewStateProps> = ({ onStart }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Interview</CardTitle>
        <CardDescription>
          Complete your interview preparation to start the AI interview
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-8">
        <Video className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium mb-2">Your AI Interview is Ready</h3>
        <p className="text-gray-500 text-center mb-6 max-w-md">
          Set your preferences and prepare for the interview before starting. This 
          will allow you to practice and receive feedback in a simulated interview environment.
        </p>
        <Button onClick={onStart}>
          Prepare for Interview
        </Button>
      </CardContent>
    </Card>
  );
};
