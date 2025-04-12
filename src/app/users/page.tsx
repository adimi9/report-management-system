// File: src/app/users/page.tsx
// Displays a user page with different views based on the user's role (admin or not).

'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import AdminUsersPage from '@/components/users/UsersPage';

const UsersPage = () => {
  const { data: session, status } = useSession();

  // --- Session Loading Check ---
  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  // --- Admin Role Check ---
  if (session?.user?.role === 'admin') {
    return <AdminUsersPage />;
  }

  return <p>You do not have permission to view this page.</p>;
};

export default UsersPage;
