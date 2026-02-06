import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const salaryInfoSchema = z.object({
    monthlyAmount: z.number().positive(),
});

export async function POST(request: NextRequest) {
    try {
        const { userId } = requireAuth(request);
        const body = await request.json();
        const { monthlyAmount } = salaryInfoSchema.parse(body);

        const salaryInfo = await prisma.salaryInfo.upsert({
            where: { userId },
            update: { monthlyAmount },
            create: { userId, monthlyAmount },
        });

        return NextResponse.json({ salaryInfo });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
        }
        console.error('Update salary info error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
