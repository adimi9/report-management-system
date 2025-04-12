import { user } from "@prisma/client";

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: Date;
}

export type ReportType = "review" | "user" | "business" | "service" | "other";
export type ReportStatus = "pending" | "resolved" | "rejected";
export type ReportReason = "spam" | "harassment" | "misleading" | "other";
export type BadgeVariant = "default" | "success" | "destructive" | "outline" | null | undefined;

export interface Report {
  id: string;
  type: ReportType;
  target_id: string;
  reason: ReportReason;
  response?: string;
  description?: string;
  status: ReportStatus;
  created_at: Date;
  submitted_by: string;
  resolver?: user;
  resolved_at?: Date;
  submitter?: user; 
  rejectionReason?: string;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface SortingState {
  id: string;
  desc: boolean;
}
