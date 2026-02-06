import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const salarySchema = z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
    amount: z.number().positive('Amount must be positive'),
    modelId: z.string().default('50-30-20'),
});

// GET /api/salaries - List all user salaries
export async function GET(request: NextRequest) {
    try {
        const { userId } = requireAuth(request);

        const salaries = await prisma.salary.findMany({
            where: { userId },
            orderBy: {
                month: 'desc',
            },
        });

        return NextResponse.json({
            salaries,
            count: salaries.length,
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.error('Get salaries error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/salaries - Create or update salary for a specific month
export async function POST(request: NextRequest) {
    try {
        const { userId } = requireAuth(request);
        const body = await request.json();
        const data = salarySchema.parse(body);

        const salary = await prisma.salary.upsert({
            where: {
                userId_month: {
                    userId,
                    month: data.month,
                },
            },
            update: {
                amount: data.amount,
                modelId: data.modelId,
            },
            create: {
                ...data,
                userId,
            },
        });

        return NextResponse.json({ salary }, { status: 201 });
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

        console.error('Create salary error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
