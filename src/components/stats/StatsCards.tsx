import { LogIn, LogOut, Users, UserCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { Stats } from '@/types';

interface StatsCardsProps {
  stats: Stats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'נמצאים כעת',
      value: stats.currentlyInside,
      icon: UserCheck,
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20',
    },
    {
      title: 'כניסות היום',
      value: stats.todayEntries,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
    },
    {
      title: 'יציאות היום',
      value: stats.todayExits,
      icon: TrendingDown,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20',
    },
    {
      title: 'מבקרים ייחודיים',
      value: stats.uniqueVisitors,
      icon: Users,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className={`gradient-card rounded-xl p-4 border ${card.borderColor} animate-slide-up shadow-sm hover:shadow-md transition-shadow duration-200`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`${card.bgColor} p-2 rounded-lg`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{card.value}</p>
          <p className="text-sm text-muted-foreground">{card.title}</p>
        </div>
      ))}
    </div>
  );
}
