import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { QuickEntry } from '@/components/entry/QuickEntry';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { useGateData } from '@/hooks/useGateData';

const Index = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    persons,
    recentPersons,
    suggestHours,
    addPerson,
    addLog,
    setSuggestHours,
  } = useGateData();

  return (
    <div className="min-h-screen bg-background">
      <Header onSettingsClick={() => setSettingsOpen(true)} />

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <QuickEntry
          persons={persons}
          recentPersons={recentPersons}
          onAddLog={addLog}
          onAddPerson={addPerson}
        />
      </main>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        suggestHours={suggestHours}
        onSuggestHoursChange={setSuggestHours}
      />
    </div>
  );
};

export default Index;
