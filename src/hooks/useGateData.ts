import { useState, useEffect, useCallback, useMemo } from 'react';
import { Person, EntryLog, FilterOptions, Stats, RecentPersonsMode } from '@/types';

const STORAGE_KEYS = {
  PERSONS: 'gate-persons',
  LOGS: 'gate-logs',
  SUGGEST_HOURS: 'gate-suggest-hours',
  RECENT_MODE: 'gate-recent-mode',
};

export function useGateData() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [logs, setLogs] = useState<EntryLog[]>([]);
  const [suggestHours, setSuggestHours] = useState<number>(24);
  const [recentPersonsMode, setRecentPersonsMode] = useState<RecentPersonsMode>('recent');
  const [filters, setFilters] = useState<FilterOptions>({ actionType: 'all' });

  // Load data from localStorage
  useEffect(() => {
    const savedPersons = localStorage.getItem(STORAGE_KEYS.PERSONS);
    const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
    const savedHours = localStorage.getItem(STORAGE_KEYS.SUGGEST_HOURS);

    if (savedPersons) {
      setPersons(JSON.parse(savedPersons).map((p: Person) => ({
        ...p,
        createdAt: new Date(p.createdAt),
      })));
    }
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs).map((l: EntryLog) => ({
        ...l,
        timestamp: new Date(l.timestamp),
      })));
    }
    if (savedHours) {
      setSuggestHours(parseInt(savedHours));
    }
    const savedMode = localStorage.getItem(STORAGE_KEYS.RECENT_MODE);
    if (savedMode) {
      setRecentPersonsMode(savedMode as RecentPersonsMode);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PERSONS, JSON.stringify(persons));
  }, [persons]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUGGEST_HOURS, suggestHours.toString());
  }, [suggestHours]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECENT_MODE, recentPersonsMode);
  }, [recentPersonsMode]);

  // Add new person
  const addPerson = useCallback((person: Omit<Person, 'id' | 'createdAt'>) => {
    const newPerson: Person = {
      ...person,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setPersons(prev => [...prev, newPerson]);
    return newPerson;
  }, []);

  // Update person
  const updatePerson = useCallback((id: string, updates: Partial<Person>) => {
    setPersons(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  // Delete person
  const deletePerson = useCallback((id: string) => {
    setPersons(prev => prev.filter(p => p.id !== id));
  }, []);

  // Add log entry
  const addLog = useCallback((log: Omit<EntryLog, 'id' | 'timestamp'>) => {
    const newLog: EntryLog = {
      ...log,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setLogs(prev => [newLog, ...prev]);
    return newLog;
  }, []);

  // Update log entry
  const updateLog = useCallback((id: string, updates: Partial<EntryLog>) => {
    setLogs(prev => prev.map(log => log.id === id ? { ...log, ...updates } : log));
  }, []);

  // Delete log entry
  const deleteLog = useCallback((id: string) => {
    setLogs(prev => prev.filter(log => log.id !== id));
  }, []);

  // Get recent persons (for auto-suggest) - limited to 5
  const recentPersons = useMemo(() => {
    const cutoffTime = new Date(Date.now() - suggestHours * 60 * 60 * 1000);
    const recentLogs = logs.filter(log => log.timestamp >= cutoffTime);
    
    if (recentPersonsMode === 'frequent') {
      // Most frequent in the time window
      const personFrequency = new Map<string, number>();
      recentLogs.forEach(log => {
        personFrequency.set(log.personId, (personFrequency.get(log.personId) || 0) + 1);
      });
      
      return persons
        .filter(p => personFrequency.has(p.id))
        .sort((a, b) => (personFrequency.get(b.id) || 0) - (personFrequency.get(a.id) || 0))
        .slice(0, 5);
    } else {
      // Most recent (last 5 unique persons)
      const seenPersonIds = new Set<string>();
      const recentPersonIds: string[] = [];
      
      for (const log of recentLogs) {
        if (!seenPersonIds.has(log.personId)) {
          seenPersonIds.add(log.personId);
          recentPersonIds.push(log.personId);
          if (recentPersonIds.length >= 5) break;
        }
      }
      
      return recentPersonIds
        .map(id => persons.find(p => p.id === id))
        .filter((p): p is Person => p !== undefined);
    }
  }, [persons, logs, suggestHours, recentPersonsMode]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (filters.dateFrom && log.timestamp < filters.dateFrom) return false;
      if (filters.dateTo && log.timestamp > filters.dateTo) return false;
      if (filters.personId && log.personId !== filters.personId) return false;
      if (filters.personName && !log.personName.toLowerCase().includes(filters.personName.toLowerCase())) return false;
      if (filters.idNumber && !log.idNumber.includes(filters.idNumber)) return false;
      if (filters.vehicleNumber && !log.vehicleNumber?.toLowerCase().includes(filters.vehicleNumber.toLowerCase())) return false;
      if (filters.actionType && filters.actionType !== 'all' && log.actionType !== filters.actionType) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          log.personName.toLowerCase().includes(query) ||
          log.idNumber.includes(query) ||
          log.vehicleNumber?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [logs, filters]);

  // Calculate stats
  const stats = useMemo((): Stats => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLogs = logs.filter(log => log.timestamp >= today);
    const entries = logs.filter(l => l.actionType === 'entry').length;
    const exits = logs.filter(l => l.actionType === 'exit').length;
    const todayEntries = todayLogs.filter(l => l.actionType === 'entry').length;
    const todayExits = todayLogs.filter(l => l.actionType === 'exit').length;
    
    // Calculate currently inside (simplified - just today's entries minus exits)
    const personEntryCount = new Map<string, number>();
    logs.forEach(log => {
      const current = personEntryCount.get(log.personId) || 0;
      personEntryCount.set(
        log.personId,
        current + (log.actionType === 'entry' ? 1 : -1)
      );
    });
    const currentlyInside = Array.from(personEntryCount.values()).filter(v => v > 0).length;

    return {
      totalEntries: entries,
      totalExits: exits,
      uniqueVisitors: new Set(logs.map(l => l.personId)).size,
      todayEntries,
      todayExits,
      currentlyInside: Math.max(0, currentlyInside),
    };
  }, [logs]);

  // Export logs to CSV
  const exportToCSV = useCallback((logsToExport: EntryLog[]) => {
    const headers = ['תאריך', 'שעה', 'שם', 'ת"ז', 'תפקיד', 'מספר רכב', 'פעולה', 'הערה'];
    const rows = logsToExport.map(log => [
      log.timestamp.toLocaleDateString('he-IL'),
      log.timestamp.toLocaleTimeString('he-IL'),
      log.personName,
      log.idNumber,
      log.role,
      log.vehicleNumber || '',
      log.actionType === 'entry' ? 'כניסה' : 'יציאה',
      log.note || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `gate-log-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, []);

  return {
    persons,
    logs,
    filteredLogs,
    recentPersons,
    stats,
    suggestHours,
    recentPersonsMode,
    filters,
    addPerson,
    updatePerson,
    deletePerson,
    addLog,
    updateLog,
    deleteLog,
    setFilters,
    setSuggestHours,
    setRecentPersonsMode,
    exportToCSV,
  };
}
