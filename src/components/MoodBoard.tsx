import { useState, useEffect } from 'react';
import { Sparkles, Heart, Cloud, Sun, Moon, Star, Flower2, Music } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { moodDb } from '@/lib/db';

const moodOptions = [
    { mood: 'happy', emoji: '🥰', label: 'Happy', icon: Sun, color: 'bg-calendar/20 text-calendar border-calendar/30' },
    { mood: 'peaceful', emoji: '😌', label: 'Peaceful', icon: Cloud, color: 'bg-accent/20 text-accent border-accent/30' },
    { mood: 'excited', emoji: '🤩', label: 'Excited', icon: Sparkles, color: 'bg-love/20 text-love border-love/30' },
    { mood: 'loved', emoji: '💜', label: 'Loved', icon: Heart, color: 'bg-bts/20 text-bts border-bts/30' },
    { mood: 'creative', emoji: '✨', label: 'Creative', icon: Star, color: 'bg-primary/20 text-primary border-primary/30' },
    { mood: 'cozy', emoji: '🌸', label: 'Cozy', icon: Flower2, color: 'bg-secondary/40 text-secondary-foreground border-secondary/50' },
    { mood: 'dreamy', emoji: '🌙', label: 'Dreamy', icon: Moon, color: 'bg-journal/20 text-journal border-journal/30' },
    { mood: 'inspired', emoji: '🎵', label: 'BTS Mode', icon: Music, color: 'bg-bts/20 text-bts border-bts/30' },
];

export function MoodBoard() {
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [loading, setLoading] = useState(true);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        loadMood();
    }, [today]);

    const loadMood = async () => {
        try {
            setLoading(true);
            const mood = await moodDb.getByDate(today);
            if (mood) {
                setSelectedMood(mood.mood);
            }
        } catch (error) {
            console.error('Error loading mood:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMoodSelect = async (mood: string) => {
        try {
            setSelectedMood(mood);
            setShowConfetti(true);

            const existingMood = await moodDb.getByDate(today);

            if (existingMood) {
                await moodDb.update(existingMood.id, { mood });
            } else {
                await moodDb.create({ date: today, mood });
            }

            setTimeout(() => setShowConfetti(false), 1500);
        } catch (error) {
            console.error('Error saving mood:', error);
        }
    };

    if (loading) {
        return (
            <Card className="p-5 relative overflow-hidden bg-gradient-to-br from-card via-card to-secondary/20 border-primary/10">
                <div className="py-8 text-center text-muted-foreground">
                    Loading...
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-5 relative overflow-hidden bg-gradient-to-br from-card via-card to-secondary/20 border-primary/10">
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none z-20">
                    {[...Array(12)].map((_, i) => (
                        <span
                            key={i}
                            className="absolute animate-sparkle text-lg"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 0.5}s`,
                            }}
                        >
                            {['💜', '✨', '💗', '🦋', '🌸', '⭐'][i % 6]}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-full bg-love/20">
                    <Heart className="h-4 w-4 text-love fill-love/30" />
                </div>
                <h3 className="font-semibold text-foreground">How are you feeling?</h3>
            </div>

            <div className="grid grid-cols-4 gap-2">
                {moodOptions.map(({ mood, emoji, label, color }) => (
                    <Button
                        key={mood}
                        variant="outline"
                        onClick={() => handleMoodSelect(mood)}
                        className={`h-auto flex-col gap-1 py-3 transition-all ${selectedMood === mood
                            ? `${color} scale-105 glow-primary`
                            : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'
                            }`}
                    >
                        <span className="text-xl">{emoji}</span>
                        <span className="text-[10px] font-medium">{label}</span>
                    </Button>
                ))}
            </div>

            {selectedMood && (
                <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20 text-center animate-fade-in">
                    <p className="text-sm text-primary font-medium">
                        Feeling {moodOptions.find(m => m.mood === selectedMood)?.label.toLowerCase()}? You're glowing! ✨
                    </p>
                </div>
            )}
        </Card>
    );
}