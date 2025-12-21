import { Shield, Settings, ClipboardList, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  onSettingsClick: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  const location = useLocation();
  const isLogsPage = location.pathname === '/logs';

  return (
    <header className="glass sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="gradient-primary p-2.5 rounded-xl shadow-glow">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">ניהול שער</h1>
              <p className="text-sm text-muted-foreground">מערכת תיעוד כניסות ויציאות</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isLogsPage ? (
              <Button variant="outline" asChild>
                <Link to="/">
                  <Home className="h-4 w-4 ml-2" />
                  רישום
                </Link>
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link to="/logs">
                  <ClipboardList className="h-4 w-4 ml-2" />
                  יומן פעילות
                </Link>
              </Button>
            )}
            
            <Button variant="ghost" size="icon" onClick={onSettingsClick}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
