import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/dashboard/stats - Get aggregated dashboard statistics
export async function GET(request: NextRequest) {
    try {
        const { userId } = requireAuth(request);

        // Get all data in parallel
        const [milestones, expenses, moodEntries, salaryInfo] = await Promise.all([
            prisma.milestone.findMany({
                where: { userId },
                include: {
                    expenses: {
                        select: { amount: true },
                    },
                },
            }),
            prisma.expense.findMany({
                where: { userId },
                select: { amount: true, category: true, date: true },
            }),
            prisma.moodEntry.findMany({
                where: {
                    userId,
                    date: {
                        gte: new Date(new Date().setDate(new Date().getDate() - 30)),
                    },
                },
                select: { score: true, date: true },
                orderBy: { date: 'asc' },
            }),
            prisma.salaryInfo.findUnique({
                where: { userId },
            }),
        ]);

        // Calculate statistics
        const activeMilestones = milestones.filter(m => m.status === 'active').length;
        const completedMilestones = milestones.filter(m => m.status === 'completed').length;

        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        // Expenses by category
        const expensesByCategory = expenses.reduce((acc, exp) => {
            const category = exp.category || 'Other';
            acc[category] = (acc[category] || 0) + exp.amount;
            return acc;
        }, {} as Record<string, number>);

        // Current month expenses
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthExpenses = expenses
            .filter(exp => exp.date >= startOfMonth)
            .reduce((sum, exp) => sum + exp.amount, 0);

        // Mood average
        const moodAverage = moodEntries.length > 0
            ? moodEntries.reduce((sum, entry) => sum + entry.score, 0) / moodEntries.length
            : 0;

        // Mood trend (last 7 days)
        const last7Days = moodEntries.slice(-7);

        return NextResponse.json({
            milestones: {
                active: activeMilestones,
                completed: completedMilestones,
                total: milestones.length,
            },
            expenses: {
                total: totalExpenses,
                currentMonth: currentMonthExpenses,
                byCategory: expensesByCategory,
            },
            mood: {
                average: Math.round(moodAverage * 10) / 10,
                last7Days: last7Days.map(m => ({
                    date: m.date,
                    score: m.score,
                })),
            },
            salary: salaryInfo
                ? {
                    monthly: salaryInfo.monthlyAmount,
                    remaining: salaryInfo.monthlyAmount - currentMonthExpenses,
                }
                : null,
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.error('Get dashboard stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
