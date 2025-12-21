import { useState, useMemo } from 'react';
import { LogIn, LogOut, User, Car, FileText, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Person, EntryLog } from '@/types';
import { toast } from 'sonner';

interface EntryFormProps {
  persons: Person[];
  recentPersons: Person[];
  onAddLog: (log: Omit<EntryLog, 'id' | 'timestamp'>) => void;
  onAddPerson: (person: Omit<Person, 'id' | 'createdAt'>) => Person;
}

export function EntryForm({ persons, recentPersons, onAddLog, onAddPerson }: EntryFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [role, setRole] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [note, setNote] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saveAsCard, setSaveAsCard] = useState(false);

  // Filter suggestions based on search
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) {
      return recentPersons.slice(0, 5);
    }
    const query = searchQuery.toLowerCase();
    return persons
      .filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.idNumber.includes(query) ||
          p.vehicleNumber?.toLowerCase().includes(query)
      )
      .slice(0, 5);
  }, [searchQuery, persons, recentPersons]);

  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person);
    setName(person.name);
    setIdNumber(person.idNumber);
    setRole(person.role);
    setVehicleNumber(person.vehicleNumber || '');
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleClearForm = () => {
    setSelectedPerson(null);
    setName('');
    setIdNumber('');
    setRole('');
    setVehicleNumber('');
    setNote('');
    setSearchQuery('');
    setSaveAsCard(false);
  };

  const handleSubmit = (actionType: 'entry' | 'exit') => {
    if (!name.trim() || !idNumber.trim() || !role.trim()) {
      toast.error('נא למלא את כל השדות החובה');
      return;
    }

    let personId = selectedPerson?.id;

    // If save as card is checked and no existing person
    if (saveAsCard && !selectedPerson) {
      const existingPerson = persons.find(p => p.idNumber === idNumber);
      if (existingPerson) {
        personId = existingPerson.id;
      } else {
        const newPerson = onAddPerson({
          name,
          idNumber,
          role,
          vehicleNumber: vehicleNumber || undefined,
        });
        personId = newPerson.id;
        toast.success('כרטיס אדם נשמר בהצלחה');
      }
    }

    if (!personId) {
      // Create temporary person for this log
      const existingPerson = persons.find(p => p.idNumber === idNumber);
      personId = existingPerson?.id || crypto.randomUUID();
    }

    onAddLog({
      personId,
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

  const isRecentPerson = (person: Person) => recentPersons.some(p => p.id === person.id);

  return (
    <div className="gradient-card rounded-2xl p-6 border border-border/50 shadow-lg animate-fade-in">
      <h2 className="text-lg font-semibold mb-4 text-foreground">רישום כניסה / יציאה</h2>

      {/* Search / Quick Select */}
      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש לפי שם, ת״ז או רכב..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="pr-10"
          />
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden animate-scale-in">
            {suggestions.map(person => (
              <button
                key={person.id}
                onClick={() => handleSelectPerson(person)}
                className="w-full flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors text-right"
              >
                <div className={`p-2 rounded-lg ${isRecentPerson(person) ? 'bg-primary/10' : 'bg-muted'}`}>
                  <User className={`h-4 w-4 ${isRecentPerson(person) ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{person.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {person.idNumber} • {person.role}
                    {person.vehicleNumber && ` • ${person.vehicleNumber}`}
                  </p>
                </div>
                {isRecentPerson(person) && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    לאחרונה
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="name">שם מלא *</Label>
          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="ישראל ישראלי"
              className="pr-10"
            />
          </div>
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
          <Label htmlFor="note">הערה</Label>
          <div className="relative">
            <FileText className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Textarea
              id="note"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="הערות נוספות..."
              className="pr-10 min-h-[80px] resize-none"
            />
          </div>
        </div>
      </div>

      {/* Save as card checkbox */}
      {!selectedPerson && (
        <label className="flex items-center gap-2 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={saveAsCard}
            onChange={e => setSaveAsCard(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm text-muted-foreground">שמור ככרטיס אדם לשימוש עתידי</span>
        </label>
      )}

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
