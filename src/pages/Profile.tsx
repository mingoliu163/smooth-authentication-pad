
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, FileUp, File, X } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  bio: z.string().optional(),
  avatar_url: z.string().optional(),
  resume_url: z.string().optional()
});

const Profile = () => {
  const { user, profile, updateProfile, uploadAvatar, uploadResume, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isResumeUploading, setIsResumeUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      bio: profile?.bio || "",
      avatar_url: profile?.avatar_url || "",
      resume_url: profile?.resume_url || ""
    }
  });

  // Update form and avatar URL when profile changes
  useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
        resume_url: profile.resume_url || ""
      });
      setAvatarUrl(profile.avatar_url);
      setResumeUrl(profile.resume_url);
      
      // Extract filename from resume URL if it exists
      if (profile.resume_url) {
        const urlParts = profile.resume_url.split('/');
        const fullFileName = urlParts[urlParts.length - 1];
        // Remove timestamp from filename
        const cleanFileName = fullFileName.split('_').slice(1).join('_');
        setResumeFileName(cleanFileName);
      }
    }
  }, [profile, form.reset]);

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    setIsLoading(true);
    await updateProfile(values);
    setIsLoading(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const fileSize = file.size / 1024 / 1024; // in MB
    
    // File validation
    if (fileSize > 5) {
      toast.error("File size should not exceed 5MB");
      return;
    }
    
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    
    setIsUploading(true);
    try {
      const url = await uploadAvatar(file);
      if (url) {
        setAvatarUrl(url);
        form.setValue("avatar_url", url);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setIsResumeUploading(true);
    
    try {
      const url = await uploadResume(file);
      if (url) {
        setResumeUrl(url);
        setResumeFileName(file.name);
        form.setValue("resume_url", url);
      }
    } finally {
      setIsResumeUploading(false);
    }
  };

  const removeResume = async () => {
    setResumeUrl(null);
    setResumeFileName(null);
    form.setValue("resume_url", "");
    await updateProfile({ resume_url: null });
    toast.success("Resume removed successfully");
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Alert>
          <AlertDescription>
            You need to be logged in to view this page.
            <Button onClick={() => navigate("/login")} className="ml-2">
              Sign In
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <Button variant="outline" onClick={signOut}>Sign Out</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={avatarUrl || ""} />
                  <AvatarFallback className="text-3xl">
                    {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <p className="font-medium text-lg">{profile?.first_name} {profile?.last_name}</p>
                <p className="text-muted-foreground text-sm">{user.email}</p>
              </div>
              
              <div className="w-full">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex items-center justify-center w-full p-2 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors">
                    <Upload className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Upload New Photo</span>
                  </div>
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
                <p className="text-xs text-center mt-2 text-gray-500">
                  JPG, PNG or GIF. Max 5MB.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Resume Upload Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Resume</CardTitle>
              <CardDescription>Upload your resume for job applications</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              {resumeUrl && resumeFileName ? (
                <div className="w-full">
                  <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                    <div className="flex items-center space-x-2">
                      <File className="h-6 w-6 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium truncate max-w-[150px]">{resumeFileName}</p>
                        <a 
                          href={resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View resume
                        </a>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={removeResume}
                      title="Remove resume"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors">
                      <FileUp className="h-8 w-8 mb-2 text-gray-400" />
                      <span className="text-sm font-medium">Upload Resume</span>
                      {isResumeUploading ? (
                        <Loader2 className="h-5 w-5 mt-2 animate-spin" />
                      ) : (
                        <p className="text-xs text-center mt-2 text-gray-500">
                          PDF, DOC or DOCX. Max 5MB.
                        </p>
                      )}
                    </div>
                    <input 
                      id="resume-upload" 
                      type="file" 
                      accept=".pdf,.doc,.docx" 
                      className="hidden"
                      onChange={handleResumeUpload}
                      disabled={isResumeUploading}
                    />
                  </label>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="First Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Last Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about yourself" 
                            className="min-h-[100px]" 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
