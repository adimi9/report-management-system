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
import { Textarea } from '@/components/ui/textarea';
import { Report } from '@/types';

// --- ResponseForm Component ---
// This component renders a form to submit a response reason for a report.
// It includes form validation using Zod and React Hook Form.

const responseSchema = z.object({
  responseReason: z.string().min(1, { message: 'Rejection reason is required' }),
});

type ResponseFormValues = z.infer<typeof responseSchema>;

interface ResponseFormProps  {
  report: Report;
  onSubmit: (responseReason: string) => Promise<void>;
  onCancel: () => void;
  label?: string; // --- Optional label for the text area
  placeholder?: string; // --- Placeholder text for the text area
  submitText?: string; // --- Text for the submit button
  submitVariant?: 'default' | 'destructive' | 'outline'; // --- Button variant style
}

const ResponseForm = ({
  onSubmit,
  onCancel,
  label = 'Response Reason',
  placeholder = 'Please provide a response',
  submitText = 'Submit',
  submitVariant = 'default',
}: ResponseFormProps) => {
  const form = useForm<ResponseFormValues>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      responseReason: '',
    },
  });

  // --- Handle form submission ---
  const handleSubmit = async (data: ResponseFormValues) => {
    console.log("data", data); 
    await onSubmit(data.responseReason);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="responseReason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{label}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={placeholder}
                  rows={4}
                  {...field}
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
          <Button type="submit" variant={submitVariant}>
            {submitText}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ResponseForm;
