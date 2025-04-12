"use client";

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import UsersTable from '@/components/users/UsersTable';
import UserForm from '@/components/users/UserForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

// --- AdminUsersPage Component ---
// This component is responsible for managing users: displaying, adding, updating, and deleting users.
const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]); // --- Users state ---
  const [isLoading, setIsLoading] = useState(true); // --- Loading state ---
  const [isDialogOpen, setIsDialogOpen] = useState(false); // --- Dialog open state ---
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // --- Selected user for editing ---
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // --- Delete confirmation dialog state ---
  const [userToDelete, setUserToDelete] = useState<User | null>(null); // --- User to delete ---

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true); // --- Set loading state to true ---
        const res = await fetch('/api/users');
        if (!res.ok) throw new Error();
        const data = await res.json();
        setUsers(data); // --- Update users state with fetched data ---
      } catch (error) {
        console.error('Error loading users:', error);
        toast.error('Failed to load users'); // --- Show error toast ---
      } finally {
        setIsLoading(false); // --- Set loading state to false ---
      }
    };

    loadUsers();
  }, []); // --- Load users once on component mount ---

  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!res.ok) throw new Error();
      const newUser = await res.json();
      setUsers([...users, newUser]); // --- Add new user to state ---
      setIsDialogOpen(false); // --- Close dialog ---
      toast.success('User created successfully'); // --- Show success toast ---
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user'); // --- Show error toast ---
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user); // --- Set selected user for editing ---
    setIsDialogOpen(true); // --- Open dialog for editing ---
  };

  const handleUpdateUser = async (userData: Partial<User>) => {
    if (!selectedUser) return;

    try {
      console.log("sending..."); // --- Debug log ---
      console.log(userData); // --- Debug log ---
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...userData, id: selectedUser.id }),
      });

      if (!res.ok) throw new Error();
      const updatedUser = await res.json();
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u)); // --- Update user in state ---
      setIsDialogOpen(false); // --- Close dialog ---
      setSelectedUser(null); // --- Clear selected user ---
      toast.success('User updated successfully'); // --- Show success toast ---
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user'); // --- Show error toast ---
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user); // --- Set user to delete ---
    setIsDeleteDialogOpen(true); // --- Open delete confirmation dialog ---
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userToDelete.id }),
      });

      if (!res.ok) throw new Error();
      await res.json();
      setUsers(users.filter(u => u.id !== userToDelete.id)); // --- Remove deleted user from state ---
      setIsDeleteDialogOpen(false); // --- Close delete confirmation dialog ---
      setUserToDelete(null); // --- Clear user to delete ---
      toast.success('User deleted successfully'); // --- Show success toast ---
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user'); // --- Show error toast ---
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false); // --- Close the dialog ---
    setSelectedUser(null); // --- Clear selected user ---
  };

  return (
    <div className="container py-8">
      {/* --- Page Header --- */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Manage Users</h1>
      </div>

      {/* --- Loading state --- */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading users...</p>
        </div>
      ) : (
        <UsersTable
          users={users} // --- Pass users to the table component ---
          onEdit={handleEditUser} // --- Pass edit handler ---
          onDelete={handleDeleteClick} // --- Pass delete handler ---
        />
      )}

      {/* --- User Form Dialog --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? 'Edit User' : 'Create New User'}
            </DialogTitle>
          </DialogHeader>
          <UserForm
            onSubmit={selectedUser ? handleUpdateUser : handleCreateUser} // --- Handle form submission ---
            initialData={selectedUser || undefined} // --- Pass initial data for editing ---
            onCancel={handleCloseDialog} // --- Handle cancel action ---
          />
        </DialogContent>
      </Dialog>

      {/* --- Delete Confirmation Dialog --- */}
      <ConfirmDialog
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)} // --- Close delete dialog ---
        onConfirm={handleDeleteUser} // --- Confirm delete action ---
        confirmText="Delete"
        variant="destructive" // --- Destructive confirmation variant ---
      />
    </div>
  );
};

export default AdminUsersPage;
