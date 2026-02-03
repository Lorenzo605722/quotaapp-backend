import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const calendarSchema = z.object({
    date: z.string().transform(val => new Date(val)),
    notes: z.string().optional(),
});

// GET /api/calendar - Get calendar entries for a month
export async function GET(request: NextRequest) {
    try {
        const { userId } = requireAuth(request);
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month'); // Format: YYYY-MM

        if (!month) {
            return NextResponse.json(
                { error: 'Month parameter is required (format: YYYY-MM)' },
                { status: 400 }
            );
        }

        const [year, monthNum] = month.split('-').map(Number);
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0, 23, 59, 59);

        const entries = await prisma.calendarEntry.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: {
                date: 'asc',
            },
        });

        return NextResponse.json({ entries });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.error('Get calendar error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/calendar - Create or update calendar entry
export async function POST(request: NextRequest) {
    try {
        const { userId } = requireAuth(request);
        const body = await request.json();
        const data = calendarSchema.parse(body);

        // Upsert (create or update if exists)
        const entry = await prisma.calendarEntry.upsert({
            where: {
                date: data.date,
            },
            update: {
                notes: data.notes,
            },
            create: {
                userId,
                date: data.date,
                notes: data.notes,
            },
        });

        return NextResponse.json({ entry }, { status: 201 });
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

        console.error('Create calendar entry error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
