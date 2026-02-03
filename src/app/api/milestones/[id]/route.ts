import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const milestoneSchema = z.object({
    title: z.string().min(1, 'Title is required').optional(),
    description: z.string().optional(),
    targetDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
    category: z.string().optional(),
    status: z.enum(['active', 'completed', 'archived']).optional(),
});

// GET /api/milestones/[id] - Get specific milestone
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = requireAuth(request);
        const { id } = await params;

        const milestone = await prisma.milestone.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                expenses: {
                    orderBy: {
                        date: 'desc',
                    },
                },
            },
        });

        if (!milestone) {
            return NextResponse.json(
                { error: 'Milestone not found' },
                { status: 404 }
            );
        }

        const totalExpenses = milestone.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);

        return NextResponse.json({
            milestone: {
                ...milestone,
                totalExpenses,
            },
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.error('Get milestone error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/milestones/[id] - Update milestone
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = requireAuth(request);
        const { id } = await params;
        const body = await request.json();
        const data = milestoneSchema.parse(body);

        // Check ownership
        const existing = await prisma.milestone.findFirst({
            where: { id, userId },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Milestone not found' },
                { status: 404 }
            );
        }

        const milestone = await prisma.milestone.update({
            where: { id },
            data,
        });

        return NextResponse.json({ milestone });
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

        console.error('Update milestone error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/milestones/[id] - Delete milestone
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = requireAuth(request);
        const { id } = await params;

        // Check ownership
        const existing = await prisma.milestone.findFirst({
            where: { id, userId },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Milestone not found' },
                { status: 404 }
            );
        }

        await prisma.milestone.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Milestone deleted successfully' });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.error('Delete milestone error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
