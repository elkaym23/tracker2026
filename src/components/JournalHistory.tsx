import { useState, useEffect } from 'react';
import { Calendar, Search, Edit2, Trash2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { journalDb } from '@/lib/db';

export function JournalHistory() {
    const [entries, setEntries] = useState<any[]>([]);
    const [filteredEntries, setFilteredEntries] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingEntry, setEditingEntry] = useState<any | null>(null);
    const [editContent, setEditContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        loadEntries();
    }, []);

    useEffect(() => {
        if (searchTerm.trim()) {
            const filtered = entries.filter(entry =>
                entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.date.includes(searchTerm) ||
                entry.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredEntries(filtered);
        } else {
            setFilteredEntries(entries);
        }
    }, [searchTerm, entries]);

    const loadEntries = async () => {
        try {
            setLoading(true);
            const data = await journalDb.getAll();
            setEntries(data || []);
            setFilteredEntries(data || []);
        } catch (error) {
            console.error('Error loading journal entries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (entry: any) => {
        setEditingEntry(entry);
        setEditContent(entry.content);
        setIsDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (editingEntry && editContent.trim()) {
            try {
                await journalDb.update(editingEntry.id, { content: editContent.trim() });
                await loadEntries();
                setIsDialogOpen(false);
                setEditingEntry(null);
                setEditContent('');
            } catch (error) {
                console.error('Error updating entry:', error);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this journal entry?')) {
            try {
                await journalDb.delete(id);
                await loadEntries();
            } catch (error) {
                console.error('Error deleting entry:', error);
            }
        }
    };

    const getEntryType = (entry: any) => {
        const typeTag = entry.tags?.find((t: string) => t.startsWith('type:'));
        return typeTag ? typeTag.split(':')[1] : 'general';
    };

    const getMoodRating = (entry: any) => {
        const moodTag = entry.tags?.find((t: string) => t.startsWith('mood-rating:'));
        return moodTag ? parseInt(moodTag.split(':')[1]) : null;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <Card variant="journal">
                <CardContent className="py-8 text-center text-muted-foreground">
                    Loading journal entries...
                </CardContent>
            </Card>
        );
    }

    return (
        <Card variant="journal" className="animate-fade-in">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-journal">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-journal/20">
                        <Calendar className="h-4 w-4" />
                    </div>
                    Journal History
                </CardTitle>
                <div className="flex items-center gap-2 mt-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search entries..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-background/50 border-journal/30"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {filteredEntries.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        <p className="text-sm">
                            {searchTerm ? 'No entries found matching your search.' : 'No journal entries yet. Start writing!'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                        {filteredEntries.map((entry) => {
                            const type = getEntryType(entry);
                            const moodRating = getMoodRating(entry);

                            return (
                                <div
                                    key={entry.id}
                                    className="group p-4 rounded-lg border border-journal/30 bg-background/30 hover:bg-journal/5 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-semibold text-journal">
                                                    {formatDate(entry.date)}
                                                </span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-journal/20 text-journal capitalize">
                                                    {type}
                                                </span>
                                                {moodRating && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                                                        Mood: {moodRating}/5
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => handleEdit(entry)}
                                            >
                                                <Edit2 className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => handleDelete(entry.id)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-foreground whitespace-pre-wrap">
                                        {entry.content}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Journal Entry</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">
                                    {editingEntry && formatDate(editingEntry.date)}
                                </p>
                                <Textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="min-h-[200px] bg-background/50"
                                    placeholder="Write your thoughts..."
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsDialogOpen(false);
                                        setEditingEntry(null);
                                        setEditContent('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button variant="journal" onClick={handleSaveEdit}>
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}