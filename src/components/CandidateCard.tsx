
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

export type CandidateType = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  position: string;
  status: "New" | "Screening" | "Interview" | "Final Round" | "Offer" | "Rejected";
  appliedDate: string;
  tags: string[];
};

interface CandidateCardProps {
  candidate: CandidateType;
}

const CandidateCard = ({ candidate }: CandidateCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800";
      case "Screening":
        return "bg-purple-100 text-purple-800";
      case "Interview":
        return "bg-amber-100 text-amber-800";
      case "Final Round":
        return "bg-indigo-100 text-indigo-800";
      case "Offer":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={candidate.avatar} alt={candidate.name} />
              <AvatarFallback className="bg-brand-100 text-brand-800">
                {getInitials(candidate.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 hover:text-brand-700">
                <Link to={`/candidates/${candidate.id}`}>{candidate.name}</Link>
              </CardTitle>
              <p className="text-sm text-gray-600">{candidate.position}</p>
            </div>
          </div>
          <Badge className={getStatusColor(candidate.status)}>
            {candidate.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-500 pb-3">Applied {candidate.appliedDate}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {candidate.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs bg-gray-50">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t">
        <div className="flex justify-between items-center w-full">
          <Link to={`/candidates/${candidate.id}`}>
            <Button variant="outline" className="text-brand-700 border-brand-200 hover:bg-brand-50">
              View Profile
            </Button>
          </Link>
          <Link to={`/candidates/${candidate.id}/interview`}>
            <Button className="bg-brand-700 hover:bg-brand-800 text-white">
              Schedule Interview
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CandidateCard;
