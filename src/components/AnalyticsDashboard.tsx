import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Flame, Heart, BookOpen, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { habitDb, moodDb, journalDb, bookDb, todoDb } from '@/lib/db';

export function AnalyticsDashboard() {
    const [stats, setStats] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            setLoading(true);

            // Get data from last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const startDate = thirtyDaysAgo.toISOString().split('T')[0];
            const today = new Date().toISOString().split('T')[0];

            // Habits
            const habits = await habitDb.getAllHabits();
            const allCompletions = await Promise.all(
                habits.map(h => habitDb.getCompletions(h.id, startDate, today))
            ).then(results => results.flat());

            // Calculate habit streaks
            const habitStats = habits.map(habit => {
                const completions = allCompletions
                    .filter(c => c.habit_id === habit.id)
                    .map(c => c.date)
                    .sort()
                    .reverse();

                let streak = 0;
                const todayDate = new Date(today);

                for (let i = 0; i < 30; i++) {
                    const checkDate = new Date(todayDate);
                    checkDate.setDate(checkDate.getDate() - i);
                    const dateStr = checkDate.toISOString().split('T')[0];

                    if (completions.includes(dateStr)) {
                        streak++;
                    } else if (i > 0) {
                        break;
                    }
                }

                const completionRate = completions.length / 30;

                return {
                    name: habit.name,
                    streak,
                    completions: completions.length,
                    rate: Math.round(completionRate * 100),
                };
            });

            // Moods
            const moods = await moodDb.getAll();
            const recentMoods = moods.filter(m => m.date >= startDate);
            const moodCounts = recentMoods.reduce((acc, m) => {
                acc[m.mood] = (acc[m.mood] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            // Journals
            const journals = await journalDb.getAll();
            const recentJournals = journals.filter(j => j.date >= startDate);
            const journalsByType = recentJournals.reduce((acc, j) => {
                const typeTag = j.tags?.find((t: string) => t.startsWith('type:'));
                if (typeTag) {
                    const type = typeTag.split(':')[1];
                    acc[type] = (acc[type] || 0) + 1;
                }
                return acc;
            }, {} as Record<string, number>);

            // Books
            const books = await bookDb.getAll();
            const readingBooks = books.filter(b => b.status === 'reading').length;
            const completedBooks = books.filter(b => b.status === 'completed').length;

            // Todos
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                return date.toISOString().split('T')[0];
            });

            const todoStats = await Promise.all(
                last7Days.map(async date => {
                    const todos = await todoDb.getByDate(date);
                    const completed = todos.filter(t => t.completed).length;
                    return {
                        date,
                        total: todos.length,
                        completed,
                        rate: todos.length > 0 ? Math.round((completed / todos.length) * 100) : 0,
                    };
                })
            );

            setStats({
                habits: habitStats,
                moods: moodCounts,
                journals: journalsByType,
                books: { reading: readingBooks, completed: completedBooks, total: books.length },
                todos: todoStats,
                totalHabitCompletions: allCompletions.length,
                journalStreak: calculateJournalStreak(journals, today),
            });
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateJournalStreak = (journals: any[], today: string) => {
        const dates = [...new Set(journals.map(j => j.date))].sort().reverse();
        let streak = 0;
        const todayDate = new Date(today);

        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(todayDate);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];

            if (dates.includes(dateStr)) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }

        return streak;
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    Loading analytics...
                </CardContent>
            </Card>
        );
    }

    const bestHabit = stats.habits?.sort((a: any, b: any) => b.rate - a.rate)[0];
    const mostFrequentMood = Object.entries(stats.moods || {}).sort(([, a]: any, [, b]: any) => b - a)[0];

    return (
        <div className="space-y-4">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Flame className="h-4 w-4 text-primary" />
                            <span className="text-xs text-muted-foreground">Journal Streak</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.journalStreak || 0}</p>
                        <p className="text-xs text-muted-foreground">days</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-success/10 to-success/5">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-success" />
                            <span className="text-xs text-muted-foreground">Habit Wins</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.totalHabitCompletions || 0}</p>
                        <p className="text-xs text-muted-foreground">last 30 days</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-love/10 to-love/5">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Heart className="h-4 w-4 text-love" />
                            <span className="text-xs text-muted-foreground">Top Mood</span>
                        </div>
                        <p className="text-lg font-bold capitalize">
                            {mostFrequentMood?.[0] || 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {mostFrequentMood?.[1] || 0} times
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-reading/10 to-reading/5">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="h-4 w-4 text-reading" />
                            <span className="text-xs text-muted-foreground">Books</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.books?.completed || 0}</p>
                        <p className="text-xs text-muted-foreground">
                            {stats.books?.reading || 0} reading
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Analytics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Detailed Analytics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="habits">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="habits">Habits</TabsTrigger>
                            <TabsTrigger value="moods">Moods</TabsTrigger>
                            <TabsTrigger value="todos">Tasks</TabsTrigger>
                        </TabsList>

                        <TabsContent value="habits" className="space-y-3 mt-4">
                            {stats.habits?.length === 0 ? (
                                <p className="text-center text-muted-foreground py-4">
                                    No habit data yet
                                </p>
                            ) : (
                                stats.habits?.map((habit: any) => (
                                    <div
                                        key={habit.name}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
                                    >
                                        <div>
                                            <p className="font-medium">{habit.name}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-muted-foreground">
                                                    {habit.streak} day streak
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {habit.completions} completions
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-primary">
                                                {habit.rate}%
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                completion rate
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            {bestHabit && (
                                <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/20">
                                    <p className="text-sm font-semibold text-success">
                                        🏆 Best Habit: {bestHabit.name} ({bestHabit.rate}% completion)
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="moods" className="space-y-3 mt-4">
                            {Object.entries(stats.moods || {}).length === 0 ? (
                                <p className="text-center text-muted-foreground py-4">
                                    No mood data yet
                                </p>
                            ) : (
                                Object.entries(stats.moods || {})
                                    .sort(([, a]: any, [, b]: any) => b - a)
                                    .map(([mood, count]: any) => (
                                        <div
                                            key={mood}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
                                        >
                                            <p className="font-medium capitalize">{mood}</p>
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{
                                                            width: `${(count / Object.values(stats.moods || {}).reduce((a: any, b: any) => a + b, 0)) * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="font-semibold w-8 text-right">
                                                    {count}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </TabsContent>

                        <TabsContent value="todos" className="space-y-3 mt-4">
                            {stats.todos?.length === 0 ? (
                                <p className="text-center text-muted-foreground py-4">
                                    No task data yet
                                </p>
                            ) : (
                                stats.todos?.map((day: any) => (
                                    <div
                                        key={day.date}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {new Date(day.date).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {day.completed}/{day.total} tasks completed
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-2xl font-bold ${day.rate === 100 ? 'text-success' : 'text-primary'}`}>
                                                {day.rate}%
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}