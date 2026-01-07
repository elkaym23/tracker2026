import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// JOURNAL ENTRIES
// ============================================================================

export interface JournalEntry {
    id: string;
    created_at: string;
    date: string;
    content: string;
    tags: string[] | null;
}

export const journalDb = {
    async getAll() {
        const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getByDate(date: string) {
        const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('date', date)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
        return data;
    },

    async create(entry: { date: string; content: string; tags?: string[] }) {
        const { data, error } = await supabase
            .from('journal_entries')
            .insert([entry])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, updates: { content?: string; tags?: string[] }) {
        const { data, error } = await supabase
            .from('journal_entries')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('journal_entries')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

// ============================================================================
// MOODS
// ============================================================================

export interface Mood {
    id: string;
    created_at: string;
    date: string;
    mood: string;
    note: string | null;
}

export const moodDb = {
    async getAll() {
        const { data, error } = await supabase
            .from('moods')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getByDate(date: string) {
        const { data, error } = await supabase
            .from('moods')
            .select('*')
            .eq('date', date)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async create(mood: { date: string; mood: string; note?: string }) {
        const { data, error } = await supabase
            .from('moods')
            .insert([mood])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, updates: { mood?: string; note?: string }) {
        const { data, error } = await supabase
            .from('moods')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

// ============================================================================
// HABITS
// ============================================================================

export interface Habit {
    id: string;
    created_at: string;
    name: string;
    color: string | null;
    icon: string | null;
    archived: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    target_count: number;
    days_of_week: number[] | null;
    day_of_month: number | null;
}

export interface HabitCompletion {
    id: string;
    habit_id: string;
    date: string;
}

export const habitDb = {
    async getAllHabits() {
        const { data, error } = await supabase
            .from('habits')
            .select('*')
            .eq('archived', false)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    async createHabit(habit: {
        name: string;
        color?: string;
        icon?: string;
        frequency?: 'daily' | 'weekly' | 'monthly';
        target_count?: number;
        days_of_week?: number[] | null;
        day_of_month?: number | null;
    }) {
        const { data, error } = await supabase
            .from('habits')
            .insert([{
                ...habit,
                frequency: habit.frequency || 'daily',
                target_count: habit.target_count || 1
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateHabit(id: string, updates: {
        name?: string;
        color?: string;
        icon?: string;
        frequency?: 'daily' | 'weekly' | 'monthly';
        target_count?: number;
        days_of_week?: number[] | null;
        day_of_month?: number | null;
    }) {
        const { data, error } = await supabase
            .from('habits')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async archiveHabit(id: string) {
        const { error } = await supabase
            .from('habits')
            .update({ archived: true })
            .eq('id', id);

        if (error) throw error;
    },

    async getCompletions(habitId: string, startDate?: string, endDate?: string) {
        let query = supabase
            .from('habit_completions')
            .select('*')
            .eq('habit_id', habitId);

        if (startDate) query = query.gte('date', startDate);
        if (endDate) query = query.lte('date', endDate);

        const { data, error } = await query.order('date', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getCompletionsInRange(startDate: string, endDate: string) {
        const { data, error } = await supabase
            .from('habit_completions')
            .select('*')
            .gte('date', startDate)
            .lt('date', endDate)
            .order('date', { ascending: false });

        if (error) throw error;
        return data;
    },

    async toggleCompletion(habitId: string, date: string) {
        // Check if completion exists
        const { data: existing } = await supabase
            .from('habit_completions')
            .select('*')
            .eq('habit_id', habitId)
            .eq('date', date)
            .single();

        if (existing) {
            // Delete if exists
            const { error } = await supabase
                .from('habit_completions')
                .delete()
                .eq('id', existing.id);

            if (error) throw error;
            return null;
        } else {
            // Create if doesn't exist - NO completed field!
            const { data, error } = await supabase
                .from('habit_completions')
                .insert([{ habit_id: habitId, date }])  // ← REMOVE completed: true
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    }
};

// ============================================================================
// TODOS
// ============================================================================

export interface Todo {
    id: string;
    created_at: string;
    date: string;
    text: string;
    completed: boolean;
    priority: number;
}

export const todoDb = {
    async getByDate(date: string) {
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('date', date)
            .order('priority', { ascending: false })
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    async create(todo: { date: string; text: string; priority?: number }) {
        const { data, error } = await supabase
            .from('todos')
            .insert([{ ...todo, priority: todo.priority || 0 }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, updates: { text?: string; completed?: boolean; priority?: number }) {
        const { data, error } = await supabase
            .from('todos')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('todos')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

// ============================================================================
// READING LIST
// ============================================================================

export interface Book {
    id: string;
    created_at: string;
    title: string;
    author: string | null;
    status: 'want_to_read' | 'reading' | 'completed';
    current_page: number;
    total_pages: number | null;
    started_date: string | null;
    completed_date: string | null;
    rating: number | null;
    notes: string | null;
}

export const bookDb = {
    async getAll() {
        const { data, error } = await supabase
            .from('reading_list')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getByStatus(status: string) {
        const { data, error } = await supabase
            .from('reading_list')
            .select('*')
            .eq('status', status)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async create(book: { title: string; author?: string; total_pages?: number }) {
        const { data, error } = await supabase
            .from('reading_list')
            .insert([{ ...book, status: 'want_to_read' }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, updates: Partial<Book>) {
        const { data, error } = await supabase
            .from('reading_list')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('reading_list')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

// ============================================================================
// SELF-CARE CHECKLIST
// ============================================================================

export interface SelfCareItem {
    id: string;
    created_at: string;
    date: string;
    category: string;
    item: string;
    completed: boolean;
}

export const selfCareDb = {
    async getByDate(date: string) {
        const { data, error } = await supabase
            .from('self_care_items')
            .select('*')
            .eq('date', date)
            .order('category', { ascending: true });

        if (error) throw error;
        return data;
    },

    async create(item: { date: string; category: string; item: string }) {
        const { data, error } = await supabase
            .from('self_care_items')
            .insert([item])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async toggle(id: string, completed: boolean) {
        const { data, error } = await supabase
            .from('self_care_items')
            .update({ completed })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('self_care_items')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

// ============================================================================
// EXPENSES
// ============================================================================

export interface Expense {
    id: string;
    created_at: string;
    date: string;
    category: string;
    amount: number;
    description: string | null;
    type: 'expense' | 'income';
}

export const expenseDb = {
    async getByDateRange(startDate: string, endDate: string) {
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: false });

        if (error) throw error;
        return data;
    },

    async create(expense: { date: string; category: string; amount: number; description?: string; type?: 'expense' | 'income' }) {
        const { data, error } = await supabase
            .from('expenses')
            .insert([{ ...expense, type: expense.type || 'expense' }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, updates: Partial<Expense>) {
        const { data, error } = await supabase
            .from('expenses')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

// ============================================================================
// CALENDAR EVENTS
// ============================================================================

export interface CalendarEvent {
    id: string;
    created_at: string;
    date: string;
    title: string;
    description: string | null;
    category: 'birthday' | 'appointment' | 'reminder' | 'other';
    time: string | null;
    color: string | null;
    is_recurring: boolean;
    recurrence_pattern: string | null;
}

export const calendarDb = {
    async getAll() {
        const { data, error } = await supabase
            .from('calendar_events')
            .select('*')
            .order('date', { ascending: true });

        if (error) throw error;
        return data;
    },

    async getByDateRange(startDate: string, endDate: string) {
        const { data, error } = await supabase
            .from('calendar_events')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true });

        if (error) throw error;
        return data;
    },

    async getByDate(date: string) {
        const { data, error } = await supabase
            .from('calendar_events')
            .select('*')
            .eq('date', date)
            .order('time', { ascending: true });

        if (error) throw error;
        return data;
    },

    async create(event: {
        date: string;
        title: string;
        description?: string;
        category: 'birthday' | 'appointment' | 'reminder' | 'other';
        time?: string;
        color?: string;
        is_recurring?: boolean;
        recurrence_pattern?: string;
    }) {
        const { data, error } = await supabase
            .from('calendar_events')
            .insert([event])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, updates: Partial<CalendarEvent>) {
        const { data, error } = await supabase
            .from('calendar_events')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('calendar_events')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};