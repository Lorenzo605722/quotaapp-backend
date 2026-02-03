import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const expenseSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    description: z.string().optional(),
    date: z.string().transform(val => new Date(val)),
    category: z.string().optional(),
    milestoneId: z.string().optional(),
});

// GET /api/expenses - List all user expenses
export async function GET(request: NextRequest) {
    try {
        const { userId } = requireAuth(request);
        const { searchParams } = new URL(request.url);
        const milestoneId = searchParams.get('milestoneId');
        const category = searchParams.get('category');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const where: any = { userId };

        if (milestoneId) {
            where.milestoneId = milestoneId;
        }

        if (category) {
            where.category = category;
        }

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const expenses = await prisma.expense.findMany({
            where,
            include: {
                milestone: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
        });

        const total = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);

        return NextResponse.json({
            expenses,
            total,
            count: expenses.length,
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.error('Get expenses error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/expenses - Create new expense
export async function POST(request: NextRequest) {
    try {
        const { userId } = requireAuth(request);
        const body = await request.json();
        const data = expenseSchema.parse(body);

        // Verify milestone ownership if provided
        if (data.milestoneId) {
            const milestone = await prisma.milestone.findFirst({
                where: {
                    id: data.milestoneId,
                    userId,
                },
            });

            if (!milestone) {
                return NextResponse.json(
                    { error: 'Milestone not found' },
                    { status: 404 }
                );
            }
        }

        const expense = await prisma.expense.create({
            data: {
                ...data,
                userId,
            },
            include: {
                milestone: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        return NextResponse.json({ expense }, { status: 201 });
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

        console.error('Create expense error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
