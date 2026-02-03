import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const updateExpenseSchema = z.object({
    amount: z.number().positive('Amount must be positive').optional(),
    description: z.string().optional(),
    date: z.string().transform(val => new Date(val)).optional(),
    category: z.string().optional(),
    milestoneId: z.string().nullable().optional(),
});

// GET /api/expenses/[id] - Get specific expense
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = requireAuth(request);
        const { id } = params;

        const expense = await prisma.expense.findFirst({
            where: {
                id,
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

        if (!expense) {
            return NextResponse.json(
                { error: 'Expense not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ expense });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.error('Get expense error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/expenses/[id] - Update expense
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = requireAuth(request);
        const { id } = params;
        const body = await request.json();
        const data = updateExpenseSchema.parse(body);

        // Check ownership
        const existing = await prisma.expense.findFirst({
            where: { id, userId },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Expense not found' },
                { status: 404 }
            );
        }

        // Verify milestone ownership if changing
        if (data.milestoneId !== undefined && data.milestoneId !== null) {
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

        const expense = await prisma.expense.update({
            where: { id },
            data,
            include: {
                milestone: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        return NextResponse.json({ expense });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Update expense error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/expenses/[id] - Delete expense
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = requireAuth(request);
        const { id } = params;

        // Check ownership
        const existing = await prisma.expense.findFirst({
            where: { id, userId },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Expense not found' },
                { status: 404 }
            );
        }

        await prisma.expense.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.error('Delete expense error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
