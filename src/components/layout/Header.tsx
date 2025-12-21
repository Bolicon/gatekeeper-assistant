import { Shield, Settings, ClipboardList, Home, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  onSettingsClick: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  const location = useLocation();
  const isLogsPage = location.pathname === '/logs';

  return (
    <header className="glass-strong sticky top-0 z-50 border-b border-border/30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="gradient-primary p-3 rounded-2xl shadow-glow animate-float">
                <Shield className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 bg-accent rounded-full p-1 animate-bounce-in">
                <Sparkles className="h-3 w-3 text-accent-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                ניהול שער
              </h1>
              <p className="text-sm text-muted-foreground">מערכת תיעוד כניסות ויציאות</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isLogsPage ? (
              <Button 
                variant="outline" 
                asChild
                className="btn-glow border-2 hover:border-primary/50 hover:bg-primary/5"
              >
                <Link to="/">
                  <Home className="h-4 w-4 ml-2" />
                  רישום
                </Link>
              </Button>
            ) : (
              <Button 
                variant="outline" 
                asChild
                className="btn-glow border-2 hover:border-primary/50 hover:bg-primary/5"
              >
                <Link to="/logs">
                  <ClipboardList className="h-4 w-4 ml-2" />
                  יומן פעילות
                </Link>
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onSettingsClick}
              className="hover:bg-muted/80 hover:rotate-45 transition-all duration-300"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
