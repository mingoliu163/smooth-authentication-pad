
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { signupSchema } from "../SignupForm";

type RoleFieldProps = {
  form: UseFormReturn<z.infer<typeof signupSchema>>;
  setSelectedRole: (role: string) => void;
};

const RoleField = ({ form, setSelectedRole }: RoleFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Role</FormLabel>
          <Select 
            onValueChange={(value) => {
              field.onChange(value);
              setSelectedRole(value);
            }} 
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="job_seeker">Job Seeker</SelectItem>
              <SelectItem value="hr">HR Professional</SelectItem>
              <SelectItem value="admin">System Administrator</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default RoleField;
