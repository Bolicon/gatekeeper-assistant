import { useState } from 'react';
import { User, Pencil, Trash2, Plus, X, Save, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Person } from '@/types';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PersonsManagerProps {
  persons: Person[];
  onAdd: (person: Omit<Person, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, updates: Partial<Person>) => void;
  onDelete: (id: string) => void;
}

export function PersonsManager({ persons, onAdd, onUpdate, onDelete }: PersonsManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
    role: '',
    vehicleNumber: '',
  });

  const handleOpenAdd = () => {
    setEditingPerson(null);
    setFormData({ name: '', idNumber: '', role: '', vehicleNumber: '' });
    setIsOpen(true);
  };

  const handleOpenEdit = (person: Person) => {
    setEditingPerson(person);
    setFormData({
      name: person.name,
      idNumber: person.idNumber,
      role: person.role,
      vehicleNumber: person.vehicleNumber || '',
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.idNumber.trim() || !formData.role.trim()) {
      toast.error('נא למלא את כל השדות החובה');
      return;
    }

    if (editingPerson) {
      onUpdate(editingPerson.id, {
        name: formData.name,
        idNumber: formData.idNumber,
        role: formData.role,
        vehicleNumber: formData.vehicleNumber || undefined,
      });
      toast.success('כרטיס עודכן בהצלחה');
    } else {
      onAdd({
        name: formData.name,
        idNumber: formData.idNumber,
        role: formData.role,
        vehicleNumber: formData.vehicleNumber || undefined,
      });
      toast.success('כרטיס נוסף בהצלחה');
    }

    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('האם למחוק את הכרטיס?')) {
      onDelete(id);
      toast.success('כרטיס נמחק בהצלחה');
    }
  };

  return (
    <div className="gradient-card rounded-2xl p-6 border border-border/50 shadow-lg animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">כרטיסי אנשים</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" size="sm" onClick={handleOpenAdd}>
              <Plus className="h-4 w-4" />
              הוסף כרטיס
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingPerson ? 'עריכת כרטיס' : 'כרטיס חדש'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="modal-name">שם מלא *</Label>
                <Input
                  id="modal-name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ישראל ישראלי"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-id">תעודת זהות *</Label>
                <Input
                  id="modal-id"
                  value={formData.idNumber}
                  onChange={e => setFormData({ ...formData, idNumber: e.target.value })}
                  placeholder="123456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-role">תפקיד *</Label>
                <Input
                  id="modal-role"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  placeholder="קבלן / עובד / אורח"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-vehicle">מספר רכב</Label>
                <Input
                  id="modal-vehicle"
                  value={formData.vehicleNumber}
                  onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  placeholder="12-345-67"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="secondary" className="flex-1" onClick={() => setIsOpen(false)}>
                  ביטול
                </Button>
                <Button variant="gradient" className="flex-1" onClick={handleSubmit}>
                  <Save className="h-4 w-4" />
                  שמור
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Persons Grid */}
      {persons.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>אין כרטיסים שמורים</p>
          <p className="text-sm">הוסף כרטיס אדם לגישה מהירה</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
          {persons.map(person => (
            <div
              key={person.id}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors group"
            >
              <div className="bg-primary/10 p-2 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{person.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {person.idNumber} • {person.role}
                </p>
                {person.vehicleNumber && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Car className="h-3 w-3" />
                    {person.vehicleNumber}
                  </p>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(person)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(person.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
