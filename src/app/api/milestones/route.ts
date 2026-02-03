import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const milestoneSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    targetDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
    category: z.string().optional(),
    status: z.enum(['active', 'completed', 'archived']).optional().default('active'),
});

// GET /api/milestones - List all user milestones
export async function GET(request: NextRequest) {
    try {
        const { userId } = requireAuth(request);

        const milestones = await prisma.milestone.findMany({
            where: { userId },
            include: {
                expenses: {
                    select: {
                        id: true,
                        amount: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Calculate total expenses per milestone
        const milestonesWithTotals = milestones.map((milestone: any) => ({
            ...milestone,
            totalExpenses: milestone.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0),
            expenseCount: milestone.expenses.length,
        }));

        return NextResponse.json({ milestones: milestonesWithTotals });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.error('Get milestones error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/milestones - Create new milestone
export async function POST(request: NextRequest) {
    try {
        const { userId } = requireAuth(request);
        const body = await request.json();
        const data = milestoneSchema.parse(body);

        const milestone = await prisma.milestone.create({
            data: {
                ...data,
                userId,
            },
        });

        return NextResponse.json({ milestone }, { status: 201 });
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

        console.error('Create milestone error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
