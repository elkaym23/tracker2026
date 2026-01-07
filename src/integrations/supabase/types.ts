export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            journal_entries: {
                Row: {
                    id: string
                    created_at: string
                    date: string
                    content: string
                    tags: string[] | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    date: string
                    content: string
                    tags?: string[] | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    date?: string
                    content?: string
                    tags?: string[] | null
                }
            }
            moods: {
                Row: {
                    id: string
                    created_at: string
                    date: string
                    mood: string
                    note: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    date: string
                    mood: string
                    note?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    date?: string
                    mood?: string
                    note?: string | null
                }
            }
            habits: {
                Row: {
                    id: string
                    created_at: string
                    name: string
                    color: string | null
                    icon: string | null
                    archived: boolean
                    frequency: 'daily' | 'weekly' | 'monthly'
                    target_count: number
                    days_of_week: number[] | null
                    day_of_month: number | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    name: string
                    color?: string | null
                    icon?: string | null
                    archived?: boolean
                    frequency?: 'daily' | 'weekly' | 'monthly'
                    target_count?: number
                    days_of_week?: number[] | null
                    day_of_month?: number | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    name?: string
                    color?: string | null
                    icon?: string | null
                    archived?: boolean
                    frequency?: 'daily' | 'weekly' | 'monthly'
                    target_count?: number
                    days_of_week?: number[] | null
                    day_of_month?: number | null
                }
            }
            habit_completions: {
                Row: {
                    id: string
                    habit_id: string
                    date: string
                }
                Insert: {
                    id?: string
                    habit_id: string
                    date: string
                }
                Update: {
                    id?: string
                    habit_id?: string
                    date?: string
                }
            }
            todos: {
                Row: {
                    id: string
                    created_at: string
                    date: string
                    text: string
                    completed: boolean
                    priority: number
                }
                Insert: {
                    id?: string
                    created_at?: string
                    date: string
                    text: string
                    completed?: boolean
                    priority?: number
                }
                Update: {
                    id?: string
                    created_at?: string
                    date?: string
                    text?: string
                    completed?: boolean
                    priority?: number
                }
            }
            reading_list: {
                Row: {
                    id: string
                    created_at: string
                    title: string
                    author: string | null
                    status: 'want_to_read' | 'reading' | 'completed'
                    current_page: number
                    total_pages: number | null
                    started_date: string | null
                    completed_date: string | null
                    rating: number | null
                    notes: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    title: string
                    author?: string | null
                    status?: 'want_to_read' | 'reading' | 'completed'
                    current_page?: number
                    total_pages?: number | null
                    started_date?: string | null
                    completed_date?: string | null
                    rating?: number | null
                    notes?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    title?: string
                    author?: string | null
                    status?: 'want_to_read' | 'reading' | 'completed'
                    current_page?: number
                    total_pages?: number | null
                    started_date?: string | null
                    completed_date?: string | null
                    rating?: number | null
                    notes?: string | null
                }
            }
            self_care_items: {
                Row: {
                    id: string
                    created_at: string
                    date: string
                    category: string
                    item: string
                    completed: boolean
                }
                Insert: {
                    id?: string
                    created_at?: string
                    date: string
                    category: string
                    item: string
                    completed?: boolean
                }
                Update: {
                    id?: string
                    created_at?: string
                    date?: string
                    category?: string
                    item?: string
                    completed?: boolean
                }
            }
            calendar_events: {
                Row: {
                    id: string
                    created_at: string
                    date: string
                    title: string
                    description: string | null
                    category: 'birthday' | 'appointment' | 'reminder' | 'other'
                    time: string | null
                    color: string | null
                    is_recurring: boolean
                    recurrence_pattern: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    date?: string
                    title?: string
                    description?: string | null
                    category?: 'birthday' | 'appointment' | 'reminder' | 'other'
                    time?: string | null
                    color?: string | null
                    is_recurring?: boolean
                    recurrence_pattern?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    date?: string
                    title?: string
                    description?: string | null
                    category?: 'birthday' | 'appointment' | 'reminder' | 'other'
                    time?: string | null
                    color?: string | null
                    is_recurring?: boolean
                    recurrence_pattern?: string | null
                }
            }

            expenses: {
                Row: {
                    id: string
                    created_at: string
                    date: string
                    category: string
                    amount: number
                    description: string | null
                    type: 'expense' | 'income'
                }

                Insert: {
                    id?: string
                    created_at?: string
                    date: string
                    category: string
                    amount: number
                    description?: string | null
                    type?: 'expense' | 'income'
                }
                Update: {
                    id?: string
                    created_at?: string
                    date?: string
                    category?: string
                    amount?: number
                    description?: string | null
                    type?: 'expense' | 'income'
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}