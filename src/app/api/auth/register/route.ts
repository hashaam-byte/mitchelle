// app/api/auth/register/route.ts - UPDATED WITH ADMIN CHECK
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  CLIENT = 'CLIENT',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, password, role } = body;

    console.log('[Register] Attempting to register:', { email, role });

    // Validation
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Password validation (min 8 chars, 1 number, 1 uppercase)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters with 1 uppercase and 1 number' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Only allow ADMIN creation if no admin exists
    if (role === UserRole.ADMIN) {
      const adminCount = await prisma.user.count({
        where: { role: UserRole.ADMIN },
      });

      if (adminCount > 0) {
        console.log('[Register] Admin already exists, blocking registration');
        return NextResponse.json(
          { error: 'Admin account already exists. Only one admin is allowed.' },
          { status: 403 }
        );
      }
      
      console.log('[Register] No admin exists, allowing admin creation');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        password: hashedPassword,
        role: role || UserRole.CLIENT,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    console.log('[Register] User created successfully:', { id: user.id, email: user.email, role: user.role });

    // Track analytics
    await prisma.analytics.create({
      data: {
        event: 'USER_REGISTERED',
        userId: user.id,
        metadata: {
          role: user.role,
          method: 'credentials',
        },
      },
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Register] Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}