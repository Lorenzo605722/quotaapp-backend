import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { signToken, generateVerificationToken } from '@/lib/jwt';

const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, name } = registerSchema.parse(body);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            );
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
                emailVerified: false,
            },
        });

        // Generate verification token
        const verificationToken = generateVerificationToken(user.id);

        // TODO: Send verification email
        // For now, we'll just return the token in response (dev only)

        // Generate auth token
        const token = signToken({ userId: user.id, email: user.email });

        return NextResponse.json(
            {
                message: 'User registered successfully',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    emailVerified: user.emailVerified,
                },
                // Development only - remove in production
                verificationToken,
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
