import { useEffect, useState } from 'react';
import { Flame, Target, BookMarked, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { habitDb, todoDb, bookDb } from '@/lib/db';

export function QuickStats() {
    const [stats, setStats] = useState({
        longestStreak: 0,
        todayProgress: 0,
        booksInProgress: 0,
        totalCompleted: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];

            // Get all data
            const [habits, todos, books] = await Promise.all([
                habitDb.getAllHabits(),
                todoDb.getByDate(today),
                bookDb.getAll(),
            ]);

            // Get completions for all habits
            const allCompletions = await Promise.all(
                (habits || []).map(h => habitDb.getCompletions(h.id))
            ).then(results => results.flat());

            // Calculate longest current streak
            let maxStreak = 0;
            (habits || []).forEach(habit => {
                const habitCompletions = allCompletions
                    .filter(c => c.habit_id === habit.id)
                    .map(c => c.date)
                    .sort()
                    .reverse();

                let streak = 0;
                const todayDate = new Date(today);

                for (let i = 0; i < 365; i++) {
                    const checkDate = new Date(todayDate);
                    checkDate.setDate(checkDate.getDate() - i);
                    const dateStr = checkDate.toISOString().split('T')[0];

                    if (habitCompletions.includes(dateStr)) {
                        streak++;
                    } else if (i > 0) {
                        break;
                    }
                }

                if (streak > maxStreak) maxStreak = streak;
            });

            // Today's habits progress
            const completedHabitsToday = (habits || []).filter(h =>
                allCompletions.some(c => c.habit_id === h.id && c.date === today)
            ).length;
            const todayProgress = habits && habits.length > 0
                ? Math.round((completedHabitsToday / habits.length) * 100)
                : 0;

            // Books in progress
            const booksInProgress = (books || []).filter(b => b.status === 'reading').length;

            // Total todos completed today
            const totalCompleted = (todos || []).filter(t => t.completed).length;

            setStats({
                longestStreak: maxStreak,
                todayProgress,
                booksInProgress,
                totalCompleted,
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            label: 'Best Streak',
            value: stats.longestStreak,
            suffix: 'days',
            icon: Flame,
            color: 'text-primary',
            bg: 'bg-primary/10',
        },
        {
            label: 'Today',
            value: stats.todayProgress,
            suffix: '%',
            icon: Target,
            color: 'text-habit',
            bg: 'bg-habit/10',
        },
        {
            label: 'Reading',
            value: stats.booksInProgress,
            suffix: 'books',
            icon: BookMarked,
            color: 'text-reading',
            bg: 'bg-reading/10',
        },
        {
            label: 'Done Today',
            value: stats.totalCompleted,
            suffix: 'tasks',
            icon: CheckCircle2,
            color: 'text-success',
            bg: 'bg-success/10',
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-3 animate-fade-in stagger-1">
                {statCards.map((stat) => (
                    <Card key={stat.label} className="p-4 bg-card/50">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                    {stat.label}
                                </p>
                                <p className="text-2xl font-bold mt-1 text-muted-foreground">
                                    ...
                                </p>
                            </div>
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 animate-fade-in stagger-1">
            {statCards.map((stat) => (
                <Card key={stat.label} className="p-4 bg-card/50">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                {stat.label}
                            </p>
                            <p className="text-2xl font-bold mt-1">
                                {stat.value}
                                <span className="text-sm font-normal text-muted-foreground ml-1">
                                    {stat.suffix}
                                </span>
                            </p>
                        </div>
                        <div className={`p-2 rounded-lg ${stat.bg}`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}