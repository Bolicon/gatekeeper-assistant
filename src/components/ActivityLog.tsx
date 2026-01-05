import { useState } from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { LogIn, LogOut, Download, Filter, Search, X, Calendar, FileText, TrendingUp, Pencil, Trash2, Check, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { EntryLog, FilterOptions, Person } from '@/types';
import { toast } from 'sonner';

interface ActivityLogProps {
  logs: EntryLog[];
  persons: Person[];
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onExport: (logs: EntryLog[]) => void;
  onUpdateLog?: (id: string, updates: Partial<EntryLog>) => Promise<void>;
  onDeleteLog?: (id: string) => Promise<void>;
}

export function ActivityLog({ logs, filters, onFilterChange, onExport, onUpdateLog, onDeleteLog }: ActivityLogProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [editingLog, setEditingLog] = useState<EntryLog | null>(null);
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editIdNumber, setEditIdNumber] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editVehicle, setEditVehicle] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editActionType, setEditActionType] = useState<'entry' | 'exit'>('entry');

  const handleClearFilters = () => {
    onFilterChange({ actionType: 'all' });
  };

  const handleEditClick = (log: EntryLog) => {
    setEditingLog(log);
    setEditName(log.personName);
    setEditIdNumber(log.idNumber);
    setEditRole(log.role || '');
    setEditVehicle(log.vehicleNumber || '');
    setEditNote(log.note || '');
    setEditActionType(log.actionType);
  };

  const handleSaveEdit = async () => {
    if (!editingLog || !onUpdateLog) return;
    
    if (!editName.trim() || !editIdNumber.trim() || !editVehicle.trim()) {
      toast.error('נא למלא שם, ת"ז/מ.א ומספר רכב');
      return;
    }

    try {
      await onUpdateLog(editingLog.id, {
        personName: editName,
        idNumber: editIdNumber,
        role: editRole || undefined,
        vehicleNumber: editVehicle,
        note: editNote || undefined,
        actionType: editActionType,
      });

      toast.success('הרשומה עודכנה בהצלחה');
      setEditingLog(null);
    } catch (error) {
      console.error('Error updating log:', error);
      toast.error('שגיאה בעדכון הרשומה');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteLogId || !onDeleteLog) return;
    try {
      await onDeleteLog(deleteLogId);
      toast.success('הרשומה נמחקה');
      setDeleteLogId(null);
    } catch (error) {
      console.error('Error deleting log:', error);
      toast.error('שגיאה במחיקת הרשומה');
    }
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
    <>
      <div className="gradient-card rounded-2xl sm:rounded-3xl border border-border/40 shadow-lg overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border/40">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="gradient-primary p-2 sm:p-2.5 rounded-xl">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">יומן פעילות</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {todayCount} היום • {logs.length} סה״כ
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={showFilters ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`rounded-xl h-9 w-9 sm:h-10 sm:w-10 ${showFilters ? '' : 'border-2 border-border/60 hover:border-primary/50'}`}
                >
                  <Filter className="h-4 w-4" />
                </Button>

                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => onExport(logs)}
                  className="rounded-xl h-9 w-9 sm:h-10 sm:w-10 border-2 border-border/60 hover:border-accent hover:bg-accent/5"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative input-focus-ring rounded-xl">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש..."
                value={filters.searchQuery || ''}
                onChange={e => onFilterChange({ ...filters, searchQuery: e.target.value })}
                className="pr-10 h-10 sm:h-11 rounded-xl border-2 border-border/60 focus:border-primary bg-background/50"
              />
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border/40 animate-slide-up">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">מתאריך</label>
                  <Input
                    type="date"
                    value={filters.dateFrom ? format(filters.dateFrom, 'yyyy-MM-dd') : ''}
                    onChange={e =>
                      onFilterChange({
                        ...filters,
                        dateFrom: e.target.value ? new Date(e.target.value) : undefined,
                      })
                    }
                    className="h-9 sm:h-10 text-sm rounded-xl border-2 border-border/60 focus:border-primary bg-background/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">עד תאריך</label>
                  <Input
                    type="date"
                    value={filters.dateTo ? format(filters.dateTo, 'yyyy-MM-dd') : ''}
                    onChange={e =>
                      onFilterChange({
                        ...filters,
                        dateTo: e.target.value ? new Date(e.target.value) : undefined,
                      })
                    }
                    className="h-9 sm:h-10 text-sm rounded-xl border-2 border-border/60 focus:border-primary bg-background/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">סוג פעולה</label>
                  <select
                    value={filters.actionType || 'all'}
                    onChange={e =>
                      onFilterChange({
                        ...filters,
                        actionType: e.target.value as 'entry' | 'exit' | 'all',
                      })
                    }
                    className="flex h-9 sm:h-10 w-full rounded-xl border-2 border-border/60 bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus:border-primary"
                  >
                    <option value="all">הכל</option>
                    <option value="entry">כניסה</option>
                    <option value="exit">יציאה</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">שם</label>
                  <Input
                    value={filters.personName || ''}
                    onChange={e => onFilterChange({ ...filters, personName: e.target.value })}
                    className="h-9 sm:h-10 text-sm rounded-xl border-2 border-border/60 focus:border-primary bg-background/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">ת"ז / מ.א</label>
                  <Input
                    value={filters.idNumber || ''}
                    onChange={e => onFilterChange({ ...filters, idNumber: e.target.value })}
                    className="h-9 sm:h-10 text-sm rounded-xl border-2 border-border/60 focus:border-primary bg-background/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">מספר רכב</label>
                  <Input
                    value={filters.vehicleNumber || ''}
                    onChange={e => onFilterChange({ ...filters, vehicleNumber: e.target.value })}
                    className="h-9 sm:h-10 text-sm rounded-xl border-2 border-border/60 focus:border-primary bg-background/50"
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

        {/* Mobile Cards View */}
        <div className="block sm:hidden">
          {logs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="bg-muted/50 p-4 rounded-2xl">
                  <Calendar className="h-10 w-10 opacity-50" />
                </div>
                <p className="text-lg font-medium">אין רשומות להצגה</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-muted/10 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-foreground">{log.personName}</span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                            log.actionType === 'entry'
                              ? 'bg-success/15 text-success'
                              : 'bg-warning/15 text-warning'
                          }`}
                        >
                          {log.actionType === 'entry' ? (
                            <><LogIn className="h-3 w-3" /> כניסה</>
                          ) : (
                            <><LogOut className="h-3 w-3" /> יציאה</>
                          )}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-0.5">
                        <p>{format(log.timestamp, 'dd/MM/yyyy HH:mm', { locale: he })}</p>
                        <p>ת"ז: {log.idNumber}</p>
                        <p>רכב: {log.vehicleNumber || '-'}</p>
                        {log.role && <p>תפקיד: {log.role}</p>}
                        {log.note && <p className="text-xs">הערה: {log.note}</p>}
                      </div>
                    </div>
                    {(onUpdateLog || onDeleteLog) && (
                      <div className="flex gap-1">
                        {onUpdateLog && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleEditClick(log)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {onDeleteLog && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteLogId(log.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">תאריך ושעה</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">שם</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">ת"ז / מ.א</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground hidden md:table-cell">תפקיד</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground hidden lg:table-cell">רכב</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">פעולה</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground hidden xl:table-cell">הערות</th>
                {(onUpdateLog || onDeleteLog) && (
                  <th className="text-right p-4 text-sm font-semibold text-muted-foreground w-24">פעולות</th>
                )}
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
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
                logs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="border-t border-border/30 hover:bg-muted/20 transition-colors"
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
                    <td className="p-4 text-muted-foreground font-mono text-sm">{log.idNumber}</td>
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
                          <><LogIn className="h-3.5 w-3.5" /> כניסה</>
                        ) : (
                          <><LogOut className="h-3.5 w-3.5" /> יציאה</>
                        )}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground hidden xl:table-cell max-w-[200px] truncate">
                      {log.note || '-'}
                    </td>
                    {(onUpdateLog || onDeleteLog) && (
                      <td className="p-4">
                        <div className="flex gap-1">
                          {onUpdateLog && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                              onClick={() => handleEditClick(log)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {onDeleteLog && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteLogId(log.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-border/40 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
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

      {/* Edit Dialog */}
      <Dialog open={!!editingLog} onOpenChange={(open) => !open && setEditingLog(null)}>
        <DialogContent className="sm:max-w-md mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle>עריכת רשומה</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>שם מלא *</Label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>ת"ז / מ.א *</Label>
              <Input value={editIdNumber} onChange={e => setEditIdNumber(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>תפקיד</Label>
              <Input value={editRole} onChange={e => setEditRole(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>מספר רכב *</Label>
              <div className="relative">
                <Car className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={editVehicle} onChange={e => setEditVehicle(e.target.value)} className="pr-10 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>סוג פעולה</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={editActionType === 'entry' ? 'default' : 'outline'}
                  className={`flex-1 rounded-xl ${editActionType === 'entry' ? 'bg-success hover:bg-success/90' : ''}`}
                  onClick={() => setEditActionType('entry')}
                >
                  <LogIn className="h-4 w-4 ml-1" />
                  כניסה
                </Button>
                <Button
                  type="button"
                  variant={editActionType === 'exit' ? 'default' : 'outline'}
                  className={`flex-1 rounded-xl ${editActionType === 'exit' ? 'bg-warning hover:bg-warning/90' : ''}`}
                  onClick={() => setEditActionType('exit')}
                >
                  <LogOut className="h-4 w-4 ml-1" />
                  יציאה
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>הערות נוספות</Label>
              <Textarea value={editNote} onChange={e => setEditNote(e.target.value)} className="rounded-xl resize-none" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingLog(null)} className="rounded-xl">
              ביטול
            </Button>
            <Button onClick={handleSaveEdit} className="rounded-xl">
              <Check className="h-4 w-4 ml-1" />
              שמור
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteLogId} onOpenChange={(open) => !open && setDeleteLogId(null)}>
        <AlertDialogContent className="mx-4 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת רשומה</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק רשומה זו? פעולה זו לא ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90 rounded-xl">
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
