
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useJobSeekerDashboard } from "@/hooks/useJobSeekerDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Calendar, FileCheck } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { InterviewsTab } from "@/components/dashboard/InterviewsTab";
import { ApplicationsTab } from "@/components/dashboard/ApplicationsTab";
import { RecommendationsTab } from "@/components/dashboard/RecommendationsTab";

const JobSeekerDashboard = () => {
  const { user, signOut } = useAuth();
  const { jobs, applications, interviews, isLoading } = useJobSeekerDashboard();
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <DashboardHeader userEmail={user?.email} onSignOut={signOut} />
      
      <Tabs defaultValue="interviews" className="space-y-6">
        <TabsList>
          <TabsTrigger value="interviews" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Interviews
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center">
            <FileCheck className="mr-2 h-4 w-4" />
            Applications
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center">
            <Briefcase className="mr-2 h-4 w-4" />
            Recommended Jobs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="interviews" className="space-y-4">
          <InterviewsTab 
            interviews={interviews} 
            isLoading={isLoading} 
            formatDate={formatDate} 
          />
        </TabsContent>
        
        <TabsContent value="applications" className="space-y-4">
          <ApplicationsTab 
            applications={applications} 
            isLoading={isLoading} 
          />
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-4">
          <RecommendationsTab 
            jobs={jobs} 
            isLoading={isLoading} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobSeekerDashboard;
