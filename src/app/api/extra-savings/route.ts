import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const extraSavingSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    note: z.string().optional(),
});

// GET /api/extra-savings - List all extra savings for user
export async function GET(request: NextRequest) {
    try {
        const { userId } = requireAuth(request);

        const extraSavings = await (prisma as any).extraSaving.findMany({
            where: { userId },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({
            extraSavings,
            count: extraSavings.length,
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.error('Get extra savings error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/extra-savings - Create new extra saving
export async function POST(request: NextRequest) {
    try {
        const { userId } = requireAuth(request);
        const body = await request.json();
        const data = extraSavingSchema.parse(body);

        const extraSaving = await (prisma as any).extraSaving.create({
            data: {
                ...data,
                userId,
            },
        });

        return NextResponse.json({ extraSaving }, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Create extra saving error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
