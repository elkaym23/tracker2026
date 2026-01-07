// Local storage utilities for Tracker 2026
// All data persists locally on the device

const STORAGE_KEYS = {
    HABITS: "tracker2026_habits",
    HABIT_LOGS: "tracker2026_habit_logs",
    TODOS: "tracker2026_todos",
    JOURNALS: "tracker2026_journals",
    BOOKS: "tracker2026_books",
    BUDGETS: "tracker2026_budgets",
    CALENDAR_TASKS: "tracker2026_calendar_tasks",
} as const;

// Types
export interface Habit {
    id: string;
    name: string;
    icon?: string;
    createdAt: string;
    color?: string;
}

export interface HabitLog {
    habitId: string;
    date: string; // YYYY-MM-DD format
    completed: boolean;
    completedAt?: string;
}

export interface Todo {
    id: string;
    date: string; // YYYY-MM-DD format
    text: string;
    completed: boolean;
    createdAt: string;
}

export interface JournalEntry {
    id: string;
    date: string;
    type: "highlight" | "mood" | "line";
    content: string;
    moodRating?: number; // 1-5 for mood journal
    createdAt: string;
}

export interface Book {
    id: string;
    title: string;
    author?: string;
    startDate?: string;
    targetEndDate?: string;
    status: "not_started" | "in_progress" | "finished";
    notes?: string;
    createdAt: string;
}

export interface BudgetItem {
    id: string;
    name: string;
    amount: number;
    isRecurring: boolean;
    category?: string;
}

export interface MonthlyBudget {
    id: string;
    month: string; // YYYY-MM format
    items: BudgetItem[];
    createdAt: string;
}

export interface CalendarTask {
    id: string;
    date: string;
    text: string;
    completed: boolean;
    createdAt: string;
}

