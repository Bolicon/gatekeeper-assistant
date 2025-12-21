import { Header } from '@/components/layout/Header';
import { ActivityLog } from '@/components/ActivityLog';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { useGateData } from '@/hooks/useGateData';
import { useState } from 'react';

const LogsPage = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    persons,
    filteredLogs,
    suggestHours,
    filters,
    setFilters,
    setSuggestHours,
    exportToCSV,
  } = useGateData();

  return (
    <div className="min-h-screen bg-background">
      <Header onSettingsClick={() => setSettingsOpen(true)} />

      <main className="container mx-auto px-4 py-6">
        <ActivityLog
          logs={filteredLogs}
          persons={persons}
          filters={filters}
          onFilterChange={setFilters}
          onExport={exportToCSV}
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

export default LogsPage;
