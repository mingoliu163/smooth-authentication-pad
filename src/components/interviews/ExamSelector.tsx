
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface ExamSelectorProps {
  exams: Exam[];
  selectedExam: Exam | null;
  onSelectExam: (exam: Exam) => void;
}

interface Exam {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  description: string | null;
}

export const ExamSelector = ({ 
  exams, 
  selectedExam, 
  onSelectExam 
}: ExamSelectorProps) => {
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
    <div className="space-y-2">
      {exams.map((exam) => (
        <Button 
          key={exam.id}
          variant={selectedExam?.id === exam.id ? "default" : "outline"}
          className="w-full justify-start text-left h-auto py-3"
          onClick={() => onSelectExam(exam)}
        >
          <div className="flex items-start">
            <BookOpen className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{exam.title}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(exam.difficulty)}`}>
                  {exam.difficulty}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(exam.category)}`}>
                  {exam.category}
                </span>
              </div>
            </div>
          </div>
        </Button>
      ))}
    </div>
  );
};
