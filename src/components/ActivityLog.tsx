import { useState } from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { LogIn, LogOut, Download, Filter, Search, X, Calendar, FileText, TrendingUp } from 'lucide-react';
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

  const todayCount = logs.filter(log => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return log.timestamp >= today;
  }).length;

  return (
    <div className="gradient-card rounded-3xl border border-border/40 shadow-lg overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="p-6 border-b border-border/40">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="gradient-primary p-2.5 rounded-xl">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">יומן פעילות</h2>
              <p className="text-sm text-muted-foreground">
                {todayCount} פעולות היום • {logs.length} סה״כ
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-72 input-focus-ring rounded-xl">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש..."
                value={filters.searchQuery || ''}
                onChange={e => onFilterChange({ ...filters, searchQuery: e.target.value })}
                className="pr-10 rounded-xl border-2 border-border/60 focus:border-primary bg-background/50"
              />
            </div>

            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={`rounded-xl border-2 ${showFilters ? '' : 'border-border/60 hover:border-primary/50'}`}
            >
              <Filter className="h-4 w-4" />
            </Button>

            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => onExport(logs)}
              className="rounded-xl border-2 border-border/60 hover:border-accent hover:bg-accent/5"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border/40 animate-slide-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">מתאריך</label>
                <Input
                  type="date"
                  value={filters.dateFrom ? format(filters.dateFrom, 'yyyy-MM-dd') : ''}
                  onChange={e =>
                    onFilterChange({
                      ...filters,
                      dateFrom: e.target.value ? new Date(e.target.value) : undefined,
                    })
                  }
                  className="rounded-xl border-2 border-border/60 focus:border-primary bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">עד תאריך</label>
                <Input
                  type="date"
                  value={filters.dateTo ? format(filters.dateTo, 'yyyy-MM-dd') : ''}
                  onChange={e =>
                    onFilterChange({
                      ...filters,
                      dateTo: e.target.value ? new Date(e.target.value) : undefined,
                    })
                  }
                  className="rounded-xl border-2 border-border/60 focus:border-primary bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">סוג פעולה</label>
                <select
                  value={filters.actionType || 'all'}
                  onChange={e =>
                    onFilterChange({
                      ...filters,
                      actionType: e.target.value as 'entry' | 'exit' | 'all',
                    })
                  }
                  className="flex h-10 w-full rounded-xl border-2 border-border/60 bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus:border-primary"
                >
                  <option value="all">הכל</option>
                  <option value="entry">כניסה</option>
                  <option value="exit">יציאה</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">שם</label>
                <Input
                  value={filters.personName || ''}
                  onChange={e => onFilterChange({ ...filters, personName: e.target.value })}
                  className="rounded-xl border-2 border-border/60 focus:border-primary bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">ת"ז / מ.א</label>
                <Input
                  value={filters.idNumber || ''}
                  onChange={e => onFilterChange({ ...filters, idNumber: e.target.value })}
                  className="rounded-xl border-2 border-border/60 focus:border-primary bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">מספר רכב</label>
                <Input
                  value={filters.vehicleNumber || ''}
                  onChange={e => onFilterChange({ ...filters, vehicleNumber: e.target.value })}
                  className="rounded-xl border-2 border-border/60 focus:border-primary bg-background/50"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="mt-4 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4 ml-1" />
                נקה סינון
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-right p-4 text-sm font-semibold text-muted-foreground">תאריך ושעה</th>
              <th className="text-right p-4 text-sm font-semibold text-muted-foreground">שם</th>
              <th className="text-right p-4 text-sm font-semibold text-muted-foreground hidden sm:table-cell">ת"ז / מ.א</th>
              <th className="text-right p-4 text-sm font-semibold text-muted-foreground hidden md:table-cell">תפקיד</th>
              <th className="text-right p-4 text-sm font-semibold text-muted-foreground hidden lg:table-cell">רכב</th>
              <th className="text-right p-4 text-sm font-semibold text-muted-foreground">פעולה</th>
              <th className="text-right p-4 text-sm font-semibold text-muted-foreground hidden xl:table-cell">הערות</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <div className="bg-muted/50 p-4 rounded-2xl">
                      <Calendar className="h-10 w-10 opacity-50" />
                    </div>
                    <p className="text-lg font-medium">אין רשומות להצגה</p>
                    <p className="text-sm">התחל לרשום כניסות ויציאות</p>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log, index) => (
                <tr 
                  key={log.id} 
                  className={`border-t border-border/30 hover:bg-muted/20 transition-colors stagger-${Math.min(index + 1, 5)} animate-fade-in`}
                >
                  <td className="p-4">
                    <div className="text-sm font-medium text-foreground">
                      {format(log.timestamp, 'dd/MM/yyyy', { locale: he })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(log.timestamp, 'HH:mm', { locale: he })}
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-foreground">{log.personName}</td>
                  <td className="p-4 text-muted-foreground hidden sm:table-cell font-mono text-sm">{log.idNumber}</td>
                  <td className="p-4 text-muted-foreground hidden md:table-cell">{log.role || '-'}</td>
                  <td className="p-4 text-muted-foreground hidden lg:table-cell font-mono text-sm">{log.vehicleNumber || '-'}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        log.actionType === 'entry'
                          ? 'bg-success/15 text-success border border-success/30'
                          : 'bg-warning/15 text-warning border border-warning/30'
                      }`}
                    >
                      {log.actionType === 'entry' ? (
                        <>
                          <LogIn className="h-3.5 w-3.5" />
                          כניסה
                        </>
                      ) : (
                        <>
                          <LogOut className="h-3.5 w-3.5" />
                          יציאה
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground hidden xl:table-cell max-w-[200px] truncate">
                    {log.note || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/40 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>סה"כ {logs.length} רשומות</span>
            {hasActiveFilters && (
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                מסונן
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
