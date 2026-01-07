import { useState, useEffect } from 'react';
import { ListTodo, Plus, Trash2, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { todoDb } from '@/lib/db';

export function DailyTodos() {
    const [todos, setTodos] = useState<any[]>([]);
    const [newTodoText, setNewTodoText] = useState('');
    const [loading, setLoading] = useState(true);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        loadTodos();
    }, [today]);

    const loadTodos = async () => {
        try {
            setLoading(true);
            const data = await todoDb.getByDate(today);
            setTodos(data || []);
        } catch (error) {
            console.error('Error loading todos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTodo = async () => {
        if (newTodoText.trim()) {
            try {
                const newTodo = await todoDb.create({
                    date: today,
                    text: newTodoText.trim(),
                });
                setTodos([...todos, newTodo]);
                setNewTodoText('');
            } catch (error) {
                console.error('Error adding todo:', error);
            }
        }
    };

    const handleToggle = async (id: string) => {
        try {
            const todo = todos.find(t => t.id === id);
            if (todo) {
                await todoDb.update(id, { completed: !todo.completed });
                setTodos(todos.map(t =>
                    t.id === id ? { ...t, completed: !t.completed } : t
                ));
            }
        } catch (error) {
            console.error('Error toggling todo:', error);
        }
    };

    const handleRemove = async (id: string) => {
        try {
            await todoDb.delete(id);
            setTodos(todos.filter(t => t.id !== id));
        } catch (error) {
            console.error('Error removing todo:', error);
        }
    };

    const completedCount = todos.filter(t => t.completed).length;
    const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

    if (loading) {
        return (
            <Card className="animate-fade-in stagger-2">
                <CardContent className="py-8 text-center text-muted-foreground">
                    Loading...
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="animate-fade-in stagger-2">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                            <ListTodo className="h-4 w-4 text-primary" />
                        </div>
                        Today's Tasks
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                        {completedCount}/{todos.length}
                    </span>
                </div>
                {todos.length > 0 && (
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex gap-2">
                    <Input
                        placeholder="Add a task..."
                        value={newTodoText}
                        onChange={(e) => setNewTodoText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
                        className="bg-background/50"
                    />
                    <Button size="icon" onClick={handleAddTodo}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {todos.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground">
                        <p className="text-sm">No tasks for today yet.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {todos.map((todo) => (
                            <div
                                key={todo.id}
                                className={`group flex items-center gap-3 rounded-lg border border-border/50 p-3 transition-all ${todo.completed ? 'bg-success/5 border-success/20' : 'bg-background/30 hover:border-primary/30'
                                    }`}
                            >
                                <button
                                    onClick={() => handleToggle(todo.id)}
                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all ${todo.completed
                                        ? 'border-success bg-success/20 text-success'
                                        : 'border-border hover:border-primary'
                                        }`}
                                >
                                    {todo.completed && <Check className="h-3 w-3" />}
                                </button>
                                <span
                                    className={`flex-1 ${todo.completed ? 'text-muted-foreground line-through' : ''
                                        }`}
                                >
                                    {todo.text}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleRemove(todo.id)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}