import { useState, useMemo } from 'react';
import { LogIn, LogOut, User, Car, Search, X, UserPlus, Zap } from 'lucide-react';
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
    setRole(person.role || '');
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
    if (!name.trim() || !idNumber.trim() || !vehicleNumber.trim()) {
      toast.error('נא למלא שם, ת"ז/מ.א ומספר רכב');
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
        role: role || undefined,
        vehicleNumber,
      });
      personId = newPerson.id;
    }

    // Add log entry
    onAddLog({
      personId: personId!,
      personName: name,
      idNumber,
      role: role || undefined,
      vehicleNumber,
      actionType,
      note: note || undefined,
    });

    toast.success(
      actionType === 'entry' ? '✓ כניסה נרשמה בהצלחה' : '✓ יציאה נרשמה בהצלחה',
      { duration: 3000 }
    );
    handleClearForm();
  };

  const showSuggestions = searchQuery.trim().length > 0 && suggestions.length > 0;
  const hasFormData = name || idNumber || role || vehicleNumber;

  return (
    <div className="gradient-card rounded-3xl p-8 border border-border/40 shadow-lg animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="gradient-primary p-2.5 rounded-xl">
            <UserPlus className="h-5 w-5 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground">רישום כניסה / יציאה</h2>
        </div>
        {hasFormData && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearForm}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="h-4 w-4 ml-1" />
            נקה טופס
          </Button>
        )}
      </div>

      {/* Quick Search */}
      <div className="mb-8 space-y-4">
        <div className="relative input-focus-ring rounded-2xl">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="חיפוש מהיר לפי שם, ת״ז או מספר רכב..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pr-12 h-14 text-base rounded-2xl border-2 border-border/60 focus:border-primary bg-background/50"
          />
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div className="bg-card rounded-2xl p-3 border-2 border-primary/20 shadow-lg animate-scale-in">
            <div className="flex items-center gap-2 px-2 pb-3 border-b border-border/50">
              <Zap className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-foreground">נמצאו {suggestions.length} תוצאות</p>
            </div>
            <div className="space-y-1 pt-2">
              {suggestions.map((person, index) => (
                <button
                  key={person.id}
                  onClick={() => handleSelectPerson(person)}
                  className={`flex items-center gap-3 p-3 hover:bg-primary/5 rounded-xl transition-all w-full text-right group stagger-${index + 1} animate-fade-in`}
                >
                  <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{person.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {person.idNumber}
                      {person.role && ` • ${person.role}`}
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
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-1 rounded-full bg-accent animate-pulse" />
              <p className="text-sm font-medium text-muted-foreground">נראו לאחרונה</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentPersons.slice(0, 6).map((person, index) => (
                <button
                  key={person.id}
                  onClick={() => handleSelectPerson(person)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-2 stagger-${index + 1} animate-scale-in ${
                    selectedPersonId === person.id
                      ? 'gradient-primary text-primary-foreground border-transparent shadow-glow'
                      : 'bg-card hover:bg-primary/5 text-foreground border-border/50 hover:border-primary/30 hover:scale-105'
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-1">
            שם מלא
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={name}
            onChange={e => {
              setName(e.target.value);
              setSelectedPersonId(null);
            }}
            className="h-12 rounded-xl border-2 border-border/60 focus:border-primary bg-background/50 transition-all"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="idNumber" className="text-sm font-semibold flex items-center gap-1">
            ת"ז / מ.א
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="idNumber"
            value={idNumber}
            onChange={e => {
              setIdNumber(e.target.value);
              setSelectedPersonId(null);
            }}
            className="h-12 rounded-xl border-2 border-border/60 focus:border-primary bg-background/50 transition-all"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-semibold text-muted-foreground">
            תפקיד
          </Label>
          <Input
            id="role"
            value={role}
            onChange={e => setRole(e.target.value)}
            className="h-12 rounded-xl border-2 border-border/60 focus:border-primary bg-background/50 transition-all"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicle" className="text-sm font-semibold flex items-center gap-1">
            מספר רכב
            <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Car className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="vehicle"
              value={vehicleNumber}
              onChange={e => setVehicleNumber(e.target.value)}
              className="h-12 pr-12 rounded-xl border-2 border-border/60 focus:border-primary bg-background/50 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="note" className="text-sm font-semibold text-muted-foreground">
            הערות נוספות
          </Label>
          <Textarea
            id="note"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="min-h-[80px] resize-none rounded-xl border-2 border-border/60 focus:border-primary bg-background/50 transition-all"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="success"
          size="lg"
          className="flex-1 h-14 text-lg font-bold rounded-2xl btn-glow shadow-glow-success hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => handleSubmit('entry')}
        >
          <LogIn className="h-6 w-6" />
          כניסה
        </Button>
        <Button
          variant="warning"
          size="lg"
          className="flex-1 h-14 text-lg font-bold rounded-2xl btn-glow shadow-glow-warning hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => handleSubmit('exit')}
        >
          <LogOut className="h-6 w-6" />
          יציאה
        </Button>
      </div>
    </div>
  );
}
