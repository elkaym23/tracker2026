import { Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DateHeader() {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    const monthDay = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const year = now.getFullYear();

    // Calculate days remaining in 2026
    const endOf2026 = new Date(2026, 11, 31);
    const startOf2026 = new Date(2026, 0, 1);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const daysRemaining = Math.max(0, Math.ceil((endOf2026.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    const totalDays = 365;
    const daysPassed = Math.max(0, Math.ceil((today.getTime() - startOf2026.getTime()) / (1000 * 60 * 60 * 24)));
    const progressPercent = year >= 2026 ? Math.min(100, (daysPassed / totalDays) * 100) : 0;

    return (
        <header className="mb-8 animate-fade-in">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">{dayOfWeek}</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">
                        {monthDay}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {year === 2026 ? (
                            <>
                                <span className="text-primary font-medium">{daysRemaining}</span> days remaining in 2026
                            </>
                        ) : (
                            <span>Tracker 2026</span>
                        )}
                    </p>
                </div>
                <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                </Button>
            </div>

            {year === 2026 && (
                <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Year Progress</span>
                        <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-1000"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            )}
        </header>
    );
}
