import { useState, useMemo } from 'react';
import { LogIn, LogOut, User, Car, FileText, Search, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Person, EntryLog } from '@/types';
import { toast } from 'sonner';

interface QuickEntryProps {
  persons: Person[];
  onAddLog: (log: Omit<EntryLog, 'id' | 'timestamp'>) => void;
  onAddPerson: (person: Omit<Person, 'id' | 'createdAt'>) => Person;
}

export function QuickEntry({ persons, onAddLog, onAddPerson }: QuickEntryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isNewPerson, setIsNewPerson] = useState(false);
  
  // New person form
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [role, setRole] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [note, setNote] = useState('');

  // Filter suggestions based on search
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return persons
      .filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.idNumber.includes(query) ||
          p.vehicleNumber?.toLowerCase().includes(query)
      )
      .slice(0, 6);
  }, [searchQuery, persons]);

  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person);
    setSearchQuery('');
    setIsNewPerson(false);
  };

  const handleNewPerson = () => {
    setIsNewPerson(true);
    setSelectedPerson(null);
    // Pre-fill with search query if it looks like a name
    if (searchQuery && !/^\d+$/.test(searchQuery)) {
      setName(searchQuery);
    }
    setSearchQuery('');
  };

  const handleClear = () => {
    setSelectedPerson(null);
    setIsNewPerson(false);
    setName('');
    setIdNumber('');
    setRole('');
    setVehicleNumber('');
    setNote('');
    setSearchQuery('');
  };

  const handleSubmit = (actionType: 'entry' | 'exit') => {
    if (selectedPerson) {
      // Existing person
      onAddLog({
        personId: selectedPerson.id,
        personName: selectedPerson.name,
        idNumber: selectedPerson.idNumber,
        role: selectedPerson.role,
        vehicleNumber: selectedPerson.vehicleNumber,
        actionType,
        note: note || undefined,
      });
      toast.success(actionType === 'entry' ? 'כניסה נרשמה' : 'יציאה נרשמה');
    } else if (isNewPerson) {
      // New person
      if (!name.trim() || !idNumber.trim() || !role.trim()) {
        toast.error('נא למלא שם, ת"ז ותפקיד');
        return;
      }

      // Check if person already exists by ID
      const existing = persons.find(p => p.idNumber === idNumber);
      if (existing) {
        toast.error('אדם עם ת"ז זו כבר קיים במערכת');
        return;
      }

      // Create new person
      const newPerson = onAddPerson({
        name,
        idNumber,
        role,
        vehicleNumber: vehicleNumber || undefined,
      });

      // Add log
      onAddLog({
        personId: newPerson.id,
        personName: name,
        idNumber,
        role,
        vehicleNumber: vehicleNumber || undefined,
        actionType,
        note: note || undefined,
      });

      toast.success(`${actionType === 'entry' ? 'כניסה' : 'יציאה'} נרשמה - אדם חדש נוסף למערכת`);
    }

    handleClear();
  };

  const showSuggestions = searchQuery.trim() && !selectedPerson && !isNewPerson;

  return (
    <div className="gradient-card rounded-2xl p-6 border border-border/50 shadow-lg animate-fade-in">
      <h2 className="text-lg font-semibold mb-4 text-foreground">רישום כניסה / יציאה</h2>

      {/* Search Mode */}
      {!selectedPerson && !isNewPerson && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="חפש לפי שם, ת״ז או מספר רכב..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pr-11 h-12 text-base"
              autoFocus
            />
          </div>

          {/* Suggestions */}
          {showSuggestions && (
            <div className="space-y-2 animate-fade-in">
              {suggestions.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">נמצאו {suggestions.length} תוצאות:</p>
                  <div className="grid gap-2">
                    {suggestions.map(person => (
                      <button
                        key={person.id}
                        onClick={() => handleSelectPerson(person)}
                        className="flex items-center gap-3 p-3 bg-muted/50 hover:bg-muted rounded-xl transition-colors text-right w-full"
                      >
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{person.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {person.idNumber} • {person.role}
                            {person.vehicleNumber && ` • ${person.vehicleNumber}`}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>לא נמצאו תוצאות</p>
                </div>
              )}

              {/* Add New Person Button */}
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={handleNewPerson}
              >
                <Plus className="h-4 w-4" />
                הוסף אדם חדש
              </Button>
            </div>
          )}

          {!searchQuery && (
            <p className="text-center text-muted-foreground py-8">
              הקלד שם, ת"ז או מספר רכב לחיפוש
            </p>
          )}
        </div>
      )}

      {/* Selected Person Mode */}
      {selectedPerson && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="bg-primary/10 p-3 rounded-lg">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-lg text-foreground">{selectedPerson.name}</p>
              <p className="text-muted-foreground">
                {selectedPerson.idNumber} • {selectedPerson.role}
                {selectedPerson.vehicleNumber && (
                  <span className="flex items-center gap-1 mt-1">
                    <Car className="h-3 w-3" />
                    {selectedPerson.vehicleNumber}
                  </span>
                )}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClear}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">הערה (אופציונלי)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="הערות נוספות..."
              className="min-h-[60px] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="success"
              size="lg"
              className="flex-1"
              onClick={() => handleSubmit('entry')}
            >
              <LogIn className="h-5 w-5" />
              כניסה
            </Button>
            <Button
              variant="warning"
              size="lg"
              className="flex-1"
              onClick={() => handleSubmit('exit')}
            >
              <LogOut className="h-5 w-5" />
              יציאה
            </Button>
          </div>
        </div>
      )}

      {/* New Person Mode */}
      {isNewPerson && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="font-medium text-foreground">הוספת אדם חדש</p>
            <Button variant="ghost" size="icon" onClick={handleClear}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">שם מלא *</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="ישראל ישראלי"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idNumber">תעודת זהות *</Label>
              <Input
                id="idNumber"
                value={idNumber}
                onChange={e => setIdNumber(e.target.value)}
                placeholder="123456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">תפקיד *</Label>
              <Input
                id="role"
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="קבלן / עובד / אורח"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle">מספר רכב</Label>
              <div className="relative">
                <Car className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="vehicle"
                  value={vehicleNumber}
                  onChange={e => setVehicleNumber(e.target.value)}
                  placeholder="12-345-67"
                  className="pr-10"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="new-note">הערה</Label>
              <Textarea
                id="new-note"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="הערות נוספות..."
                className="min-h-[60px] resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="success"
              size="lg"
              className="flex-1"
              onClick={() => handleSubmit('entry')}
            >
              <LogIn className="h-5 w-5" />
              כניסה
            </Button>
            <Button
              variant="warning"
              size="lg"
              className="flex-1"
              onClick={() => handleSubmit('exit')}
            >
              <LogOut className="h-5 w-5" />
              יציאה
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
