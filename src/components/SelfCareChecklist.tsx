import { useState, useEffect } from 'react';
import { Droplets, Salad, Moon, Heart, Music, Sparkles, Sun } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { selfCareDb } from '@/lib/db';

const selfCareItems = [
    { id: 'water', label: 'Drank 8 glasses of water', icon: Droplets, color: 'text-accent', category: 'physical' },
    { id: 'eat', label: 'Ate something nourishing', icon: Salad, color: 'text-budget', category: 'physical' },
    { id: 'sleep', label: 'Got enough rest', icon: Moon, color: 'text-bts', category: 'physical' },
    { id: 'love', label: 'Did something I love', icon: Heart, color: 'text-love', category: 'mental' },
    { id: 'music', label: 'Listened to BTS', icon: Music, color: 'text-primary', category: 'mental' },
    { id: 'outside', label: 'Got some sunlight', icon: Sun, color: 'text-calendar', category: 'physical' },
];

export function SelfCareChecklist() {
    const [checkedItems, setCheckedItems] = useState<Record<string, any>>({});
    const [allComplete, setAllComplete] = useState(false);
    const [loading, setLoading] = useState(true);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        loadChecklist();
    }, [today]);

    useEffect(() => {
        const completedCount = Object.keys(checkedItems).length;
        setAllComplete(completedCount === selfCareItems.length);
    }, [checkedItems]);

    const loadChecklist = async () => {
        try {
            setLoading(true);
            const items = await selfCareDb.getByDate(today) as Array<{ item: string; id: string; completed: boolean }> | null;
            const itemsMap: Record<string, any> = {};

            items?.forEach(item => {
                // Extract the item ID from the item text or use a custom field
                const matchedItem = selfCareItems.find(sci => sci.label === item.item);
                if (matchedItem) {
                    itemsMap[matchedItem.id] = item;
                }
            });

            setCheckedItems(itemsMap);
        } catch (error) {
            console.error('Error loading self-care checklist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheck = async (id: string) => {
        const item = selfCareItems.find(sci => sci.id === id);
        if (!item) return;

        try {
            const existingItem = checkedItems[id];

            if (existingItem) {
                // Toggle existing item
                await selfCareDb.toggle(existingItem.id, !existingItem.completed);
                if (!existingItem.completed) {
                    setCheckedItems(prev => ({
                        ...prev,
                        [id]: { ...existingItem, completed: true }
                    }));
                } else {
                    // Remove from state if unchecked
                    const newItems = { ...checkedItems };
                    delete newItems[id];
                    setCheckedItems(newItems);
                }
            } else {
                // Create new item
                const newItem = await selfCareDb.create({
                    date: today,
                    category: item.category,
                    item: item.label,
                }) as Record<string, any>;
                setCheckedItems(prev => ({
                    ...prev,
                    [id]: { ...newItem, completed: true }
                }));
            }
        } catch (error) {
            console.error('Error updating self-care item:', error);
        }
    };

    const completedCount = Object.values(checkedItems).filter(item => item?.completed).length;
    const progress = (completedCount / selfCareItems.length) * 100;

    if (loading) {
        return (
            <Card className="p-5 relative overflow-hidden bg-gradient-to-br from-card to-love/5 border-love/10">
                <div className="py-8 text-center text-muted-foreground">
                    Loading...
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-5 relative overflow-hidden bg-gradient-to-br from-card to-love/5 border-love/10">
            {allComplete && (
                <div className="absolute -top-2 -right-2 text-3xl animate-float">👑</div>
            )}

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-primary/20">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Self-Care Check</h3>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                    {completedCount}/{selfCareItems.length}
                </span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-muted mb-4">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-love transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="space-y-2.5">
                {selfCareItems.map(({ id, label, icon: Icon, color }) => {
                    const isChecked = checkedItems[id]?.completed || false;

                    return (
                        <label
                            key={id}
                            className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${isChecked
                                ? 'bg-primary/10 border border-primary/20'
                                : 'bg-muted/30 border border-transparent hover:bg-muted/50'
                                }`}
                        >
                            <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => handleCheck(id)}
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <Icon className={`h-4 w-4 ${isChecked ? color : 'text-muted-foreground'}`} />
                            <span className={`text-sm flex-1 ${isChecked ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {label}
                            </span>
                            {isChecked && <span className="text-xs">✓</span>}
                        </label>
                    );
                })}
            </div>

            {allComplete && (
                <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-primary/20 to-love/20 text-center animate-fade-in border border-primary/20">
                    <p className="text-sm font-medium text-primary">
                        You took care of yourself today! 💜 You're amazing!
                    </p>
                </div>
            )}
        </Card>
    );
}