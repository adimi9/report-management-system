import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ReportStatus, ReportType } from '@/types';
import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- ReportFilters Component ---
// This component renders filters for reports. It includes filtering by status, type,
// and sorting by date (ascending or descending).
interface ReportFiltersProps {
  statusFilter: ReportStatus | 'all';
  typeFilter: ReportType | 'all';
  onStatusFilterChange: (status: ReportStatus | 'all') => void;
  onTypeFilterChange: (type: ReportType | 'all') => void;
  sortOrder?: 'asc' | 'desc';
  onSortOrderChange?: (order: 'asc' | 'desc') => void;
}

const ReportFilters = ({
  statusFilter,
  typeFilter,
  onStatusFilterChange,
  onTypeFilterChange,
  sortOrder = 'desc',
  onSortOrderChange,
}: ReportFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* --- Filter by Status --- */}
      <div className="w-full md:w-60">
        <Label htmlFor="status-filter">Filter by Status</Label>
        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusFilterChange(value as ReportStatus | 'all')}
        >
          <SelectTrigger id="status-filter" className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* --- Filter by Type --- */}
      <div className="w-full md:w-60">
        <Label htmlFor="type-filter">Filter by Type</Label>
        <Select
          value={typeFilter}
          onValueChange={(value) => onTypeFilterChange(value as ReportType | 'all')}
        >
          <SelectTrigger id="type-filter" className="w-full">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="service">Service</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    
    </div>
  );
};

export default ReportFilters;
