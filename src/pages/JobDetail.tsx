import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Calendar, Building, Clock, Award, CheckCircle } from "lucide-react";
import { Job } from "@/pages/hr/JobManagement";

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isHR, isAdmin } = useAuth();
  const [isApplying, setIsApplying] = useState(false);

  const { data: job, isLoading, error } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Error loading job details");
        throw error;
      }

      return data as Job;
    },
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Open until filled";
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  const handleApply = () => {
    setIsApplying(true);
    // In a real application, this would navigate to an application form
    // or open an application dialog
    setTimeout(() => {
      toast.success("Your application has been submitted!");
      setIsApplying(false);
    }, 1500);
  };

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
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-8">The job listing you're looking for doesn't exist or has been removed.</p>
          <Link to="/jobs">
            <Button>View All Jobs</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Admin/HR Actions */}
          {(isHR() || isAdmin()) && (
            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-medium text-blue-800">HR Management</h3>
                  <p className="text-sm text-blue-600">
                    This job is currently {job.is_active ? "active" : "inactive"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/hr/jobs/edit/${job.id}`}>
                    <Button variant="outline" size="sm">
                      Edit Job
                    </Button>
                  </Link>
                  <Link to="/hr/jobs">
                    <Button variant="outline" size="sm">
                      Manage Jobs
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* Job Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="sm:flex sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <div className="mt-2 flex flex-wrap items-center text-sm text-gray-600 gap-y-2">
                  <div className="flex items-center mr-4">
                    <Building className="h-4 w-4 mr-1 text-gray-400" />
                    {job.company}
                  </div>
                  <div className="flex items-center mr-4">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    {job.location}
                  </div>
                  <div className="flex items-center mr-4">
                    <Briefcase className="h-4 w-4 mr-1 text-gray-400" />
                    {job.type}
                  </div>
                  {job.salary && (
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-1 text-gray-400" />
                      {job.salary}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <Button 
                  onClick={handleApply}
                  disabled={isApplying || !job.is_active}
                  className="w-full sm:w-auto"
                >
                  {isApplying ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      Applying...
                    </span>
                  ) : job.is_active ? (
                    "Apply Now"
                  ) : (
                    "Applications Closed"
                  )}
                </Button>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gray-400" />
                Posted: {formatDate(job.created_at)}
              </div>
              {job.deadline && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                  Apply by: {formatDate(job.deadline)}
                </div>
              )}
            </div>
          </div>
          
          {/* Job Details */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-line">
              {job.description}
            </div>
          </div>
          
          {/* Requirements */}
          {job.requirements && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                {job.requirements}
              </div>
            </div>
          )}
          
          {/* Benefits */}
          {job.benefits && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                {job.benefits}
              </div>
            </div>
          )}
          
          {/* Apply Footer */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Interested in this job?</h2>
                <p className="text-gray-600 mt-1">Submit your application now</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Button 
                  onClick={handleApply}
                  disabled={isApplying || !job.is_active}
                  className="w-full sm:w-auto"
                >
                  {isApplying ? "Applying..." : job.is_active ? "Apply Now" : "Applications Closed"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default JobDetail;
