import { useState } from 'react';
import { DateHeader } from '@/components/DateHeader';
import { Navigation } from '@/components/Navigation';
import { HabitTracker } from '@/components/HabitTracker';
import { DailyTodos } from '@/components/DailyTodos';
import { QuickJournal } from '@/components/QuickJournal';
import { ReadingProgress } from '@/components/ReadingProgress';
import { QuickStats } from '@/components/QuickStats';
import { JournalHistory } from '@/components/JournalHistory';
import { BudgetTracker } from '@/components/BudgetTracker';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { DataExport } from '@/components/DataExport';
import { SelfCareChecklist } from '@/components/SelfCareChecklist';
import { MoodBoard } from '@/components/MoodBoard';

type Section = 'dashboard' | 'habits' | 'journal' | 'calendar' | 'reading' | 'budget' | 'analytics' | 'settings';

const Index = () => {
    const [activeSection, setActiveSection] = useState<Section>('dashboard');

    return (
        <div className="min-h-screen bg-background">
            <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />

            <main className="pb-24 md:pb-8 md:ml-20">
                <div className="container max-w-4xl py-6">
                    <DateHeader />

                    {activeSection === 'dashboard' && (
                        <div className="space-y-6">
                            <QuickStats />

                            <div className="grid gap-6 lg:grid-cols-2">
                                <div className="space-y-6">
                                    <HabitTracker />
                                    <DailyTodos />
                                </div>
                                <div className="space-y-6">
                                    <QuickJournal />
                                    <MoodBoard />
                                    <SelfCareChecklist />
                                    <ReadingProgress />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'habits' && (
                        <div className="space-y-6">
                            <HabitTracker />
                            <AnalyticsDashboard />
                        </div>
                    )}

                    {activeSection === 'journal' && (
                        <div className="space-y-6">
                            <QuickJournal />
                            <JournalHistory />
                        </div>
                    )}

                    {activeSection === 'calendar' && (
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center py-12 text-muted-foreground">
                                <p>Calendar view coming soon...</p>
                            </div>
                        </div>
                    )}

                    {activeSection === 'reading' && (
                        <div className="max-w-2xl mx-auto">
                            <ReadingProgress />
                        </div>
                    )}

                    {activeSection === 'budget' && (
                        <div className="space-y-6">
                            <BudgetTracker />
                        </div>
                    )}

                    {activeSection === 'analytics' && (
                        <div className="space-y-6">
                            <AnalyticsDashboard />
                        </div>
                    )}

                    {activeSection === 'settings' && (
                        <div className="space-y-6 max-w-2xl mx-auto">
                            <DataExport />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Index;