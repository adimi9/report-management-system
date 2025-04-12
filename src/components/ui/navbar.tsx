"use client"; 

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut } from 'lucide-react';
import { User as UserType } from '@/types';

const Navbar = () => {
  const { data: session } = useSession(); 
  const user = session?.user as UserType; 
  const router = useRouter(); 

  return (
    <nav className="border-b bg-background">
      <div className="h-16 container flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-lg">
          Report Management System
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            {session?.user?.role === "admin" && (
              <div className="hidden md:flex space-x-1">
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/users">Users</Link>
                </Button>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {session?.user?.role === "admin" && (
                  <DropdownMenuItem asChild className="md:hidden">
                    <Link href="/users">Users</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => {
                    signOut({ redirect: false }).then(() => {router.push('/login'); })}} 
                    className="text-red-600">
                    <div className="flex items-center gap-2 text-sm">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/register">Register</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
