// File: src/app/api/user/create/route.ts
// Handles user creation by receiving the user data, hashing the password, and storing the user in the database.

import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { hashPassword } from '../utils';
import { UserRole } from '@prisma/client';

// --- CreateUserRequest Interface ---
interface CreateUserRequest {
  email: string;
  password: string;
  name?: string;  // Optional, as it can be nullable
}

// --- POST Handler ---
export async function POST(req: NextRequest) {
  try {
    // Type assertion to expected request body type
    const { email, password, name }: CreateUserRequest = await req.json() as CreateUserRequest;

    // --- Input Validation ---
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // --- Password Hashing ---
    const hashedPassword = await hashPassword(password);

    // --- Create User in Database ---
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: UserRole.user,  // Default role is 'user'
      },
    });

    // --- Remove Password from Response ---
    const { id, ...userWithoutPassword } = user;

    // --- Convert ID to String for Serialization ---
    const userWithoutPasswordStringified = {
      ...userWithoutPassword,
      id: typeof id === 'bigint' ? id.toString() : id,
    };

    // --- Return User Data in Response ---
    return NextResponse.json(userWithoutPasswordStringified, { status: 200 });

  } catch (e) {
    console.error('Error creating user:', e);
    return NextResponse.json({ error: 'Could not create user' }, { status: 500 });
  }
}
