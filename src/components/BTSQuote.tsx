import { useEffect, useState } from 'react';
import { Heart, Sparkles, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';

const btsQuotes = [
    { quote: "I'm the one I should love in this world.", member: "RM", song: "Epiphany" },
    { quote: "If you can't fly, then run. If you can't run, then walk.", member: "BTS", song: "Not Today" },
    { quote: "Life is tough, and things don't always work out well, but we should be brave and go on with our lives.", member: "Suga", song: "" },
    { quote: "Love yourself, love myself. Peace.", member: "Suga", song: "" },
    { quote: "Dream, though your beginnings might be humble, may the end be prosperous.", member: "RM", song: "" },
    { quote: "Even when this rain stops, when clouds go away, I stand here, just the same.", member: "BTS", song: "Forever Rain" },
    { quote: "You can't stop me lovin' myself!", member: "BTS", song: "Idol" },
    { quote: "Maybe I made a mistake yesterday, but yesterday's me is still me.", member: "RM", song: "" },
    { quote: "The flower that blooms in adversity is the most rare and beautiful of all.", member: "Jin", song: "" },
    { quote: "Life goes on.", member: "BTS", song: "Life Goes On" },
    { quote: "Purple means I will trust and love you for a long time.", member: "V", song: "" },
    { quote: "Teamwork makes the dream work.", member: "J-Hope", song: "" },
    { quote: "Go on your path, even if you live for a day.", member: "Jungkook", song: "" },
    { quote: "If you don't work hard, there won't be good results.", member: "Jimin", song: "" },
    { quote: "Find your name, find your voice by speaking yourself.", member: "RM", song: "UN Speech" },
];

const affirmations = [
    "You are worthy of love and happiness 💗",
    "Today is your day to shine, bestie! ✨",
    "You're doing amazing, sweetie! 🌸",
    "Be kind to yourself today 💜",
    "You are stronger than you know 💪",
    "Sending you purple love! 보라해 💜",
    "You're a queen and don't forget it! 👑",
    "Your energy is beautiful today 🦋",
    "Keep glowing, keep growing 🌷",
    "You deserve all the good things coming your way 🎀",
];

export function BTSQuote() {
    const [quote, setQuote] = useState(btsQuotes[0]);
    const [affirmation, setAffirmation] = useState(affirmations[0]);
    const [showSparkle, setShowSparkle] = useState(false);

    useEffect(() => {
        // Get a random quote based on the day
        const today = new Date();
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        setQuote(btsQuotes[dayOfYear % btsQuotes.length]);
        setAffirmation(affirmations[dayOfYear % affirmations.length]);
    }, []);

    const handleHeartClick = () => {
        setShowSparkle(true);
        setTimeout(() => setShowSparkle(false), 1000);
    };

    return (
        <Card className="relative overflow-hidden p-5 bg-gradient-to-br from-bts/10 via-primary/5 to-love/10 border-bts/20">
            {/* Decorative elements */}
            <div className="absolute top-2 right-2 text-2xl animate-float">💜</div>
            <div className="absolute bottom-2 left-2 text-lg opacity-50 animate-float" style={{ animationDelay: '1s' }}>✨</div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-full bg-bts/20">
                        <Star className="h-4 w-4 text-bts fill-bts/30" />
                    </div>
                    <span className="text-xs font-semibold text-bts uppercase tracking-wider">Daily Inspiration</span>
                </div>

                <blockquote className="text-foreground font-medium text-lg leading-relaxed mb-3">
                    "{quote.quote}"
                </blockquote>

                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        — {quote.member}
                        {quote.song && <span className="text-bts/70 ml-1">• {quote.song}</span>}
                    </div>
                    <button
                        onClick={handleHeartClick}
                        className="relative p-2 rounded-full hover:bg-love/10 transition-colors"
                    >
                        <Heart className={`h-5 w-5 text-love ${showSparkle ? 'animate-heart-beat' : ''} fill-love/30`} />
                        {showSparkle && (
                            <>
                                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-primary animate-sparkle" />
                                <Sparkles className="absolute -bottom-1 -left-1 h-3 w-3 text-bts animate-sparkle" style={{ animationDelay: '0.2s' }} />
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-4 pt-3 border-t border-bts/10">
                    <p className="text-sm text-center text-primary font-medium">
                        {affirmation}
                    </p>
                </div>
            </div>
        </Card>
    );
}