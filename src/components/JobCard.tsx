
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Briefcase, MapPin, Clock } from "lucide-react";

export type JobType = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Remote";
  salary?: string;
  posted: string;
  description: string;
};

interface JobCardProps {
  job: JobType;
}

const JobCard = ({ job }: JobCardProps) => {
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900 hover:text-brand-700">
              <Link to={`/jobs/${job.id}`}>{job.title}</Link>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">{job.company}</p>
          </div>
          <Badge className={`
            ${job.type === "Full-time" ? "bg-green-100 text-green-800" : ""}
            ${job.type === "Part-time" ? "bg-blue-100 text-blue-800" : ""}
            ${job.type === "Contract" ? "bg-purple-100 text-purple-800" : ""}
            ${job.type === "Remote" ? "bg-indigo-100 text-indigo-800" : ""}
          `}>
            {job.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
            {job.location}
          </div>
          {job.salary && (
            <div className="flex items-center text-sm text-gray-500">
              <Briefcase className="h-4 w-4 mr-1 text-gray-400" />
              {job.salary}
            </div>
          )}
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1 text-gray-400" />
            Posted {job.posted}
          </div>
          <p className="mt-3 text-sm text-gray-600 line-clamp-3">{job.description}</p>
        </div>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <div className="flex justify-between items-center w-full">
          <Link to={`/jobs/${job.id}`}>
            <Button variant="outline" className="text-brand-700 border-brand-200 hover:bg-brand-50">
              View Details
            </Button>
          </Link>
          <Link to={`/apply/${job.id}`}>
            <Button className="bg-brand-700 hover:bg-brand-800 text-white">
              Apply Now
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default JobCard;
