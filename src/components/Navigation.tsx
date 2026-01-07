import { useState } from 'react';
import {
    LayoutDashboard,
    CheckSquare,
    BookOpen,
    Calendar,
    PiggyBank,
    PenLine,
    Menu,
    X,
    BarChart3,
    Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type Section = 'dashboard' | 'habits' | 'journal' | 'calendar' | 'reading' | 'budget' | 'analytics' | 'settings';

interface NavigationProps {
    activeSection: Section;
    onSectionChange: (section: Section) => void;
}

const navItems: { section: Section; label: string; icon: typeof LayoutDashboard; color: string }[] = [
    { section: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-primary' },
    { section: 'habits', label: 'Habits', icon: CheckSquare, color: 'text-habit' },
    { section: 'journal', label: 'Journal', icon: PenLine, color: 'text-journal' },
    { section: 'reading', label: 'Reading', icon: BookOpen, color: 'text-reading' },
    { section: 'budget', label: 'Budget', icon: PiggyBank, color: 'text-budget' },
    { section: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-accent' },
    { section: 'calendar', label: 'Calendar', icon: Calendar, color: 'text-calendar' },
    { section: 'settings', label: 'Settings', icon: Settings, color: 'text-muted-foreground' },
];

export function Navigation({ activeSection, onSectionChange }: NavigationProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Desktop sidebar */}
            <nav className="hidden md:flex fixed left-0 top-0 h-full w-20 flex-col items-center gap-2 bg-sidebar border-r border-sidebar-border py-6 overflow-y-auto">
                <div className="mb-6">
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        T
                    </div>
                </div>

                {navItems.map(({ section, label, icon: Icon, color }) => (
                    <button
                        key={section}
                        onClick={() => onSectionChange(section)}
                        className={`group flex flex-col items-center gap-1 rounded-xl p-3 transition-all ${activeSection === section
                            ? 'bg-sidebar-accent'
                            : 'hover:bg-sidebar-accent/50'
                            }`}
                        title={label}
                    >
                        <Icon
                            className={`h-5 w-5 transition-colors ${activeSection === section ? color : 'text-muted-foreground group-hover:text-foreground'
                                }`}
                        />
                        <span
                            className={`text-[10px] font-medium ${activeSection === section ? 'text-foreground' : 'text-muted-foreground'
                                }`}
                        >
                            {label}
                        </span>
                    </button>
                ))}
            </nav>

            {/* Mobile bottom nav - show main 5 items */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-background/95 backdrop-blur-lg py-2 px-4 md:hidden safe-area-pb">
                {navItems.slice(0, 5).map(({ section, label, icon: Icon, color }) => (
                    <button
                        key={section}
                        onClick={() => onSectionChange(section)}
                        className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all ${activeSection === section ? 'bg-secondary' : ''
                            }`}
                    >
                        <Icon
                            className={`h-5 w-5 ${activeSection === section ? color : 'text-muted-foreground'
                                }`}
                        />
                        <span
                            className={`text-[10px] ${activeSection === section ? 'text-foreground font-medium' : 'text-muted-foreground'
                                }`}
                        >
                            {label}
                        </span>
                    </button>
                ))}
            </nav>

            {/* Mobile slide-out menu */}
            {isOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border p-6 animate-slide-up overflow-y-auto">
                        <div className="flex items-center gap-3 mb-8 mt-8">
                            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold">
                                T
                            </div>
                            <span className="font-semibold">Tracker 2026</span>
                        </div>

                        <div className="space-y-1">
                            {navItems.map(({ section, label, icon: Icon, color }) => (
                                <button
                                    key={section}
                                    onClick={() => {
                                        onSectionChange(section);
                                        setIsOpen(false);
                                    }}
                                    className={`flex w-full items-center gap-3 rounded-lg p-3 transition-all ${activeSection === section
                                        ? 'bg-sidebar-accent'
                                        : 'hover:bg-sidebar-accent/50'
                                        }`}
                                >
                                    <Icon
                                        className={`h-5 w-5 ${activeSection === section ? color : 'text-muted-foreground'
                                            }`}
                                    />
                                    <span
                                        className={
                                            activeSection === section ? 'font-medium' : 'text-muted-foreground'
                                        }
                                    >
                                        {label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}