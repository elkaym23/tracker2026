/**
 * Date utility functions for habit tracking
 * All functions work with local dates (YYYY-MM-DD format)
 */

/**
 * Convert a Date object to YYYY-MM-DD format in local timezone
 */
export function localDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Get the weekday (0 = Sunday, 6 = Saturday) for a date
 */
export function localWeekday(date: Date): number {
    return date.getDay();
}

/**
 * Get the start of the week for a given date
 * @param date - The date to find the week start for
 * @param weekStartsOn - 0 for Sunday, 1 for Monday
 */
export function startOfWeek(date: Date, weekStartsOn: 0 | 1 = 0): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Get the end of the week (exclusive) for a given date
 * @param date - The date to find the week end for
 * @param weekStartsOn - 0 for Sunday, 1 for Monday
 */
export function endOfWeekExclusive(date: Date, weekStartsOn: 0 | 1 = 0): Date {
    const start = startOfWeek(date, weekStartsOn);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return end;
}

/**
 * Get the start of the month for a given date
 */
export function startOfMonth(date: Date): Date {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Get the start of the next month (exclusive end of current month)
 */
export function startOfNextMonth(date: Date): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Get the end of the month for a given date
 */
export function endOfMonth(date: Date): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return d;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
    return localDateKey(date1) === localDateKey(date2);
}

/**
 * Get an array of dates for a range
 */
export function getDateRange(startDate: Date, endDate: Date): string[] {
    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
        dates.push(localDateKey(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
}

/**
 * Format a date key (YYYY-MM-DD) to a readable string
 */
export function formatDateKey(dateKey: string, options?: Intl.DateTimeFormatOptions): string {
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString('en-US', options || {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Get the current date key
 */
export function getTodayKey(): string {
    return localDateKey(new Date());
}

/**
 * Check if a date key is today
 */
export function isToday(dateKey: string): boolean {
    return dateKey === getTodayKey();
}

/**
 * Check if a date key is in the past
 */
export function isPast(dateKey: string): boolean {
    return dateKey < getTodayKey();
}

/**
 * Check if a date key is in the future
 */
export function isFuture(dateKey: string): boolean {
    return dateKey > getTodayKey();
}