import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/salaries/latest - Get the most recent salary record
export async function GET(request: NextRequest) {
    try {
        const { userId } = requireAuth(request);

        const latestSalary = await prisma.salary.findFirst({
            where: { userId },
            orderBy: {
                month: 'desc',
            },
        });

        return NextResponse.json({ salary: latestSalary });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.error('Get latest salary error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
