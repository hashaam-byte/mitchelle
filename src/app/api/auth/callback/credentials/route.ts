import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { UserRole } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, isSuperAdmin, superAdminKey } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Super Admin Login
    if (isSuperAdmin === 'true') {
      if (
        email === process.env.SUPER_ADMIN_EMAIL &&
        superAdminKey === process.env.SUPER_ADMIN_SECRET_KEY &&
        password === process.env.SUPER_ADMIN_PASSWORD
      ) {
        let superAdmin = await prisma.user.findUnique({
          where: { email: process.env.SUPER_ADMIN_EMAIL },
        });

        if (!superAdmin) {
          superAdmin = await prisma.user.create({
            data: {
              email: process.env.SUPER_ADMIN_EMAIL!,
              fullName: 'Super Admin',
              password: await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD!, 10),
              role: UserRole.SUPER_ADMIN,
            },
          });
        }

        return NextResponse.json({
          ok: true,
          user: {
            id: superAdmin.id,
            email: superAdmin.email,
            role: superAdmin.role,
          },
        });
      }

      return NextResponse.json(
        { error: 'Invalid super admin credentials' },
        { status: 401 }
      );
    }

    // Regular User Login
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No user found with this email' },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
