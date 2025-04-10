
import React from "react";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { UserRole } from "@/types/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type EnhancedProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  email: string;
  approved: boolean;
  display_name: string;
};

interface UserTableProps {
  users: EnhancedProfile[];
  loading: boolean;
  onEdit: (user: EnhancedProfile) => void;
  onDelete: (user: EnhancedProfile) => void;
}

const UserTable: React.FC<UserTableProps> = ({ 
  users, 
  loading, 
  onEdit, 
  onDelete 
}) => {
  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.display_name}</TableCell>
            <TableCell>
              <Badge 
                variant="outline" 
                className={`
                  ${user.role === 'admin' ? 'bg-red-100 text-red-800' : ''} 
                  ${user.role === 'hr' ? 'bg-blue-100 text-blue-800' : ''} 
                  ${user.role === 'job_seeker' ? 'bg-green-100 text-green-800' : ''}
                `}
              >
                {user.role === 'admin' ? 'Administrator' : 
                 user.role === 'hr' ? 'HR Professional' : 
                 'Job Seeker'}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={user.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {user.approved ? 'Approved' : 'Pending'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(user)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => onDelete(user)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserTable;
