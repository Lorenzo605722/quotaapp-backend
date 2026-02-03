import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const moodSchema = z.object({
    date: z.string().transform(val => new Date(val)),
    score: z.number().int().min(1).max(10),
    emotionalInsight: z.string().optional(),
});

// GET /api/mood - Get mood history
export async function GET(request: NextRequest) {
    try {
        const { userId } = requireAuth(request);
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const entries = await prisma.moodEntry.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                },
            },
            orderBy: {
                date: 'asc',
            },
        });

        // Calculate average mood
        const average = entries.length > 0
            ? entries.reduce((sum, entry) => sum + entry.score, 0) / entries.length
            : 0;

        return NextResponse.json({
            entries,
            average: Math.round(average * 10) / 10,
            count: entries.length,
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.error('Get mood error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/mood - Log mood score
export async function POST(request: NextRequest) {
    try {
        const { userId } = requireAuth(request);
        const body = await request.json();
        const data = moodSchema.parse(body);

        // Upsert mood for the day
        const entry = await prisma.moodEntry.upsert({
            where: {
                userId_date: {
                    userId,
                    date: data.date,
                },
            },
            update: {
                score: data.score,
                emotionalInsight: data.emotionalInsight,
            },
            create: {
                userId,
                date: data.date,
                score: data.score,
                emotionalInsight: data.emotionalInsight,
            },
        });

        return NextResponse.json({ entry }, { status: 201 });
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

        console.error('Create mood entry error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
