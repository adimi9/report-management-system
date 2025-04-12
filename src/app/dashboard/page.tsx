// File: src/app/dashboard/page.tsx
// Renders a dashboard page based on the user's session and role, displaying different components for admins and regular users.

'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import AdminReportsPage from '@/components/dashboard/admin-dashboard';
import UserReportsPage from '@/components/dashboard/user-dashboard';

const DashboardPage = () => {
  const { data: session, status } = useSession();

  // --- Loading State ---
  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  // --- Unauthorized Access ---
  if (!session || !session?.user) {
    return <p>You do not have permission to view this page.</p>;
  }

  // --- Role-based Component Rendering ---
  if (session?.user?.role === 'admin') {
    return <AdminReportsPage />;
  }

  return <UserReportsPage />;
};

export default DashboardPage;
