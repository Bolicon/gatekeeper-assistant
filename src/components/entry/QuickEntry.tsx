import { useState, useMemo } from 'react';
import { LogIn, LogOut, User, Car, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Person, EntryLog } from '@/types';
import { toast } from 'sonner';

interface QuickEntryProps {
  persons: Person[];
  recentPersons: Person[];
  onAddLog: (log: Omit<EntryLog, 'id' | 'timestamp'>) => void;
  onAddPerson: (person: Omit<Person, 'id' | 'createdAt'>) => Person;
}

export function QuickEntry({ persons, recentPersons, onAddLog, onAddPerson }: QuickEntryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form fields
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [role, setRole] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [note, setNote] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Filter suggestions based on search query
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
      .slice(0, 5);
  }, [searchQuery, persons]);

  const handleSelectPerson = (person: Person) => {
    setName(person.name);
    setIdNumber(person.idNumber);
    setRole(person.role);
    setVehicleNumber(person.vehicleNumber || '');
    setSelectedPersonId(person.id);
    setSearchQuery('');
  };

  const handleClearForm = () => {
    setName('');
    setIdNumber('');
    setRole('');
    setVehicleNumber('');
    setNote('');
    setSelectedPersonId(null);
    setSearchQuery('');
  };

  const handleSubmit = (actionType: 'entry' | 'exit') => {
    if (!name.trim() || !idNumber.trim() || !role.trim()) {
      toast.error('נא למלא שם, ת"ז ותפקיד');
      return;
    }

    let personId = selectedPersonId;

    // Check if this person exists (by ID number)
    const existingPerson = persons.find(p => p.idNumber === idNumber);

    if (existingPerson) {
      personId = existingPerson.id;
    } else {
      // Create new person
      const newPerson = onAddPerson({
        name,
        idNumber,
        role,
        vehicleNumber: vehicleNumber || undefined,
      });
      personId = newPerson.id;
    }

    // Add log entry
    onAddLog({
      personId: personId!,
      personName: name,
      idNumber,
      role,
      vehicleNumber: vehicleNumber || undefined,
      actionType,
      note: note || undefined,
    });

    toast.success(actionType === 'entry' ? 'כניסה נרשמה בהצלחה' : 'יציאה נרשמה בהצלחה');
    handleClearForm();
  };

  const showSuggestions = searchQuery.trim().length > 0 && suggestions.length > 0;
  const hasFormData = name || idNumber || role || vehicleNumber;

  return (
    <div className="gradient-card rounded-2xl p-6 border border-border/50 shadow-lg animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">רישום כניסה / יציאה</h2>
        {hasFormData && (
          <Button variant="ghost" size="sm" onClick={handleClearForm}>
            <X className="h-4 w-4 ml-1" />
            נקה טופס
          </Button>
        )}
      </div>

      {/* Quick Search */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="חיפוש מהיר לפי שם, ת״ז או מספר רכב..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pr-11 h-12 text-base"
          />
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div className="bg-muted/50 rounded-xl p-2 border border-border/50 animate-fade-in">
            <p className="text-xs text-muted-foreground px-2 pb-2">לחץ לבחירה:</p>
            <div className="space-y-1">
              {suggestions.map(person => (
                <button
                  key={person.id}
                  onClick={() => handleSelectPerson(person)}
                  className="flex items-center gap-3 p-2 hover:bg-background rounded-lg transition-colors text-right w-full"
                >
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{person.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {person.idNumber} • {person.role}
                      {person.vehicleNumber && ` • ${person.vehicleNumber}`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Persons Quick Select */}
        {!searchQuery && recentPersons.length > 0 && (
          <div className="animate-fade-in">
            <p className="text-xs text-muted-foreground mb-2">נראו לאחרונה:</p>
            <div className="flex flex-wrap gap-2">
              {recentPersons.slice(0, 6).map(person => (
                <button
                  key={person.id}
                  onClick={() => handleSelectPerson(person)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors border ${
                    selectedPersonId === person.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 hover:bg-muted text-foreground border-border/50'
                  }`}
                >
                  {person.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="name">שם מלא *</Label>
          <Input
            id="name"
            value={name}
            onChange={e => {
              setName(e.target.value);
              setSelectedPersonId(null);
            }}
            placeholder="ישראל ישראלי"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="idNumber">ת"ז / מ.א *</Label>
          <Input
            id="idNumber"
            value={idNumber}
            onChange={e => {
              setIdNumber(e.target.value);
              setSelectedPersonId(null);
            }}
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
          <Label htmlFor="note">הערה</Label>
          <Textarea
            id="note"
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
  );
}
