// File: src/app/reports/admin-reports.tsx
// Admin page to manage reports, allowing editing, deleting, and responding to reports.

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import {
  Report,
  ReportStatus,
  ReportType,
  PaginationState,
} from '@/types';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import ReportsTable from '@/components/reports/ReportsTable';
import ReportForm from '@/components/reports/ReportForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ResponseForm from '@/components/reports/ResponseForm';
import ReportFilters from '@/components/reports/ReportFilters';
import Pagination from '@/components/reports/Pagination';

const AdminReportsPage = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);

  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [responseType, setResponseType] = useState<ReportStatus | null>(null);
  const [reportToRespond, setReportToRespond] = useState<Report | null>(null);

  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ReportType | 'all'>('all');

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/report');
      const data = await res.json();
      setReports(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    let filtered = [...reports];
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === typeFilter);
    }
    setFilteredReports(filtered);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [reports, statusFilter, typeFilter]);

  const paginatedReports = filteredReports.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize
  );

  const handleEdit = (report: Report) => {
    setSelectedReport(report);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: Partial<Report>) => {
    if (!selectedReport) return;
    try {
      await fetch(`/api/report?id=${selectedReport.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      toast.success('Report updated successfully');
      fetchReports(); // 🔄 Refetch
    } catch (error) {
      console.error(error);
      toast.error('Failed to update report');
    } finally {
      setSelectedReport(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!reportToDelete) return;
    try {
      await fetch(`/api/report?id=${reportToDelete.id}`, { method: 'DELETE' });
      toast.success('Report deleted successfully');
      fetchReports(); // 🔄 Refetch
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete report');
    } finally {
      setReportToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleStatusChange = (report: Report, status: ReportStatus) => {
    if (['resolved', 'rejected'].includes(status)) {
      setReportToRespond(report);
      setResponseType(status);
      setIsResponseDialogOpen(true);
    }
  };

  const updateStatus = async ({
    reportId,
    status,
    resolvedBy,
    response,
  }: {
    reportId: string;
    status: ReportStatus;
    resolvedBy?: string;
    response?: string;
  }) => {
    const res = await fetch(`/api/report?id=${reportId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        resolvedBy,
        response,
      }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || 'Update failed');
    }

    return res.json();
  };

  const handleResponseSubmit = async (note: string) => {
    if (!reportToRespond || !responseType) return;

    try {
      await updateStatus({
        reportId: reportToRespond.id,
        status: responseType,
        resolvedBy: userId,
        response: note,
      });

      toast.success(
        `Report ${responseType === 'resolved' ? 'resolved' : 'rejected'}`
      );
      fetchReports(); // 🔄 Refetch
    } catch (err) {
      console.error(err);
      toast.error('Failed to update report status');
    } finally {
      setIsResponseDialogOpen(false);
      setReportToRespond(null);
      setResponseType(null);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Reports</h1>
      </div>

      <ReportFilters
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        onStatusFilterChange={setStatusFilter}
        onTypeFilterChange={setTypeFilter}
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </div>
      ) : (
        <>
          <ReportsTable
            reports={paginatedReports}
            isAdmin
            onEdit={handleEdit}
            onDelete={setReportToDelete}
            onStatusChange={handleStatusChange}
          />
          <Pagination
            pagination={pagination}
            totalItems={filteredReports.length}
            onPaginationChange={setPagination}
          />
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Report</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <ReportForm
              initialData={selectedReport}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        title="Delete Report"
        description="This action cannot be undone. Are you sure?"
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />

      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {responseType === 'resolved' ? 'Resolve Report' : 'Reject Report'}
            </DialogTitle>
          </DialogHeader>
          {reportToRespond && (
            <ResponseForm
              report={reportToRespond}
              label={responseType === 'resolved' ? 'Resolution Note' : 'Rejection Reason'}
              placeholder={`Provide a note for ${responseType}`}
              submitText={responseType === 'resolved' ? 'Resolve' : 'Reject'}
              submitVariant={responseType === 'resolved' ? 'default' : 'destructive'}
              onSubmit={handleResponseSubmit}
              onCancel={() => setIsResponseDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReportsPage;