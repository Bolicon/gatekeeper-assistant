import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { QuickEntry } from '@/components/entry/QuickEntry';
import { LogsTable } from '@/components/logs/LogsTable.tsx';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { useGateData } from '@/hooks/useGateData';

const Index = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    persons,
    filteredLogs,
    recentPersons,
    suggestHours,
    filters,
    addPerson,
    addLog,
    setFilters,
    setSuggestHours,
    exportToCSV,
  } = useGateData();

  return (
    <div className="min-h-screen bg-background">
      <Header onSettingsClick={() => setSettingsOpen(true)} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Entry */}
        <QuickEntry
          persons={persons}
          recentPersons={recentPersons}
          onAddLog={addLog}
          onAddPerson={addPerson}
        />

        {/* Logs Table */}
        <LogsTable
          logs={filteredLogs}
          persons={persons}
          filters={filters}
          onFilterChange={setFilters}
          onExport={exportToCSV}
        />
      </main>

      {/* Settings Dialog */}
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
