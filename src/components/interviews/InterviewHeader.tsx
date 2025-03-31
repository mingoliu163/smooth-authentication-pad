
import { CalendarIcon, Clock } from "lucide-react";

interface InterviewHeaderProps {
  interview: {
    position: string;
    date: string;
    status: string;
  };
}

export const InterviewHeader = ({ interview }: InterviewHeaderProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">{interview.position} Interview</h1>
      <div className="flex items-center text-gray-600 gap-4 mb-4">
        <div className="flex items-center">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDate(interview.date)}
        </div>
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4" />
          {new Date(interview.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          interview.status === "Scheduled" ? "bg-blue-100 text-blue-800" : 
          interview.status === "Completed" ? "bg-green-100 text-green-800" : 
          "bg-gray-100 text-gray-800"
        }`}>
          {interview.status}
        </div>
      </div>
    </div>
  );
};
