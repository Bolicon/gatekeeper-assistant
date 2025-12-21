import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { StatsCards } from '@/components/stats/StatsCards';
import { EntryForm } from '@/components/entry/EntryForm';
import { LogsTable } from '@/components/logs/LogsTable';
import { PersonsManager } from '@/components/persons/PersonsManager';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { useGateData } from '@/hooks/useGateData';

const Index = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    persons,
    filteredLogs,
    recentPersons,
    stats,
    suggestHours,
    filters,
    addPerson,
    updatePerson,
    deletePerson,
    addLog,
    setFilters,
    setSuggestHours,
    exportToCSV,
  } = useGateData();

  return (
    <div className="min-h-screen bg-background">
      <Header onSettingsClick={() => setSettingsOpen(true)} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Entry Form */}
          <div className="lg:col-span-2">
            <EntryForm
              persons={persons}
              recentPersons={recentPersons}
              onAddLog={addLog}
              onAddPerson={addPerson}
            />
          </div>

          {/* Persons Manager */}
          <div className="lg:col-span-1">
            <PersonsManager
              persons={persons}
              onAdd={addPerson}
              onUpdate={updatePerson}
              onDelete={deletePerson}
            />
          </div>
        </div>

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
