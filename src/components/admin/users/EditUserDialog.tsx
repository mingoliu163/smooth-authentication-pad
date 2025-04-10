
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
import { EnhancedProfile } from "./UserTable";

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: EnhancedProfile | null;
  onSave: () => void;
  setEditingUser: React.Dispatch<React.SetStateAction<EnhancedProfile | null>>;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  setEditingUser,
}) => {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">First Name</label>
              <Input 
                value={user.first_name || ''} 
                onChange={e => setEditingUser({...user, first_name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Last Name</label>
              <Input 
                value={user.last_name || ''} 
                onChange={e => setEditingUser({...user, last_name: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input value={user.email} disabled />
          </div>
          <div>
            <label className="text-sm font-medium">Display Name</label>
            <Input value={user.display_name} disabled />
          </div>
          <div>
            <label className="text-sm font-medium">Role</label>
            <Select 
              value={user.role} 
              onValueChange={value => setEditingUser({...user, role: value as UserRole})}
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
              checked={user.approved} 
              onCheckedChange={checked => setEditingUser({...user, approved: checked})}
            />
            <label>Approved</label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
