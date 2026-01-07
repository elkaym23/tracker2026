import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Custom hook for real-time Supabase subscriptions
 * Updates data automatically when changes occur in the database
 */
export function useRealtimeSubscription(
    table: string,
    onInsert?: (payload: any) => void,
    onUpdate?: (payload: any) => void,
    onDelete?: (payload: any) => void
) {
    useEffect(() => {
        const channel = supabase
            .channel(`${table}-changes`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: table,
                },
                (payload) => {
                    console.log(`[Realtime] INSERT on ${table}:`, payload);
                    onInsert?.(payload);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: table,
                },
                (payload) => {
                    console.log(`[Realtime] UPDATE on ${table}:`, payload);
                    onUpdate?.(payload);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: table,
                },
                (payload) => {
                    console.log(`[Realtime] DELETE on ${table}:`, payload);
                    onDelete?.(payload);
                }
            )
            .subscribe((status) => {
                console.log(`[Realtime] Subscription status for ${table}:`, status);
            });

        return () => {
            console.log(`[Realtime] Unsubscribing from ${table}`);
            supabase.removeChannel(channel);
        };
    }, [table, onInsert, onUpdate, onDelete]);
}

/**
 * Example usage in a component:
 * 
 * function TodoComponent() {
 *   const [todos, setTodos] = useState([]);
 * 
 *   useRealtimeSubscription(
 *     'todos',
 *     // On insert
 *     (payload) => {
 *       setTodos(prev => [...prev, payload.new]);
 *     },
 *     // On update
 *     (payload) => {
 *       setTodos(prev => prev.map(todo => 
 *         todo.id === payload.new.id ? payload.new : todo
 *       ));
 *     },
 *     // On delete
 *     (payload) => {
 *       setTodos(prev => prev.filter(todo => todo.id !== payload.old.id));
 *     }
 *   );
 * 
 *   return <div>...</div>;
 * }
 */