import { useState, useEffect } from 'react';
import { Sparkles, Star, Smile, PenLine, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { journalDb } from '@/lib/db';

type JournalType = 'highlight' | 'mood' | 'line';

const journalTypes: { type: JournalType; label: string; icon: typeof Sparkles; placeholder: string }[] = [
    { type: 'highlight', label: 'Highlight', icon: Sparkles, placeholder: "What was today's highlight?" },
    { type: 'mood', label: 'Mood', icon: Smile, placeholder: 'How are you feeling today?' },
    { type: 'line', label: 'Line a Day', icon: PenLine, placeholder: 'One sentence about today...' },
];

const moodOptions = [
    { value: 1, emoji: '😔', label: 'Rough' },
    { value: 2, emoji: '😕', label: 'Low' },
    { value: 3, emoji: '😐', label: 'Okay' },
    { value: 4, emoji: '🙂', label: 'Good' },
    { value: 5, emoji: '😄', label: 'Great' },
];

export function QuickJournal() {
    const [activeType, setActiveType] = useState<JournalType>('highlight');
    const [content, setContent] = useState('');
    const [moodRating, setMoodRating] = useState<number | undefined>();
    const [todaysEntries, setTodaysEntries] = useState<Record<JournalType, any>>({} as any);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        loadEntries();
    }, [today]);

    useEffect(() => {
        // Load existing entry for current type
        const existingEntry = todaysEntries[activeType];
        if (existingEntry) {
            setContent(existingEntry.content);
            if (existingEntry.tags?.includes('mood-rating:')) {
                const ratingTag = existingEntry.tags.find((t: string) => t.startsWith('mood-rating:'));
                if (ratingTag) {
                    setMoodRating(parseInt(ratingTag.split(':')[1]));
                }
            }
        } else {
            setContent('');
            setMoodRating(undefined);
        }
    }, [activeType, todaysEntries]);

    const loadEntries = async () => {
        try {
            setLoading(true);
            const allEntries = await journalDb.getAll();
            const todayEntries = allEntries.filter((e: any) => e.date === today);

            const entriesByType: Record<JournalType, any> = {} as any;
            todayEntries.forEach((entry: any) => {
                const typeTag = entry.tags?.find((t: string) => t.startsWith('type:'));
                if (typeTag) {
                    const type = typeTag.split(':')[1] as JournalType;
                    entriesByType[type] = entry;
                }
            });

            setTodaysEntries(entriesByType);
        } catch (error) {
            console.error('Error loading journal entries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (content.trim() || (activeType === 'mood' && moodRating)) {
            try {
                const tags = [`type:${activeType}`];
                if (activeType === 'mood' && moodRating) {
                    tags.push(`mood-rating:${moodRating}`);
                }

                const existingEntry = todaysEntries[activeType];

                if (existingEntry) {
                    // Update existing entry
                    await journalDb.update(existingEntry.id, {
                        content: content.trim(),
                        tags,
                    });
                } else {
                    // Create new entry
                    await journalDb.create({
                        date: today,
                        content: content.trim(),
                        tags,
                    });
                }

                await loadEntries();
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            } catch (error) {
                console.error('Error saving journal entry:', error);
            }
        }
    };

    const activeConfig = journalTypes.find(j => j.type === activeType)!;
    const hasEntryForType = !!todaysEntries[activeType];

    if (loading) {
        return (
            <Card variant="journal" className="animate-fade-in stagger-3">
                <CardContent className="py-8 text-center text-muted-foreground">
                    Loading...
                </CardContent>
            </Card>
        );
    }

    return (
        <Card variant="journal" className="animate-fade-in stagger-3">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-journal">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-journal/20">
                        <Star className="h-4 w-4" />
                    </div>
                    Quick Journal
                </CardTitle>
                <div className="flex gap-2 mt-2">
                    {journalTypes.map(({ type, label, icon: Icon }) => (
                        <Button
                            key={type}
                            variant={activeType === type ? 'journal' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveType(type)}
                            className="gap-1.5"
                        >
                            <Icon className="h-3 w-3" />
                            {label}
                            {todaysEntries[type] && (
                                <span className="ml-1 h-1.5 w-1.5 rounded-full bg-success" />
                            )}
                        </Button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {activeType === 'mood' && (
                    <div className="flex justify-center gap-2 py-2">
                        {moodOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setMoodRating(option.value)}
                                className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-all ${moodRating === option.value
                                    ? 'bg-journal/20 scale-110'
                                    : 'hover:bg-secondary'
                                    }`}
                            >
                                <span className="text-2xl">{option.emoji}</span>
                                <span className="text-xs text-muted-foreground">{option.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                <Textarea
                    placeholder={activeConfig.placeholder}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[100px] bg-background/50 border-journal/30 focus:border-journal resize-none"
                />

                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                        {hasEntryForType ? 'Entry exists for today' : 'No entry yet'}
                    </span>
                    <Button
                        variant="journal"
                        size="sm"
                        onClick={handleSave}
                        disabled={!content.trim() && !(activeType === 'mood' && moodRating)}
                        className="gap-1.5"
                    >
                        {saved ? (
                            <>
                                <Star className="h-3 w-3 fill-current" />
                                Saved!
                            </>
                        ) : (
                            <>
                                <Save className="h-3 w-3" />
                                Save Entry
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}