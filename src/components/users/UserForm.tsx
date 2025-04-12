import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User } from '@/types';
import { UserRole } from '@prisma/client';

// --- UserForm Component ---
// This component is used for adding or updating a user's information, including name, email, and role.
const userSchema = z.object({
  id: z.string().optional(), // --- Optional ID for the user, used for updates ---
  name: z.string().min(1, { message: 'Name is required' }), // --- User's name (required) ---
  email: z.string().email({ message: 'Invalid email address' }), // --- User's email (required) ---
  role: z.enum(['user', 'admin']), // --- User's role (either 'user' or 'admin') ---
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  onSubmit: (data: Partial<User>) => Promise<void>; // --- Submit handler for the form ---
  initialData?: Partial<User>; // --- Initial data for updating an existing user ---
  onCancel: () => void; // --- Cancel handler for the form ---
}

const UserForm = ({ onSubmit, initialData, onCancel }: UserFormProps) => {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      id: initialData?.id, // --- Initialize form with the provided ID ---
      name: initialData?.name || '', // --- Initialize form with the provided name ---
      email: initialData?.email || '', // --- Initialize form with the provided email ---
      role: (initialData?.role as UserRole) || 'user', // --- Initialize form with the provided role ---
    },
  });

  const handleSubmit = async (data: UserFormValues) => {
    // --- Attach ID manually from initialData (in case form state doesn't track it) ---
    const finalData: Partial<User> = {
      ...data,
      id: initialData?.id, // optional — depends on your backend needs
    };
    await onSubmit(finalData); // --- Submit the final data ---
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* --- Name field --- */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter user name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- Email field --- */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter email address" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- Role field --- */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- Buttons (Cancel and Submit) --- */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit">{initialData ? 'Update User' : 'Add User'}</Button>
        </div>
      </form>
    </Form>
  );
};

export default UserForm;
