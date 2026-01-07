import { useState, useEffect } from 'react';
import { Check, X, Plus, Trash2, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { habitDb } from '@/lib/db';

export function HabitTracker() {
    const [habits, setHabits] = useState<any[]>([]);
    const [completions, setCompletions] = useState<any[]>([]);
    const [newHabitName, setNewHabitName] = useState('');
    const [newHabitFrequency, setNewHabitFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [newHabitTarget, setNewHabitTarget] = useState('1');
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const habitsData = await habitDb.getAllHabits();
            setHabits(habitsData || []);

            // Get completions for all habits for the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const startDate = thirtyDaysAgo.toISOString().split('T')[0];

            const completionsData = await Promise.all(
                (habitsData || []).map((h: any) => habitDb.getCompletions(h.id, startDate, today))
            ).then(results => results.flat());

            setCompletions(completionsData || []);
        } catch (error) {
            console.error('Error loading habits:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddHabit = async () => {
        if (newHabitName.trim()) {
            try {
                const habit = await habitDb.createHabit({
                    name: newHabitName.trim(),
                    frequency: newHabitFrequency,
                    target_count: parseInt(newHabitTarget) || 1,
                });
                setHabits([...habits, habit]);
                setNewHabitName('');
                setNewHabitFrequency('daily');
                setNewHabitTarget('1');
                setIsAdding(false);
            } catch (error) {
                console.error('Error adding habit:', error);
            }
        }
    };

    const handleRemoveHabit = async (id: string) => {
        try {
            await habitDb.archiveHabit(id);
            setHabits(habits.filter(h => h.id !== id));
        } catch (error) {
            console.error('Error removing habit:', error);
        }
    };

    const handleToggle = async (habitId: string) => {
        try {
            await habitDb.toggleCompletion(habitId, today);
            // Reload completions
            const updatedCompletions = await habitDb.getCompletions(habitId);
            setCompletions(prev => [
                ...prev.filter(c => c.habit_id !== habitId),
                ...updatedCompletions
            ]);
        } catch (error) {
            console.error('Error toggling habit:', error);
        }
    };

    const getHabitStatus = (habitId: string, date: string): 'completed' | 'missed' | 'pending' | 'locked' => {
        const completion = completions.find(c => c.habit_id === habitId && c.date === date);
        const dateObj = new Date(date);
        const todayObj = new Date(today);

        if (date === today) {
            return completion ? 'completed' : 'pending';
        }

        if (dateObj < todayObj) {
            return completion ? 'completed' : 'missed';
        }

        return 'locked';
    };

    const getStreak = (habitId: string): number => {
        const habitCompletions = completions
            .filter(c => c.habit_id === habitId)
            .map(c => c.date)
            .sort()
            .reverse();

        if (habitCompletions.length === 0) return 0;

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

        return streak;
    };

    const getCompletionRate = (habitId: string): number => {
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return 0;

        const createdDate = new Date(habit.created_at).toISOString().split('T')[0];
        const todayDate = new Date(today);
        const startDate = new Date(createdDate);

        const daysSinceCreation = Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const completedDays = completions.filter(c => c.habit_id === habitId).length;

        return Math.round((completedDays / Math.max(daysSinceCreation, 1)) * 100);
    };

    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    };

    const formatDayLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
    };

    const completedToday = habits.filter(h => getHabitStatus(h.id, today) === 'completed').length;
    const totalHabits = habits.length;

    if (loading) {
        return (
            <Card variant="habit" className="animate-fade-in">
                <CardContent className="py-8 text-center text-muted-foreground">
                    Loading...
                </CardContent>
            </Card>
        );
    }

    return (
        <Card variant="habit" className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="flex items-center gap-2 text-habit">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-habit/20">
                            <Check className="h-4 w-4" />
                        </div>
                        Today's Habits
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {completedToday} of {totalHabits} completed
                    </p>
                </div>
                <Button
                    variant="habit"
                    size="icon-sm"
                    onClick={() => setIsAdding(!isAdding)}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-3">
                {isAdding && (
                    <div className="space-y-3 animate-fade-in p-3 rounded-lg bg-background/50 border border-habit/30">
                        <Input
                            placeholder="New habit name..."
                            value={newHabitName}
                            onChange={(e) => setNewHabitName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
                            className="bg-background/50 border-habit/30 focus:border-habit"
                            autoFocus
                        />

                        <div className="flex gap-2">
                            <Button
                                variant={newHabitFrequency === 'daily' ? 'habit' : 'outline'}
                                size="sm"
                                onClick={() => setNewHabitFrequency('daily')}
                                className="flex-1"
                            >
                                Daily
                            </Button>
                            <Button
                                variant={newHabitFrequency === 'weekly' ? 'habit' : 'outline'}
                                size="sm"
                                onClick={() => setNewHabitFrequency('weekly')}
                                className="flex-1"
                            >
                                Weekly
                            </Button>
                            <Button
                                variant={newHabitFrequency === 'monthly' ? 'habit' : 'outline'}
                                size="sm"
                                onClick={() => setNewHabitFrequency('monthly')}
                                className="flex-1"
                            >
                                Monthly
                            </Button>
                        </div>

                        {(newHabitFrequency === 'weekly' || newHabitFrequency === 'monthly') && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Target:</span>
                                <Input
                                    type="number"
                                    min="1"
                                    max={newHabitFrequency === 'weekly' ? '7' : '31'}
                                    value={newHabitTarget}
                                    onChange={(e) => setNewHabitTarget(e.target.value)}
                                    className="w-20 bg-background/50 border-habit/30"
                                />
                                <span className="text-sm text-muted-foreground">
                                    times per {newHabitFrequency === 'weekly' ? 'week' : 'month'}
                                </span>
                            </div>
                        )}

                        <Button variant="habit" size="sm" onClick={handleAddHabit} className="w-full">
                            Add Habit
                        </Button>
                    </div>
                )}

                {habits.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        <p>No habits yet. Add your first habit above!</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {habits.map((habit) => {
                            const status = getHabitStatus(habit.id, today);
                            const streak = getStreak(habit.id);
                            const rate = getCompletionRate(habit.id);
                            const last7Days = getLast7Days();

                            return (
                                <div
                                    key={habit.id}
                                    className="group rounded-lg border border-border/50 bg-background/30 p-3 transition-all hover:border-habit/30"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <button
                                                onClick={() => handleToggle(habit.id)}
                                                disabled={status === 'locked'}
                                                className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 transition-all duration-200 ${status === 'completed'
                                                    ? 'border-success bg-success/20 text-success animate-check'
                                                    : status === 'pending'
                                                        ? 'border-border hover:border-habit hover:bg-habit/10 cursor-pointer'
                                                        : status === 'missed'
                                                            ? 'border-destructive/50 bg-destructive/10 text-destructive'
                                                            : 'border-border/30 bg-muted/20 cursor-not-allowed'
                                                    }`}
                                            >
                                                {status === 'completed' && <Check className="h-4 w-4" />}
                                                {status === 'missed' && <X className="h-3 w-3" />}
                                            </button>
                                            <div className="flex-1">
                                                <span className={`font-medium ${status === 'completed' ? 'text-success' : ''}`}>
                                                    {habit.name}
                                                </span>
                                                <div className="flex items-center gap-3 mt-1">
                                                    {habit.frequency === 'daily' && streak > 0 && (
                                                        <span className="flex items-center gap-1 text-xs text-primary">
                                                            <Flame className="h-3 w-3" />
                                                            {streak} day streak
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-muted-foreground capitalize">
                                                        {habit.frequency}
                                                        {habit.frequency !== 'daily' && ` (${habit.target_count}x)`}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {rate}% overall
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 mr-2">
                                            {last7Days.map((date) => {
                                                const dayStatus = getHabitStatus(habit.id, date);
                                                return (
                                                    <div
                                                        key={date}
                                                        className="flex flex-col items-center"
                                                        title={date}
                                                    >
                                                        <span className="text-[10px] text-muted-foreground mb-0.5">
                                                            {formatDayLabel(date)}
                                                        </span>
                                                        <div
                                                            className={`h-4 w-4 rounded-sm ${dayStatus === 'completed'
                                                                ? 'bg-success'
                                                                : dayStatus === 'missed'
                                                                    ? 'bg-destructive/50'
                                                                    : dayStatus === 'pending'
                                                                        ? 'bg-muted border border-dashed border-habit/50'
                                                                        : 'bg-muted/30'
                                                                }`}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleRemoveHabit(habit.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}