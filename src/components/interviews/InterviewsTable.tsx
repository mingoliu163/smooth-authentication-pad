
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Book,
  MoreHorizontal,
  Pencil,
  Trash2,
  Briefcase,
} from "lucide-react";
import { InterviewEditDialog } from "./InterviewEditDialog";
import { InterviewDeleteDialog } from "./InterviewDeleteDialog";
import { AssignExamsDialog } from "./AssignExamsDialog";
import { Link } from "react-router-dom";

// Define consistent interfaces
export interface Interview {
  id: string;
  date: string;
  candidate_id: string;
  candidate_name: string;
  interviewer_id: string | null;
  interviewer_name: string | null;
  position: string;
  status: string;
  user_id?: string | null;
  settings?: {
    interview_mode?: string;
    interview_type?: string;
    environment?: string;
    lighting?: string;
    experience_level?: string;
    ai_technical_test?: boolean;
    personality_test?: boolean;
    notes?: string;
  };
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  user_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

export interface Interviewer {
  id: string;
  name: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

export interface Exam {
  id: string;
  title: string;
  difficulty: string;
  category: string;
}

interface InterviewsTableProps {
  interviews: Interview[];
  candidates: Candidate[];
  interviewers: Interviewer[];
  exams: Exam[];
  onRefresh: () => void;
}

export const InterviewsTable = ({
  interviews,
  candidates,
  interviewers,
  exams,
  onRefresh,
}: InterviewsTableProps) => {
  const [editInterview, setEditInterview] = useState<Interview | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignExamsDialogOpen, setIsAssignExamsDialogOpen] = useState(false);
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleOpenAssignExamsDialog = (interviewId: string) => {
    setSelectedInterviewId(interviewId);
    setIsAssignExamsDialogOpen(true);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Interviewer</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interviews.map((interview) => (
              <TableRow key={interview.id}>
                <TableCell className="font-medium">
                  {interview.position}
                </TableCell>
                <TableCell>{interview.candidate_name}</TableCell>
                <TableCell>
                  {interview.interviewer_name || "Not assigned"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-gray-500" />
                    {formatDate(interview.date)}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      interview.status === "Scheduled"
                        ? "bg-blue-100 text-blue-800"
                        : interview.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {interview.status}
                  </span>
                </TableCell>
                <TableCell>
                  {interview.settings?.interview_type ? (
                    <span className="capitalize">{interview.settings.interview_type}</span>
                  ) : (
                    "Standard"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link to={`/interviews/${interview.id}`}>
                        <Briefcase className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only md:ml-2">
                          View
                        </span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAssignExamsDialog(interview.id)}
                    >
                      <Book className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only md:ml-2">
                        Exams
                      </span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditInterview(interview);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedInterviewId(interview.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <InterviewEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        interview={editInterview}
        candidates={candidates}
        interviewers={interviewers}
        onSuccess={onRefresh}
      />

      <InterviewDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        interviewId={selectedInterviewId}
        onSuccess={onRefresh}
      />

      <AssignExamsDialog
        open={isAssignExamsDialogOpen}
        onOpenChange={setIsAssignExamsDialogOpen}
        interviewId={selectedInterviewId}
        availableExams={exams}
        onSuccess={onRefresh}
      />
    </>
  );
};
