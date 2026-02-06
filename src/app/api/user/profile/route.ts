import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const profileSchema = z.object({
    name: z.string().optional(),
    firstName: z.string().optional(), // In case frontend sends these
    lastName: z.string().optional(),
    birthDate: z.string().optional(),
});

export async function PUT(request: NextRequest) {
    try {
        const user = requireAuth(request);
        const body = await request.json();
        const data = profileSchema.parse(body);

        // Map firstName/lastName to name if provided
        let finalName = data.name;
        if (!finalName && (data.firstName || data.lastName)) {
            finalName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.userId },
            data: {
                firstName: data.firstName || undefined,
                lastName: data.lastName || undefined,
                birthDate: data.birthDate || undefined,
            },
        });

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                name: `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim() || updatedUser.email,
                emailVerified: updatedUser.emailVerified,
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }

        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
