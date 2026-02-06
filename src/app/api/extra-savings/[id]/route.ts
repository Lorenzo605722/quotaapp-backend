import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// DELETE /api/extra-savings/[id] - Delete extra saving record
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = requireAuth(request);
        const { id } = await params;

        // Verify ownership
        const extraSaving = await (prisma as any).extraSaving.findFirst({
            where: {
                id,
                userId,
            },
        });

        if (!extraSaving) {
            return NextResponse.json(
                { error: 'Extra saving record not found' },
                { status: 404 }
            );
        }

        await (prisma as any).extraSaving.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Extra saving deleted' });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.error('Delete extra saving error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
