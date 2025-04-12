"use client"; 

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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Report } from '@/types';
import { useSession } from 'next-auth/react';

// --- ReportForm Component ---
// This component renders a form for submitting a report with different report types, reasons, 
// and an optional description. It also utilizes React Hook Form and Zod for validation.
const reportSchema = z.object({
  type: z.enum(['review', 'user', 'business', 'service', 'other']),
  target_id: z
    .string()
    .min(1, { message: 'Target ID is required' })
    .refine(val => /^\d+$/.test(val), {
      message: 'Target ID must be a number',
    }),
  reason: z.enum(['spam', 'harassment', 'misleading', 'other']),
  description: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

interface ReportFormProps {
  onSubmit: (data: Partial<Report>) => Promise<void>;
  initialData?: Partial<Report>;
  onCancel: () => void;
}

const ReportForm = ({ onSubmit, initialData, onCancel }: ReportFormProps) => {
  const { data: session, status } = useSession();
  const user = session?.user; 
  
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      type: (initialData?.type as any) || 'review',
      target_id: initialData?.target_id || '',
      reason: (initialData?.reason as any) || 'spam',
      description: initialData?.description || '',
    },
  });

  // --- Handle form submission ---
  const handleSubmit = async (data: ReportFormValues) => {
    if (!user) return;
    
    await onSubmit({
      ...data,
      submitted_by: user.id,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Report Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a report type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="target_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter target ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="misleading">Misleading</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide additional details"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit">Submit Report</Button>
        </div>
      </form>
    </Form>
  );
};

export default ReportForm;
