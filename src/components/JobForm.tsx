
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Job } from "@/pages/hr/JobManagement";

const jobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().min(1, "Location is required"),
  type: z.string().min(1, "Job type is required"),
  salary: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  deadline: z.string().optional(),
  is_active: z.boolean().default(true),
});

type JobFormValues = z.infer<typeof jobSchema>;

// Type for inserting into Supabase jobs table
type JobInsert = {
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  created_by: string;
  salary?: string;
  requirements?: string;
  benefits?: string;
  deadline?: string;
  is_active: boolean;
};

interface JobFormProps {
  job?: Job;
  onSuccess: () => void;
  userId?: string;
}

const JobForm = ({ job, onSuccess, userId }: JobFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!job;

  const defaultValues: Partial<JobFormValues> = job
    ? {
        ...job,
        deadline: job.deadline 
          ? new Date(job.deadline).toISOString().split('T')[0]
          : undefined,
      }
    : {
        title: "",
        company: "",
        location: "",
        type: "Full-time",
        salary: "",
        description: "",
        requirements: "",
        benefits: "",
        deadline: "",
        is_active: true,
      };

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues,
  });

  const createJobMutation = useMutation({
    mutationFn: async (values: JobFormValues) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Create a properly typed object for Supabase insert
      const jobData: JobInsert = {
        title: values.title,
        company: values.company,
        location: values.location,
        type: values.type,
        description: values.description,
        created_by: userId,
        is_active: values.is_active,
      };
      
      // Add optional fields only if they exist
      if (values.salary) jobData.salary = values.salary;
      if (values.requirements) jobData.requirements = values.requirements;
      if (values.benefits) jobData.benefits = values.benefits;
      if (values.deadline) jobData.deadline = values.deadline;

      const { data, error } = await supabase
        .from("jobs")
        .insert(jobData)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Job created successfully");
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Failed to create job: ${error.message}`);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async (values: JobFormValues) => {
      if (!job) {
        throw new Error("Job not found");
      }

      // Create a properly typed object for Supabase update
      const updateData: Partial<JobInsert> = {
        title: values.title,
        company: values.company,
        location: values.location,
        type: values.type,
        description: values.description,
        is_active: values.is_active,
      };
      
      // Add optional fields only if they exist
      if (values.salary) updateData.salary = values.salary;
      if (values.requirements) updateData.requirements = values.requirements;
      if (values.benefits) updateData.benefits = values.benefits;
      if (values.deadline) updateData.deadline = values.deadline;

      const { data, error } = await supabase
        .from("jobs")
        .update(updateData)
        .eq("id", job.id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Job updated successfully");
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Failed to update job: ${error.message}`);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (values: JobFormValues) => {
    setIsSubmitting(true);
    
    if (isEditMode) {
      updateJobMutation.mutate(values);
    } else {
      createJobMutation.mutate(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Frontend Developer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Tech Solutions Inc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. New York, NY" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Type *</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary Range</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. $80,000 - $100,000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Application Deadline</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the job role, responsibilities, and expectations..."
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requirements</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List the required skills, experience, education, etc..."
                  rows={4}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="benefits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Benefits</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the benefits package, perks, or other incentives..."
                  rows={4}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                {isEditMode ? "Updating..." : "Creating..."}
              </span>
            ) : (
              <span>{isEditMode ? "Update Job" : "Create Job"}</span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default JobForm;
