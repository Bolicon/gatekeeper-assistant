import { useState, useEffect, useCallback, useMemo } from 'react';
import { Person, EntryLog, FilterOptions, Stats, RecentPersonsMode } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEYS = {
  SUGGEST_HOURS: 'gate-suggest-hours',
  RECENT_MODE: 'gate-recent-mode',
};

export function useGateData() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [logs, setLogs] = useState<EntryLog[]>([]);
  const [suggestHours, setSuggestHours] = useState<number>(24);
  const [recentPersonsMode, setRecentPersonsMode] = useState<RecentPersonsMode>('recent');
  const [filters, setFilters] = useState<FilterOptions>({ actionType: 'all' });
  const [isLoading, setIsLoading] = useState(true);

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Load persons
      const { data: personsData } = await supabase
        .from('persons')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (personsData) {
        setPersons(personsData.map(p => ({
          id: p.id,
          name: p.name,
          idNumber: p.id_number,
          role: p.role || '',
          vehicleNumber: p.vehicle_number || undefined,
          createdAt: new Date(p.created_at),
        })));
      }

      // Load logs
      const { data: logsData } = await supabase
        .from('entry_logs')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (logsData) {
        setLogs(logsData.map(l => ({
          id: l.id,
          personId: l.person_id || '',
          personName: l.person_name,
          idNumber: l.id_number,
          role: l.role || '',
          vehicleNumber: l.vehicle_number || undefined,
          actionType: l.action_type as 'entry' | 'exit',
          timestamp: new Date(l.timestamp),
          note: l.note || undefined,
        })));
      }

      // Load local settings
      const savedHours = localStorage.getItem(STORAGE_KEYS.SUGGEST_HOURS);
      if (savedHours) {
        setSuggestHours(parseInt(savedHours));
      }
      const savedMode = localStorage.getItem(STORAGE_KEYS.RECENT_MODE);
      if (savedMode) {
        setRecentPersonsMode(savedMode as RecentPersonsMode);
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  // Save local settings to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUGGEST_HOURS, suggestHours.toString());
  }, [suggestHours]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECENT_MODE, recentPersonsMode);
  }, [recentPersonsMode]);

  // Add new person
  const addPerson = useCallback(async (person: Omit<Person, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('persons')
      .insert({
        name: person.name,
        id_number: person.idNumber,
        role: person.role || null,
        vehicle_number: person.vehicleNumber || null,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error adding person:', error);
      throw error;
    }

    const newPerson: Person = {
      id: data.id,
      name: data.name,
      idNumber: data.id_number,
      role: data.role || '',
      vehicleNumber: data.vehicle_number || undefined,
      createdAt: new Date(data.created_at),
    };

    setPersons(prev => [newPerson, ...prev]);
    return newPerson;
  }, []);

  // Update person
  const updatePerson = useCallback(async (id: string, updates: Partial<Person>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.idNumber !== undefined) dbUpdates.id_number = updates.idNumber;
    if (updates.role !== undefined) dbUpdates.role = updates.role || null;
    if (updates.vehicleNumber !== undefined) dbUpdates.vehicle_number = updates.vehicleNumber || null;

    const { error } = await supabase
      .from('persons')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating person:', error);
      throw error;
    }

    setPersons(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  // Delete person
  const deletePerson = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('persons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting person:', error);
      throw error;
    }

    setPersons(prev => prev.filter(p => p.id !== id));
  }, []);

  // Add log entry
  const addLog = useCallback(async (log: Omit<EntryLog, 'id' | 'timestamp'>) => {
    const { data, error } = await supabase
      .from('entry_logs')
      .insert({
        person_id: log.personId || null,
        person_name: log.personName,
        id_number: log.idNumber,
        role: log.role || null,
        vehicle_number: log.vehicleNumber || null,
        action_type: log.actionType,
        note: log.note || null,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error adding log:', error);
      throw error;
    }

    const newLog: EntryLog = {
      id: data.id,
      personId: data.person_id || '',
      personName: data.person_name,
      idNumber: data.id_number,
      role: data.role || '',
      vehicleNumber: data.vehicle_number || undefined,
      actionType: data.action_type as 'entry' | 'exit',
      timestamp: new Date(data.timestamp),
      note: data.note || undefined,
    };

    setLogs(prev => [newLog, ...prev]);
    return newLog;
  }, []);

  // Update log entry
  const updateLog = useCallback(async (id: string, updates: Partial<EntryLog>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.personName !== undefined) dbUpdates.person_name = updates.personName;
    if (updates.idNumber !== undefined) dbUpdates.id_number = updates.idNumber;
    if (updates.role !== undefined) dbUpdates.role = updates.role || null;
    if (updates.vehicleNumber !== undefined) dbUpdates.vehicle_number = updates.vehicleNumber || null;
    if (updates.actionType !== undefined) dbUpdates.action_type = updates.actionType;
    if (updates.note !== undefined) dbUpdates.note = updates.note || null;

    const { error } = await supabase
      .from('entry_logs')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating log:', error);
      throw error;
    }

    setLogs(prev => prev.map(log => log.id === id ? { ...log, ...updates } : log));
  }, []);

  // Delete log entry
  const deleteLog = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('entry_logs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting log:', error);
      throw error;
    }

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
    isLoading,
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
