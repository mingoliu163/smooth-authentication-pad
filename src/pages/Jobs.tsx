import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobCard from "@/components/JobCard";
import JobListSidebar from "@/components/JobListSidebar";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export type JobType = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  posted: string;
};

const Jobs = () => {
  const { isHR, isAdmin } = useAuth();
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["public-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load jobs: " + error.message);
        throw error;
      }
      
      // Transform the data to match JobCard component props
      return data.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type as "Full-time" | "Part-time" | "Contract" | "Remote",
        salary: job.salary,
        posted: formatTimeAgo(job.created_at),
        description: job.description
      }));
    },
  });

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
    
    return new Date(dateString).toLocaleDateString();
  };

  const handleFilter = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
    // In a real app, this would filter the jobs based on the criteria
  };

  // Pagination logic
  const totalPages = jobs ? Math.ceil(jobs.length / itemsPerPage) : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = jobs ? jobs.slice(startIndex, endIndex) : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Openings</h1>
              <p className="mt-1 text-gray-600">Find your perfect role from our open positions</p>
            </div>
            {(isHR() || isAdmin()) && (
              <Button 
                className="mt-4 md:mt-0 bg-brand-700 hover:bg-brand-800 text-white"
                onClick={() => window.location.href = "/hr/jobs"}
              >
                Manage Jobs
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <JobListSidebar onFilter={handleFilter} />
            </div>
            
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : currentJobs && currentJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No job listings found</h3>
                  <p className="text-gray-600">Please check back later for new opportunities.</p>
                </div>
              )}
              
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <Button 
                        key={index}
                        variant={currentPage === index + 1 ? "default" : "outline"} 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </Pagination>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Jobs;
