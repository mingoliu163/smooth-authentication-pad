
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { AIChat } from "./AIChat";

interface Exam {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  description?: string | null;
}

interface ExamCardProps {
  selectedExam: Exam | null;
  exam?: Exam;
}

export const ExamCard = ({ selectedExam, exam }: ExamCardProps) => {
  // Use either exam or selectedExam, depending on which one is provided
  const examData = exam || selectedExam;
  
  if (!examData) return null;

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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{examData.title}</CardTitle>
            <CardDescription className="mt-1">
              AI-powered {examData.category} assessment ({examData.difficulty})
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(examData.difficulty)}`}>
              {examData.difficulty}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(examData.category)}`}>
              {examData.category}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-hidden flex flex-col">
        <AIChat 
          interviewId={examData.id} 
          candidateName="" 
          position="" 
          settings={{}} 
        />
      </CardContent>
    </Card>
  );
};
