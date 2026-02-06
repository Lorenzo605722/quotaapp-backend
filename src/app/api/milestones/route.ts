import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const milestoneSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    targetAmount: z.number().optional().default(0),
    currentAmount: z.number().optional().default(0),
    startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
    targetDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
    category: z.string().optional(),
    status: z.enum(['active', 'completed', 'archived']).optional().default('active'),
    salarySnapshot: z.any().optional(),
    modelSnapshot: z.any().optional(),
    plan: z.any().optional(),
    celebrationsHalfShown: z.boolean().optional().default(false),
    celebrationsDoneShown: z.boolean().optional().default(false),
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
                contributions: {
                    select: {
                        amount: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Calculate total expenses and contributions per milestone
        const milestonesWithTotals = milestones.map((milestone: any) => {
            const totalExpenses = milestone.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
            const totalContributions = milestone.contributions.reduce((sum: number, c: any) => sum + c.amount, 0);
            return {
                ...milestone,
                totalExpenses,
                totalContributions,
                expenseCount: milestone.expenses.length,
                // currentAmount can be the sum of contributions + initial if desired, 
                // but let's stick to what's stored or calculated.
            };
        });

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
