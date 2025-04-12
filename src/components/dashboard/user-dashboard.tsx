// UserReportsPage component - Allows the user to view, filter, and submit reports.

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Report, ReportStatus, ReportType } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import ReportsTable from '@/components/reports/ReportsTable';
import ReportForm from '@/components/reports/ReportForm';
import ReportFilters from '@/components/reports/ReportFilters';

const UserReportsPage = () => {
  const { data: session } = useSession();
  const user = session?.user;

  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ReportType | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // --- Load Reports ---
  useEffect(() => {
    const loadReports = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/report`);
        if (!response.ok) {
          throw new Error('Failed to load reports');
        }
        const userReports = await response.json();
        setReports(userReports);
      } catch (error) {
        console.error('Error loading reports:', error);
        toast.error('Failed to load reports');
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, [user]);

  // --- Handle Create Report ---
  const handleCreateReport = async (reportData: Partial<Report>) => {
    if (!user) return;

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...reportData,
          submitted_by: user.id.toString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      const newReport = await response.json();
      setReports([newReport, ...reports]);
      setIsDialogOpen(false);
      toast.success('Report submitted successfully');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report');
    }
  };

  // --- Filter and Sort Reports ---
  const filteredReports = reports.filter((report) => {
    if (statusFilter !== 'all' && report.status !== statusFilter) return false;
    if (typeFilter !== 'all' && report.type !== typeFilter) return false;
    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  return (
    <div className="container py-8">
      {/* --- Header and Submit Button --- */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Reports</h1>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Submit New Report
        </Button>
      </div>

      {/* --- Filters --- */}
      <div className="mb-6">
        <ReportFilters
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          onStatusFilterChange={setStatusFilter}
          onTypeFilterChange={setTypeFilter}
          onSortOrderChange={setSortOrder}
          sortOrder={sortOrder}
        />
      </div>

      {/* --- Report Table or Loading State --- */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground">No reports found. Submit a new report to get started.</p>
        </div>
      ) : (
        <ReportsTable
          reports={filteredReports}
          isAdmin={false}
        />
      )}

      {/* --- Submit New Report Dialog --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Submit New Report</DialogTitle>
          </DialogHeader>
          <ReportForm
            onSubmit={handleCreateReport}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserReportsPage;
