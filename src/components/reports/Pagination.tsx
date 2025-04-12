import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { PaginationState } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// --- Pagination Component ---
// This component handles pagination, displaying the current page, 
// total number of items, and options for changing the page size and 
// navigating between pages.
interface PaginationProps {
  pagination: PaginationState;
  totalItems: number;
  onPaginationChange: (pagination: PaginationState) => void;
}

const Pagination = ({
  pagination,
  totalItems,
  onPaginationChange,
}: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / pagination.pageSize); // --- Total number of pages ---
  const canGoPrevious = pagination.pageIndex > 0; // --- Can the user navigate to previous page? ---
  const canGoNext = pagination.pageIndex < totalPages - 1; // --- Can the user navigate to next page? ---

  const handlePageSizeChange = (value: string) => {
    // --- Handle page size change ---
    onPaginationChange({ ...pagination, pageSize: parseInt(value), pageIndex: 0 });
  };

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-2">
        {/* --- Showing pagination info --- */}
        <p className="text-sm text-muted-foreground">
          Showing{' '}
          <span className="font-medium">
            {pagination.pageIndex * pagination.pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-medium">
            {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalItems)}
          </span>{' '}
          of{' '}
          <span className="font-medium">{totalItems}</span> items
        </p>

        {/* --- Rows per page select --- */}
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">Rows per page</p>
          <Select
            value={pagination.pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pagination.pageSize.toString()} />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* --- Navigate to first page --- */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPaginationChange({ ...pagination, pageIndex: 0 })}
          disabled={!canGoPrevious}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* --- Navigate to previous page --- */}
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            onPaginationChange({
              ...pagination,
              pageIndex: Math.max(0, pagination.pageIndex - 1),
            })
          }
          disabled={!canGoPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* --- Current page and total pages display --- */}
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">Page</span>
          <span className="text-sm font-medium">{pagination.pageIndex + 1}</span>
          <span className="text-sm text-muted-foreground">of {totalPages || 1}</span>
        </div>

        {/* --- Navigate to next page --- */}
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            onPaginationChange({
              ...pagination,
              pageIndex: Math.min(totalPages - 1, pagination.pageIndex + 1),
            })
          }
          disabled={!canGoNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* --- Navigate to last page --- */}
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            onPaginationChange({ ...pagination, pageIndex: totalPages - 1 })
          }
          disabled={!canGoNext}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
