import { useState } from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { LogIn, LogOut, Download, Filter, Search, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EntryLog, FilterOptions, Person } from '@/types';

interface ActivityLogProps {
  logs: EntryLog[];
  persons: Person[];
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onExport: (logs: EntryLog[]) => void;
}

export function ActivityLog({ logs, filters, onFilterChange, onExport }: ActivityLogProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleClearFilters = () => {
    onFilterChange({ actionType: 'all' });
  };

  const hasActiveFilters =
    filters.dateFrom ||
    filters.dateTo ||
    filters.personId ||
    filters.vehicleNumber ||
    filters.searchQuery ||
    filters.idNumber ||
    filters.personName ||
    (filters.actionType && filters.actionType !== 'all');

  return (
    <div className="gradient-card rounded-2xl border border-border/50 shadow-lg overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-border/50">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <h2 className="text-lg font-semibold text-foreground">יומן פעילות</h2>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש..."
                value={filters.searchQuery || ''}
                onChange={e => onFilterChange({ ...filters, searchQuery: e.target.value })}
                className="pr-10"
              />
            </div>

            <Button
              variant={showFilters ? 'secondary' : 'outline'}
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="icon" onClick={() => onExport(logs)}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border/50 animate-slide-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">מתאריך</label>
                <Input
                  type="date"
                  value={filters.dateFrom ? format(filters.dateFrom, 'yyyy-MM-dd') : ''}
                  onChange={e =>
                    onFilterChange({
                      ...filters,
                      dateFrom: e.target.value ? new Date(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">עד תאריך</label>
                <Input
                  type="date"
                  value={filters.dateTo ? format(filters.dateTo, 'yyyy-MM-dd') : ''}
                  onChange={e =>
                    onFilterChange({
                      ...filters,
                      dateTo: e.target.value ? new Date(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">סוג פעולה</label>
                <select
                  value={filters.actionType || 'all'}
                  onChange={e =>
                    onFilterChange({
                      ...filters,
                      actionType: e.target.value as 'entry' | 'exit' | 'all',
                    })
                  }
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="all">הכל</option>
                  <option value="entry">כניסה</option>
                  <option value="exit">יציאה</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">שם</label>
                <Input
                  value={filters.personName || ''}
                  onChange={e => onFilterChange({ ...filters, personName: e.target.value })}
                  placeholder="שם מלא"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">ת"ז / מ.א</label>
                <Input
                  value={filters.idNumber || ''}
                  onChange={e => onFilterChange({ ...filters, idNumber: e.target.value })}
                  placeholder="123456789"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">מספר רכב</label>
                <Input
                  value={filters.vehicleNumber || ''}
                  onChange={e => onFilterChange({ ...filters, vehicleNumber: e.target.value })}
                  placeholder="12-345-67"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="mt-4 text-muted-foreground"
              >
                <X className="h-4 w-4 ml-1" />
                נקה סינון
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-right p-3 text-sm font-medium text-muted-foreground">תאריך ושעה</th>
              <th className="text-right p-3 text-sm font-medium text-muted-foreground">שם</th>
              <th className="text-right p-3 text-sm font-medium text-muted-foreground hidden sm:table-cell">ת"ז / מ.א</th>
              <th className="text-right p-3 text-sm font-medium text-muted-foreground hidden md:table-cell">תפקיד</th>
              <th className="text-right p-3 text-sm font-medium text-muted-foreground hidden lg:table-cell">רכב</th>
              <th className="text-right p-3 text-sm font-medium text-muted-foreground">פעולה</th>
              <th className="text-right p-3 text-sm font-medium text-muted-foreground hidden xl:table-cell">הערה</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>אין רשומות להצגה</p>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="text-sm text-foreground">
                      {format(log.timestamp, 'dd/MM/yyyy', { locale: he })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(log.timestamp, 'HH:mm', { locale: he })}
                    </div>
                  </td>
                  <td className="p-3 font-medium text-foreground">{log.personName}</td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{log.idNumber}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{log.role}</td>
                  <td className="p-3 text-muted-foreground hidden lg:table-cell">{log.vehicleNumber || '-'}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        log.actionType === 'entry'
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {log.actionType === 'entry' ? (
                        <>
                          <LogIn className="h-3 w-3" />
                          כניסה
                        </>
                      ) : (
                        <>
                          <LogOut className="h-3 w-3" />
                          יציאה
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground hidden xl:table-cell max-w-[200px] truncate">
                    {log.note || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-border/50 bg-muted/30">
        <p className="text-sm text-muted-foreground">
          סה"כ {logs.length} רשומות
          {hasActiveFilters && ' (מסונן)'}
        </p>
      </div>
    </div>
  );
}
