
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UserRole } from "@/types/auth";

interface AddUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
  newUser: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    approved: boolean;
    display_name: string;
  };
  setNewUser: React.Dispatch<React.SetStateAction<{
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    approved: boolean;
    display_name: string;
  }>>;
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({
  isOpen,
  onClose,
  onAdd,
  newUser,
  setNewUser,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">First Name</label>
              <Input 
                name="first_name"
                value={newUser.first_name} 
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Last Name</label>
              <Input 
                name="last_name"
                value={newUser.last_name} 
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input 
              name="email"
              type="email"
              value={newUser.email} 
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input 
              name="password"
              type="password" 
              value={newUser.password} 
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Role</label>
            <Select 
              value={newUser.role} 
              onValueChange={value => setNewUser({...newUser, role: value as UserRole})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="hr">HR Professional</SelectItem>
                <SelectItem value="job_seeker">Job Seeker</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              checked={newUser.approved} 
              onCheckedChange={checked => setNewUser({...newUser, approved: checked})}
            />
            <label>Approved</label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onAdd}>Create User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