// Helper functions
function getItem<T>(key: string, defaultValue: T): T {
    try {
        const item = localStorage.getItem(key);
        return item ? (JSON.parse(item) as T) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function setItem<T>(key: string, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error("Storage error:", error);
    }
}

// Date utilities
export function getTodayString(): string {
    return new Date().toISOString().split("T")[0];
}

export function isToday(dateString: string): boolean {
    return dateString === getTodayString();
}

export function isPastDate(dateString: string): boolean {
    return dateString < getTodayString();
}

export function isFutureDate(dateString: string): boolean {
    return dateString > getTodayString();
}

// Habits
export function getHabits(): Habit[] {
    return getItem(STORAGE_KEYS.HABITS, []);
}

export function saveHabits(habits: Habit[]): void {
    setItem(STORAGE_KEYS.HABITS, habits);
}

export function addHabit(habit: Omit<Habit, "id" | "createdAt">): Habit {
    const habits = getHabits();
    const newHabit: Habit = {
        ...habit,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    };
    habits.push(newHabit);
    saveHabits(habits);
    return newHabit;
}

export function removeHabit(id: string): void {
    const habits = getHabits().filter((h) => h.id !== id);
    saveHabits(habits);

    // also remove logs for that habit
    const logs = getHabitLogs().filter((l) => l.habitId !== id);
    saveHabitLogs(logs);
}

// Habit logs
export function getHabitLogs(): HabitLog[] {
    return getItem(STORAGE_KEYS.HABIT_LOGS, []);
}

export function saveHabitLogs(logs: HabitLog[]): void {
    setItem(STORAGE_KEYS.HABIT_LOGS, logs);
}

/**
 * "No back-checking" rule is enforced in the UI by disabling past dates.
 * This function toggles completion ONLY for today.
 */
export function toggleHabitForToday(habitId: string): void {
    const today = getTodayString();
    const logs = getHabitLogs();
    const existing = logs.find((l) => l.habitId === habitId && l.date === today);

    if (existing) {
        existing.completed = !existing.completed;
        existing.completedAt = existing.completed ? new Date().toISOString() : undefined;
    } else {
        logs.push({
            habitId,
            date: today,
            completed: true,
            completedAt: new Date().toISOString(),
        });
    }

    saveHabitLogs(logs);
}

// Todos
export function getTodos(): Todo[] {
    return getItem(STORAGE_KEYS.TODOS, []);
}

export function saveTodos(todos: Todo[]): void {
    setItem(STORAGE_KEYS.TODOS, todos);
}

export function getTodosForDate(date: string): Todo[] {
    return getTodos().filter((t) => t.date === date);
}

export function addTodo(text: string, date: string): Todo {
    const todos = getTodos();
    const newTodo: Todo = {
        id: crypto.randomUUID(),
        date,
        text,
        completed: false,
        createdAt: new Date().toISOString(),
    };
    todos.push(newTodo);
    saveTodos(todos);
    return newTodo;
}

export function toggleTodo(id: string): void {
    const todos = getTodos();
    const todo = todos.find((t) => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos(todos);
    }
}

export function removeTodo(id: string): void {
    const todos = getTodos().filter((t) => t.id !== id);
    saveTodos(todos);
}

// Journals
export function getJournals(): JournalEntry[] {
    return getItem(STORAGE_KEYS.JOURNALS, []);
}

export function saveJournals(journals: JournalEntry[]): void {
    setItem(STORAGE_KEYS.JOURNALS, journals);
}

export function addJournalEntry(entry: Omit<JournalEntry, "id" | "createdAt">): JournalEntry {
    const journals = getJournals();
    const newEntry: JournalEntry = {
        ...entry,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    };
    journals.push(newEntry);
    saveJournals(journals);
    return newEntry;
}

export function getJournalForDate(date: string, type?: JournalEntry["type"]): JournalEntry[] {
    return getJournals().filter((j) => j.date === date && (!type || j.type === type));
}

// Books
export function getBooks(): Book[] {
    return getItem(STORAGE_KEYS.BOOKS, []);
}

export function saveBooks(books: Book[]): void {
    setItem(STORAGE_KEYS.BOOKS, books);
}

export function addBook(book: Omit<Book, "id" | "createdAt">): Book {
    const books = getBooks();
    const newBook: Book = {
        ...book,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    };
    books.push(newBook);
    saveBooks(books);
    return newBook;
}

export function updateBook(id: string, updates: Partial<Book>): void {
    const books = getBooks();
    const idx = books.findIndex((b) => b.id === id);
    if (idx >= 0) {
        books[idx] = { ...books[idx], ...updates };
        saveBooks(books);
    }
}

// Calendar tasks
export function getCalendarTasks(): CalendarTask[] {
    return getItem(STORAGE_KEYS.CALENDAR_TASKS, []);
}

export function saveCalendarTasks(tasks: CalendarTask[]): void {
    setItem(STORAGE_KEYS.CALENDAR_TASKS, tasks);
}

export function getCalendarTasksForDate(date: string): CalendarTask[] {
    return getCalendarTasks().filter((t) => t.date === date);
}

export function addCalendarTask(text: string, date: string): CalendarTask {
    const tasks = getCalendarTasks();
    const newTask: CalendarTask = {
        id: crypto.randomUUID(),
        date,
        text,
        completed: false,
        createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    saveCalendarTasks(tasks);
    return newTask;
}

export function toggleCalendarTask(id: string): void {
    const tasks = getCalendarTasks();
    const task = tasks.find((t) => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveCalendarTasks(tasks);
    }
}

export function removeCalendarTask(id: string): void {
    const tasks = getCalendarTasks().filter((t) => t.id !== id);
    saveCalendarTasks(tasks);
}

// Budgets (basic storage utilities, you can build generation logic on top)
export function getBudgets(): MonthlyBudget[] {
    return getItem(STORAGE_KEYS.BUDGETS, []);
}

export function saveBudgets(budgets: MonthlyBudget[]): void {
    setItem(STORAGE_KEYS.BUDGETS, budgets);
}

export function getCurrentMonthBudget(): MonthlyBudget | undefined {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return getBudgets().find((b) => b.month === currentMonth);
}

// Export/Import for backup
export function exportAllData(): string {
    const data = {
        habits: getHabits(),
        habitLogs: getHabitLogs(),
        todos: getTodos(),
        journals: getJournals(),
        books: getBooks(),
        budgets: getBudgets(),
        calendarTasks: getCalendarTasks(),
        exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
}

export function importAllData(jsonString: string): boolean {
    try {
        const data = JSON.parse(jsonString);
        if (data.habits) saveHabits(data.habits);
        if (data.habitLogs) saveHabitLogs(data.habitLogs);
        if (data.todos) saveTodos(data.todos);
        if (data.journals) saveJournals(data.journals);
        if (data.books) saveBooks(data.books);
        if (data.budgets) saveBudgets(data.budgets);
        if (data.calendarTasks) saveCalendarTasks(data.calendarTasks);
        return true;
    } catch {
        return false;
    }
}
