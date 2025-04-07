
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import RoleInfo from "./RoleInfo";
import NameFields from "./FormFields/NameFields";
import EmailField from "./FormFields/EmailField";
import PasswordField from "./FormFields/PasswordField";
import RoleField from "./FormFields/RoleField";

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["admin", "hr", "job_seeker"]).default("job_seeker")
});

const SignupForm = () => {
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("job_seeker");

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "job_seeker"
    }
  });

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    
    // Create a display name by combining first and last name
    const displayName = `${values.firstName} ${values.lastName}`.trim();
    
    await signUp(
      values.email, 
      values.password, 
      values.firstName, 
      values.lastName, 
      values.role as 'admin' | 'hr' | 'job_seeker',
      displayName
    );
    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <NameFields form={form} />
        <EmailField form={form} />
        <PasswordField form={form} />
        <RoleField form={form} setSelectedRole={setSelectedRole} />
        
        <RoleInfo role={selectedRole} />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </Form>
  );
};

export default SignupForm;
