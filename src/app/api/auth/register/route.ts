import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { signToken, generateVerificationToken } from '@/lib/jwt';
import { sendVerificationEmail } from '@/lib/email';

const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    birthDate: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, firstName, lastName, birthDate } = registerSchema.parse(body);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
            );
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
                birthDate,
            },
        });

        // Generate auth token
        const token = signToken({ userId: user.id, email: user.email });

        // Generate verification token (24h)
        const verificationToken = generateVerificationToken(user.id);

        // Send verification email
        const emailResult = await sendVerificationEmail(user.email, verificationToken);
        console.log('Verification email result:', emailResult);

        return NextResponse.json(
            {
                message: 'User registered successfully. Please check your email for verification link.',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    emailVerified: user.emailVerified,
                },
            },
            {
                status: 201,
                headers: { 'Access-Control-Allow-Origin': '*' }
            }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
            );
        }

        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            {
                status: 500,
                headers: { 'Access-Control-Allow-Origin': '*' }
            }
        );
    }
}
