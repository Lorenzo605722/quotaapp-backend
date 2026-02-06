import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const contributionSchema = z.object({
    monthKey: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid monthKey format (YYYY-MM)'),
    amount: z.number(),
});

// GET /api/milestones/[id]/contributions - Get all contributions for a milestone
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = requireAuth(request);
        const { id: milestoneId } = await params;

        // Verify ownership
        const milestone = await prisma.milestone.findFirst({
            where: { id: milestoneId, userId },
        });

        if (!milestone) {
            return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
        }

        const contributions = await (prisma as any).milestoneContribution.findMany({
            where: { milestoneId },
            orderBy: { monthKey: 'desc' },
        });

        return NextResponse.json({ contributions });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Get contributions error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/milestones/[id]/contributions - Upsert a contribution
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = requireAuth(request);
        const { id: milestoneId } = await params;
        const body = await request.json();
        const { monthKey, amount } = contributionSchema.parse(body);

        // Verify ownership
        const milestone = await prisma.milestone.findFirst({
            where: { id: milestoneId, userId },
        });

        if (!milestone) {
            return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
        }

        const contribution = await (prisma as any).milestoneContribution.upsert({
            where: {
                milestoneId_monthKey: {
                    milestoneId,
                    monthKey,
                },
            },
            update: { amount },
            create: {
                milestoneId,
                userId,
                monthKey,
                amount,
            },
        });

        // ✅ Sync Milestone currentAmount
        const allContribs = await (prisma as any).milestoneContribution.findMany({
            where: { milestoneId },
        });
        const newTotal = allContribs.reduce((sum: number, c: any) => sum + (c.amount || 0), 0);

        await (prisma as any).milestone.update({
            where: { id: milestoneId },
            data: { currentAmount: newTotal },
        });

        return NextResponse.json({ contribution });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
        }
        console.error('Contribution upsert error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
