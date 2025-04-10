
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ApplicationForm from "@/components/ApplicationForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  company: string;
  is_active: boolean;
}

const Apply = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: job, isLoading, error } = useQuery({
    queryKey: ["job-apply", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, company, is_active")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Error loading job details");
        throw error;
      }

      return data as Job;
    },
  });

  // Redirect if job is not active
  useEffect(() => {
    if (job && !job.is_active) {
      toast.error("This job is no longer accepting applications");
      navigate(`/jobs/${id}`);
    }
  }, [job, id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
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
