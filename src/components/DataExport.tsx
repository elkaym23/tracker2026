import { useState } from 'react';
import { Download, FileText, Calendar, Heart, BookOpen, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { habitDb, moodDb, journalDb, bookDb, todoDb, expenseDb } from '@/lib/db';

export function DataExport() {
    const [exporting, setExporting] = useState(false);

    const exportAllData = async () => {
        try {
            setExporting(true);

            const [habits, moods, journals, books, todos, expenses] = await Promise.all([
                habitDb.getAllHabits().then(async (habits) => {
                    const habitsWithCompletions = await Promise.all(
                        habits.map(async (habit) => ({
                            ...habit,
                            completions: await habitDb.getCompletions(habit.id),
                        }))
                    );
                    return habitsWithCompletions;
                }),
                moodDb.getAll(),
                journalDb.getAll(),
                bookDb.getAll(),
                todoDb.getByDate(new Date().toISOString().split('T')[0]), // Today's todos as example
                expenseDb.getByDateRange(
                    new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
                    new Date().toISOString().split('T')[0]
                ),
            ]);

            const exportData = {
                exportedAt: new Date().toISOString(),
                exportedBy: 'Tracker 2026',
                data: {
                    habits,
                    moods,
                    journals,
                    books,
                    todos,
                    expenses,
                },
                stats: {
                    totalHabits: habits.length,
                    totalMoods: moods.length,
                    totalJournals: journals.length,
                    totalBooks: books.length,
                    totalTodos: todos.length,
                    totalExpenses: expenses.length,
                },
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting data:', error);
        } finally {
            setExporting(false);
        }
    };

    const exportJournalsAsText = async () => {
        try {
            setExporting(true);
            const journals = await journalDb.getAll();

            let textContent = '# My Journal Entries\n\n';
            textContent += `Exported: ${new Date().toLocaleDateString()}\n`;
            textContent += `Total Entries: ${journals.length}\n\n`;
            textContent += '---\n\n';

            journals
                .sort((a, b) => b.date.localeCompare(a.date))
                .forEach((entry) => {
                    const typeTag = entry.tags?.find((t: string) => t.startsWith('type:'));
                    const type = typeTag ? typeTag.split(':')[1] : 'general';

                    textContent += `## ${new Date(entry.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}\n\n`;
                    textContent += `**Type:** ${type}\n\n`;
                    textContent += `${entry.content}\n\n`;
                    textContent += '---\n\n';
                });

            const blob = new Blob([textContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `journal-entries-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting journals:', error);
        } finally {
            setExporting(false);
        }
    };

    const exportHabitReport = async () => {
        try {
            setExporting(true);
            const habits = await habitDb.getAllHabits();

            let report = '# Habit Tracking Report\n\n';
            report += `Generated: ${new Date().toLocaleDateString()}\n\n`;

            for (const habit of habits) {
                const completions = await habitDb.getCompletions(habit.id);
                const today = new Date().toISOString().split('T')[0];

                // Calculate streak
                let streak = 0;
                const dates = completions.map(c => c.date).sort().reverse();
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

                report += `## ${habit.name}\n\n`;
                report += `- Created: ${new Date(habit.created_at).toLocaleDateString()}\n`;
                report += `- Total Completions: ${completions.length}\n`;
                report += `- Current Streak: ${streak} days\n`;
                report += `- Completion Dates:\n`;

                completions
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .slice(0, 30)
                    .forEach((c) => {
                        report += `  - ${new Date(c.date).toLocaleDateString()}\n`;
                    });

                report += '\n';
            }

            const blob = new Blob([report], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `habit-report-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting habit report:', error);
        } finally {
            setExporting(false);
        }
    };

    const exportReadingList = async () => {
        try {
            setExporting(true);
            const books = await bookDb.getAll();

            let content = '# My Reading List\n\n';
            content += `Exported: ${new Date().toLocaleDateString()}\n`;
            content += `Total Books: ${books.length}\n\n`;

            const byStatus = {
                want_to_read: books.filter(b => b.status === 'want_to_read'),
                reading: books.filter(b => b.status === 'reading'),
                completed: books.filter(b => b.status === 'completed'),
            };

            Object.entries(byStatus).forEach(([status, bookList]) => {
                content += `## ${status.replace('_', ' ').toUpperCase()}\n\n`;
                if (bookList.length === 0) {
                    content += 'None\n\n';
                } else {
                    bookList.forEach((book) => {
                        content += `- **${book.title}**\n`;
                        if (book.author) content += `  Author: ${book.author}\n`;
                        if (book.started_date) content += `  Started: ${new Date(book.started_date).toLocaleDateString()}\n`;
                        if (book.completed_date) content += `  Completed: ${new Date(book.completed_date).toLocaleDateString()}\n`;
                        if (book.notes) content += `  Notes: ${book.notes}\n`;
                        content += '\n';
                    });
                }
            });

            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reading-list-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting reading list:', error);
        } finally {
            setExporting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Export Your Data
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Download your data for backup or to use elsewhere
                </p>
            </CardHeader>
            <CardContent className="grid gap-3">
                <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={exportAllData}
                    disabled={exporting}
                >
                    <FileText className="h-4 w-4 mr-2" />
                    Export All Data (JSON)
                    <span className="ml-auto text-xs text-muted-foreground">
                        Complete backup
                    </span>
                </Button>

                <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={exportJournalsAsText}
                    disabled={exporting}
                >
                    <Heart className="h-4 w-4 mr-2" />
                    Export Journal Entries
                    <span className="ml-auto text-xs text-muted-foreground">
                        Text format
                    </span>
                </Button>

                <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={exportHabitReport}
                    disabled={exporting}
                >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Export Habit Report
                    <span className="ml-auto text-xs text-muted-foreground">
                        With stats
                    </span>
                </Button>

                <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={exportReadingList}
                    disabled={exporting}
                >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Export Reading List
                    <span className="ml-auto text-xs text-muted-foreground">
                        All books
                    </span>
                </Button>

                {exporting && (
                    <p className="text-sm text-center text-muted-foreground mt-2">
                        Preparing export...
                    </p>
                )}
            </CardContent>
        </Card>
    );
}