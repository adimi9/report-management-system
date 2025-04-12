import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Edit, Trash2, Filter } from 'lucide-react';
import { User, SortingState } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface UsersTableProps {
  users: User[]; // --- List of users to display ---
  onEdit?: (user: User) => void; // --- Optional edit handler ---
  onDelete?: (user: User) => void; // --- Optional delete handler ---
}

// --- UsersTable Component ---
// Displays a table of users with options to filter, sort, edit, and delete.
const UsersTable = ({ users, onEdit, onDelete }: UsersTableProps) => {
  const [sorting, setSorting] = useState<SortingState | null>({
    id: 'createdAt', // --- Default sorting column: 'createdAt' ---
    desc: true, // --- Default sorting direction: descending ---
  });
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users); // --- Filtered users based on criteria ---
  const [roleFilter, setRoleFilter] = useState<string>("all"); // --- Filter by role (default: all) ---
  const [nameFilter, setNameFilter] = useState(""); // --- Filter by name or email ---

  useEffect(() => {
    let result = [...users];

    // --- Apply role filter ---
    if (roleFilter !== "all") {
      result = result.filter(user => user.role === roleFilter);
    }

    // --- Apply name filter ---
    if (nameFilter) {
      const searchTerm = nameFilter.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchTerm) || 
        user.email.toLowerCase().includes(searchTerm)
      );
    }

    // --- Apply sorting ---
    result = result.sort((a, b) => {
      if (!sorting) return 0;

      const column = sorting.id as keyof User;
      if (column === 'createdAt') {
        const dateA = a[column] ? new Date(a[column] as Date).getTime() : 0;
        const dateB = b[column] ? new Date(b[column] as Date).getTime() : 0;
        return sorting.desc ? dateB - dateA : dateA - dateB;
      }

      if (a[column] < b[column]) return sorting.desc ? 1 : -1;
      if (a[column] > b[column]) return sorting.desc ? -1 : 1;
      return 0;
    });

    setFilteredUsers(result); // --- Update filtered users state ---
  }, [users, roleFilter, nameFilter, sorting]); // --- Re-run effect when filters or sorting change ---

  const handleSort = (column: string) => {
    setSorting((prev) => {
      if (prev?.id === column) {
        return { id: column, desc: !prev.desc }; // --- Toggle sorting direction ---
      }
      return { id: column, desc: false }; // --- Set default sorting direction (ascending) ---
    });
  };

  return (
    <div className="space-y-4">
      {/* --- Filters Section --- */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-64">
          <Label htmlFor="role-filter">Filter by Role</Label>
          <Select 
            value={roleFilter} 
            onValueChange={setRoleFilter}
          >
            <SelectTrigger id="role-filter" className="w-full">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-64">
          <Label htmlFor="name-filter">Search</Label>
          <Input
            id="name-filter"
            placeholder="Search by name or email"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)} // --- Update name filter ---
          />
        </div>
      </div>

      {/* --- Table Section --- */}
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>Name</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('email')}>Email</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('role')}>Role</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')}>Created At</TableHead>
              {(onEdit || onDelete) && <TableHead className="text-right">Actions</TableHead>} {/* --- Conditionally render actions column --- */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'outline'} className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(user.created_at), 'MMM d, yyyy')}</TableCell>
                  {(onEdit || onDelete) && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(user)} className="flex items-center">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem onClick={() => onDelete(user)} className="text-red-600 flex items-center">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UsersTable;
