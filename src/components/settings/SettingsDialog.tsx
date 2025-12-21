import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestHours: number;
  onSuggestHoursChange: (hours: number) => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  suggestHours,
  onSuggestHoursChange,
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>הגדרות</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <div className="space-y-3">
            <Label htmlFor="suggest-hours" className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              חלון זמן להצעות אוטומטיות
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="suggest-hours"
                type="number"
                min={1}
                max={168}
                value={suggestHours}
                onChange={e => onSuggestHoursChange(parseInt(e.target.value) || 24)}
                className="w-24"
              />
              <span className="text-muted-foreground">שעות</span>
            </div>
            <p className="text-sm text-muted-foreground">
              אנשים שהופיעו ב-{suggestHours} השעות האחרונות יוצעו אוטומטית בעת מילוי הטופס
            </p>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-foreground mb-2">אודות</h3>
            <p className="text-sm text-muted-foreground">
              מערכת ניהול שער v1.0
            </p>
            <p className="text-sm text-muted-foreground">
              תיעוד כניסות ויציאות בזמן אמת
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
