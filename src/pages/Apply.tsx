
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ApplicationForm from "@/components/ApplicationForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

// Sample job data - in a real app, you would fetch this based on the ID
const jobsData = {
  "1": {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
  },
  "2": {
    id: "2",
    title: "Product Manager",
    company: "Innovation Labs",
  },
  "3": {
    id: "3",
    title: "UX/UI Designer",
    company: "Creative Solutions",
  },
  "4": {
    id: "4",
    title: "DevOps Engineer",
    company: "CloudSystems",
  },
  "5": {
    id: "5",
    title: "Marketing Specialist",
    company: "GrowthBrand",
  },
  "6": {
    id: "6",
    title: "Backend Developer",
    company: "DataSystems Inc.",
  },
};

const Apply = () => {
  const { id } = useParams<{ id: string }>();
  const job = id && id in jobsData ? jobsData[id as keyof typeof jobsData] : null;

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Job Not Found</h1>
            <p className="mt-2 text-gray-600">We couldn't find the job you're looking for.</p>
            <Link to="/jobs">
              <Button className="mt-4 bg-brand-700 hover:bg-brand-800 text-white">
                Back to Jobs
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow bg-gray-50 py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link to={`/jobs/${id}`} className="inline-flex items-center text-brand-700 hover:text-brand-800">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Job Details
            </Link>
          </div>
          
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Apply to {job.title}</h1>
            <p className="mt-2 text-gray-600">at {job.company}</p>
          </div>
          
          <ApplicationForm jobId={job.id} jobTitle={job.title} />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Apply;
