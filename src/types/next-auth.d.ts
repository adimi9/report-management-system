import NextAuth from 'next-auth';
import { UserRole } from '@prisma/client'; 

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: UserRole; 
    };
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;  
  }

}
