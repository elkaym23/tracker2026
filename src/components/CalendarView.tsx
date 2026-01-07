import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Edit2, Trash2, Cake, Clock, Bell, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { habitDb, todoDb, journalDb, calendarDb } from '@/lib/db';

export function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [monthData, setMonthData] = useState<any>({
        habits: [],
        completions: [],
        todos: [],
        journals: [],
        events: [],
    });
    const [loading, setLoading] = useState(true);
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        category: 'other' as 'birthday' | 'appointment' | 'reminder' | 'other',
        time: '',
        date: '',
    });

    useEffect(() => {
        loadMonthData();
    }, [currentDate]);

    const loadMonthData = async () => {
        try {
            setLoading(true);
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();

            // Get first and last day of month
            const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
            const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

            // Load all data for the month
            const [habits, journals, events] = await Promise.all([
                habitDb.getAllHabits(),
                journalDb.getAll(),
                calendarDb.getByDateRange(firstDay, lastDay),
            ]);

            // Get completions for all habits in this month
            const completions = await habitDb.getCompletionsInRange(firstDay, lastDay);

            // Get all todos for each day in the month
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const todosPromises = [];
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = new Date(year, month, day).toISOString().split('T')[0];
                todosPromises.push(todoDb.getByDate(dateStr));
            }
            const allTodos = await Promise.all(todosPromises);
            const todos = allTodos.flat();

            setMonthData({ habits, completions, todos, journals, events });
        } catch (error) {
            console.error('Error loading calendar data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

        return { daysInMonth, startingDayOfWeek };
    };

    const getDayData = (day: number) => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const dateStr = new Date(year, month, day).toISOString().split('T')[0];

        const completionsCount = monthData.completions.filter((c: any) => c.date === dateStr).length;
        const todosCount = monthData.todos.filter((t: any) => t.date === dateStr).length;
        const todosDone = monthData.todos.filter((t: any) => t.date === dateStr && t.completed).length;
        const hasJournal = monthData.journals.some((j: any) => j.date === dateStr);
        const eventsCount = monthData.events.filter((e: any) => e.date === dateStr).length;

        return { completionsCount, todosCount, todosDone, hasJournal, eventsCount, dateStr };
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
        setSelectedDate(null);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
        setSelectedDate(null);
    };

    const handleToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(new Date().toISOString().split('T')[0]);
    };

    const handleAddEvent = async () => {
        if (newEvent.title.trim() && newEvent.date) {
            try {
                await calendarDb.create({
                    ...newEvent,
                    description: newEvent.description || undefined,
                    time: newEvent.time || undefined,
                });
                await loadMonthData();
                setIsAddingEvent(false);
                setNewEvent({ title: '', description: '', category: 'other', time: '', date: '' });
            } catch (error) {
                console.error('Error adding event:', error);
            }
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (confirm('Delete this event?')) {
            try {
                await calendarDb.delete(id);
                await loadMonthData();
            } catch (error) {
                console.error('Error deleting event:', error);
            }
        }
    };

    const openAddEventDialog = (dateStr: string) => {
        setNewEvent({ ...newEvent, date: dateStr });
        setIsAddingEvent(true);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
        );
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth();
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Get selected date details
    const selectedDateData = selectedDate ? (() => {
        const completions = monthData.completions.filter((c: any) => c.date === selectedDate);
        const todos = monthData.todos.filter((t: any) => t.date === selectedDate);
        const journal = monthData.journals.find((j: any) => j.date === selectedDate);
        const events = monthData.events.filter((e: any) => e.date === selectedDate);

        return { completions, todos, journal, events };
    })() : null;

    const categoryIcons = {
        birthday: Cake,
        appointment: Clock,
        reminder: Bell,
        other: Star,
    };

    const categoryColors = {
        birthday: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
        appointment: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        reminder: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        other: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    Loading calendar...
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" />
                            Calendar
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handleToday}>
                                Today
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={handlePrevMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium min-w-[140px] text-center">
                                {monthName}
                            </span>
                            <Button variant="ghost" size="icon-sm" onClick={handleNextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {/* Week day headers */}
                        {weekDays.map((day) => (
                            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                                {day}
                            </div>
                        ))}

                        {/* Empty cells for days before month starts */}
                        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}

                        {/* Calendar days */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const { completionsCount, todosCount, todosDone, hasJournal, eventsCount, dateStr } = getDayData(day);
                            const today = isToday(day);
                            const isSelected = selectedDate === dateStr;

                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDate(dateStr)}
                                    className={`aspect-square p-2 rounded-lg border transition-all hover:border-primary/50 relative ${today ? 'border-primary bg-primary/5' : 'border-border'
                                        } ${isSelected ? 'bg-primary/10 border-primary' : ''
                                        }`}
                                >
                                    <div className="flex flex-col h-full">
                                        <span className={`text-sm font-medium ${today ? 'text-primary' : ''}`}>
                                            {day}
                                        </span>
                                        {eventsCount > 0 && (
                                            <div className="absolute top-1 right-1">
                                                <div className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                                            </div>
                                        )}
                                        <div className="flex flex-col gap-0.5 mt-auto">
                                            {completionsCount > 0 && (
                                                <div className="h-1 w-full rounded-full bg-success" />
                                            )}
                                            {todosCount > 0 && (
                                                <div className={`h-1 w-full rounded-full ${todosDone === todosCount ? 'bg-primary' : 'bg-muted'
                                                    }`} />
                                            )}
                                            {hasJournal && (
                                                <div className="h-1 w-full rounded-full bg-journal" />
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs flex-wrap">
                        <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-success" />
                            <span className="text-muted-foreground">Habits</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            <span className="text-muted-foreground">Todos</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-journal" />
                            <span className="text-muted-foreground">Journal</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-pink-500" />
                            <span className="text-muted-foreground">Events</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Selected Date Details */}
            {selectedDate && selectedDateData && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">
                            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </CardTitle>
                        <Button size="sm" onClick={() => openAddEventDialog(selectedDate)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add Event
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Events */}
                        {selectedDateData.events.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold mb-2">Events</h4>
                                <div className="space-y-2">
                                    {selectedDateData.events.map((event: any) => {
                                        const Icon = categoryIcons[event.category as keyof typeof categoryIcons];
                                        return (
                                            <div
                                                key={event.id}
                                                className={`flex items-start justify-between p-3 rounded-lg border ${categoryColors[event.category as keyof typeof categoryColors]
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3 flex-1">
                                                    <Icon className="h-4 w-4 mt-0.5" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{event.title}</span>
                                                            {event.time && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    {event.time}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {event.description && (
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {event.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => handleDeleteEvent(event.id)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {/* Habits */}
                        {selectedDateData.completions.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-success" />
                                    Habits Completed ({selectedDateData.completions.length})
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedDateData.completions.map((c: any) => {
                                        const habit = monthData.habits.find((h: any) => h.id === c.habit_id);
                                        return habit ? (
                                            <Badge key={c.id} variant="outline" className="bg-success/10">
                                                {habit.name}
                                            </Badge>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Todos */}
                        {selectedDateData.todos.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                    Tasks ({selectedDateData.todos.filter((t: any) => t.completed).length}/{selectedDateData.todos.length})
                                </h4>
                                <div className="space-y-1">
                                    {selectedDateData.todos.map((todo: any) => (
                                        <div key={todo.id} className="flex items-center gap-2 text-sm">
                                            <div className={`h-1.5 w-1.5 rounded-full ${todo.completed ? 'bg-success' : 'bg-muted'
                                                }`} />
                                            <span className={todo.completed ? 'line-through text-muted-foreground' : ''}>
                                                {todo.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Journal */}
                        {selectedDateData.journal && (
                            <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-journal" />
                                    Journal Entry
                                </h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {selectedDateData.journal.content.substring(0, 150)}
                                    {selectedDateData.journal.content.length > 150 ? '...' : ''}
                                </p>
                            </div>
                        )}

                        {selectedDateData.completions.length === 0 &&
                            selectedDateData.todos.length === 0 &&
                            !selectedDateData.journal &&
                            selectedDateData.events.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No activity on this day
                                </p>
                            )}
                    </CardContent>
                </Card>
            )}

            {/* Add Event Dialog */}
            <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Calendar Event</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Event Title</label>
                            <Input
                                placeholder="Birthday, Doctor appointment, etc."
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Category</label>
                            <Select
                                value={newEvent.category}
                                onValueChange={(value: any) => setNewEvent({ ...newEvent, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="birthday">🎂 Birthday</SelectItem>
                                    <SelectItem value="appointment">🕐 Appointment</SelectItem>
                                    <SelectItem value="reminder">🔔 Reminder</SelectItem>
                                    <SelectItem value="other">⭐ Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Time (Optional)</label>
                            <Input
                                type="time"
                                value={newEvent.time}
                                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                            <Textarea
                                placeholder="Add notes..."
                                value={newEvent.description}
                                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                className="min-h-[80px]"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsAddingEvent(false);
                                    setNewEvent({ title: '', description: '', category: 'other', time: '', date: '' });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleAddEvent}>
                                Add Event
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}