// File: src/app/api/users/route.ts
// Handles retrieving, updating, and deleting users, with admin-only access.

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route'; // Import authentication options
import prisma from '../../../lib/prisma';
import { user } from '@prisma/client';

// --- GET Handler (Fetch Users) ---
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await prisma.user.findMany();

    const safeUsers = users.map((user) => {
      const { id, ...rest } = user;

      return {
        ...rest,
        id: id.toString(),
      };
    });

    return NextResponse.json(safeUsers, { status: 200 });

  } catch (e) {
    console.error('Error fetching users:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --- PUT Handler (Update User) ---
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, email, name, role } = await req.json() as user;

    const updatedUser = await prisma.user.update({
      where: { id: BigInt(id) },
      data: { email, name, role },
    });

    const safeUser = {
      ...updatedUser,
      id: id.toString(),
    };

    return NextResponse.json(safeUser, { status: 200 });

  } catch (e) {
    console.error('Error updating user:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --- DELETE Handler (Delete User) ---
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await req.json() as { id: string | number };

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const deletedUser = await prisma.user.delete({
      where: { id: BigInt(id) },
    });

    const safeUser = {
      ...deletedUser,
      id: id.toString(),
    };

    return NextResponse.json(safeUser, { status: 200 });

  } catch (e) {
    console.error('Error deleting user:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
