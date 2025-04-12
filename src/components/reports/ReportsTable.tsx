"use client";

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Report, ReportStatus, SortingState } from '@/types';
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

// ReportsTable component - Displays a table of reports with sorting, status, and actions.

interface ReportsTableProps {
  reports: Report[];
  isAdmin?: boolean;
  onEdit?: (report: Report) => void;
  onDelete?: (report: Report) => void;
  onStatusChange?: (report: Report, status: ReportStatus) => void;
}

// --- Get Badge Variant ---
const getStatusBadgeVariant = (status: ReportStatus) => {
  switch (status) {
    case 'resolved':
      return 'success';
    case 'rejected':
      return 'destructive';
    default:
      return 'outline';
  }
};

// --- Reports Table Component ---
const ReportsTable = ({
  reports,
  isAdmin = true,
  onEdit,
  onDelete,
  onStatusChange,
}: ReportsTableProps) => {
  const [sorting, setSorting] = useState<SortingState | null>({
    id: 'createdAt',
    desc: true,
  });

  // --- Handle Sorting ---
  const handleSort = (column: string) => {
    setSorting((prev) => {
      if (prev?.id === column) {
        return { id: column, desc: !prev.desc };
      }
      return { id: column, desc: false };
    });
  };

  // --- Sort Reports ---
  const sortedReports = [...reports].sort((a, b) => {
    if (!sorting || !sorting.id || !a || !b) return 0;

    const column = sorting.id as keyof Report;
    if (column === 'createdAt' || column === 'resolvedAt') {
      const dateA = a[column] ? new Date(a[column] as Date).getTime() : 0;
      const dateB = b[column] ? new Date(b[column] as Date).getTime() : 0;
      return sorting.desc ? dateB - dateA : dateA - dateB;
    }

    if (a[column] && b[column] && column) {
      if (a[column] < b[column]) return sorting.desc ? 1 : -1;
      if (a[column] > b[column]) return sorting.desc ? -1 : 1;
    }
    return 0;
  });

  // --- Render Sort Icon ---
  const renderSortIcon = (column: string) => {
    if (sorting?.id !== column) return null;
    return sorting.desc ? <ChevronDown className="ml-1 h-4 w-4" /> : <ChevronUp className="ml-1 h-4 w-4" />;
  };

  // --- Format Date ---
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM d, yyyy');
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {/* --- Table Header --- */}
            <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
              <div className="flex items-center">Type {renderSortIcon('type')}</div>
            </TableHead>
            <TableHead>Target ID</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('reason')}>
              <div className="flex items-center">Reason {renderSortIcon('reason')}</div>
            </TableHead>
            <TableHead>Description (Optional)</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')}>
              <div className="flex items-center">Created At</div>
            </TableHead>
            {isAdmin && (
              <>
                <TableHead>Submitted By</TableHead>
                <TableHead>Resolved By</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('resolvedAt')}>
                  <div className="flex items-center">Resolved Date</div>
                </TableHead>
              </>
            )}
            <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
              <div className="flex items-center">Status {renderSortIcon('status')}</div>
            </TableHead>
            <TableHead>
              <div className="flex items-center">Response</div>
            </TableHead>
            {(isAdmin || onEdit || onDelete || onStatusChange) && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedReports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isAdmin ? 8 : 6} className="text-center py-8">
                No reports found
              </TableCell>
            </TableRow>
          ) : (
            sortedReports.map((report) => {
              return (
                <TableRow key={report.id}>
                  {/* --- Table Data --- */}
                  <TableCell className="font-medium capitalize">{report.type}</TableCell>
                  <TableCell>{report.target_id}</TableCell>
                  <TableCell className="capitalize">{report.reason}</TableCell>
                  <TableCell>{report.description || 'N/A'}</TableCell>
                  <TableCell>{formatDate(report.created_at)}</TableCell>
                  {isAdmin && (
                    <>
                      <TableCell>{report.submitter?.name || 'N/A'}</TableCell>
                      <TableCell>{report.resolver?.name || 'N/A'}</TableCell>
                      <TableCell>{formatDate(report.resolved_at)}</TableCell>
                    </>
                  )}
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(report.status) as any}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.response || 'N/A'}</TableCell>
                  {(isAdmin || onEdit || onDelete || onStatusChange) && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isAdmin && onStatusChange && (
                            <>
                              {report.status !== 'resolved' && (
                                <DropdownMenuItem
                                  onClick={() => onStatusChange(report, 'resolved')}
                                  className="text-green-600 flex items-center"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Resolve
                                </DropdownMenuItem>
                              )}
                              {report.status !== 'rejected' && (
                                <DropdownMenuItem
                                  onClick={() => onStatusChange(report, 'rejected')}
                                  className="text-red-600 flex items-center"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReportsTable;
