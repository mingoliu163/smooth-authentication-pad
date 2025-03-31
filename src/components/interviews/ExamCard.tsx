
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { AIChat } from "./AIChat";

interface ExamCardProps {
  selectedExam: {
    id: string;
    title: string;
    difficulty: string;
    category: string;
    description: string | null;
  } | null;
}

export const ExamCard = ({ selectedExam }: ExamCardProps) => {
  if (!selectedExam) return null;

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
        <AIChat selectedExam={selectedExam} />
      </CardContent>
    </Card>
  );
};
