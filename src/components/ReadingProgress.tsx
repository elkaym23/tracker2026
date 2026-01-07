import { useState, useEffect } from 'react';
import { BookOpen, Plus, MoreHorizontal, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { bookDb } from '@/lib/db';

const statusConfig = {
    want_to_read: { label: 'Not Started', color: 'text-muted-foreground' },
    reading: { label: 'Reading', color: 'text-reading' },
    completed: { label: 'Finished', color: 'text-success' },
};

export function ReadingProgress() {
    const [books, setBooks] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newAuthor, setNewAuthor] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        try {
            setLoading(true);
            const data = await bookDb.getAll();
            setBooks(data || []);
        } catch (error) {
            console.error('Error loading books:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBook = async () => {
        if (newTitle.trim()) {
            try {
                const book = await bookDb.create({
                    title: newTitle.trim(),
                    author: newAuthor.trim() || undefined,
                });
                setBooks([...books, book]);
                setNewTitle('');
                setNewAuthor('');
                setIsAdding(false);
            } catch (error) {
                console.error('Error adding book:', error);
            }
        }
    };

    const handleUpdateStatus = async (id: string, status: 'want_to_read' | 'reading' | 'completed') => {
        try {
            const updates: any = { status };

            if (status === 'reading') {
                updates.started_date = new Date().toISOString().split('T')[0];
            } else if (status === 'completed') {
                updates.completed_date = new Date().toISOString().split('T')[0];
            }

            await bookDb.update(id, updates);
            setBooks(books.map(b => b.id === id ? { ...b, ...updates } : b));
        } catch (error) {
            console.error('Error updating book status:', error);
        }
    };

    const currentlyReading = books.filter(b => b.status === 'reading');
    const finishedCount = books.filter(b => b.status === 'completed').length;

    if (loading) {
        return (
            <Card variant="reading" className="animate-fade-in stagger-4">
                <CardContent className="py-8 text-center text-muted-foreground">
                    Loading...
                </CardContent>
            </Card>
        );
    }

    return (
        <Card variant="reading" className="animate-fade-in stagger-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="flex items-center gap-2 text-reading">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-reading/20">
                            <BookOpen className="h-4 w-4" />
                        </div>
                        Reading List
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {currentlyReading.length} reading · {finishedCount} finished
                    </p>
                </div>
                <Button
                    variant="reading"
                    size="icon-sm"
                    onClick={() => setIsAdding(!isAdding)}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-3">
                {isAdding && (
                    <div className="space-y-2 animate-fade-in p-3 rounded-lg bg-background/50 border border-reading/30">
                        <Input
                            placeholder="Book title..."
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="bg-background/50 border-reading/30"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <Input
                                placeholder="Author (optional)"
                                value={newAuthor}
                                onChange={(e) => setNewAuthor(e.target.value)}
                                className="bg-background/50 border-reading/30"
                            />
                            <Button variant="reading" size="sm" onClick={handleAddBook}>
                                Add
                            </Button>
                        </div>
                    </div>
                )}

                {books.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No books yet. Start your reading list!</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {books.map((book) => (
                            <div
                                key={book.id}
                                className={`group flex items-center justify-between rounded-lg border p-3 transition-all ${book.status === 'reading'
                                    ? 'border-reading/30 bg-reading/5'
                                    : book.status === 'completed'
                                        ? 'border-success/30 bg-success/5'
                                        : 'border-border/50 bg-background/30'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {book.status === 'completed' ? (
                                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-success/20 text-success">
                                            <Check className="h-3 w-3" />
                                        </div>
                                    ) : (
                                        <div className={`h-6 w-6 rounded-md ${book.status === 'reading' ? 'bg-reading/20' : 'bg-muted'
                                            }`} />
                                    )}
                                    <div>
                                        <p className={`font-medium ${book.status === 'completed' ? 'text-muted-foreground' : ''}`}>
                                            {book.title}
                                        </p>
                                        {book.author && (
                                            <p className="text-xs text-muted-foreground">{book.author}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`text-xs ${statusConfig[book.status as keyof typeof statusConfig].color}`}>
                                        {statusConfig[book.status as keyof typeof statusConfig].label}
                                    </span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleUpdateStatus(book.id, 'want_to_read')}>
                                                Mark as Not Started
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleUpdateStatus(book.id, 'reading')}>
                                                Start Reading
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleUpdateStatus(book.id, 'completed')}>
                                                Mark as Finished
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
