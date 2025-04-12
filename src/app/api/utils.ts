// File: src/app/utils/auth.ts
// Contains utility functions for hashing and comparing passwords using bcrypt.

import bcrypt from 'bcrypt';

// --- hashPassword Function (Hash a Password) ---
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// --- comparePasswords Function (Compare Passwords) ---
export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
