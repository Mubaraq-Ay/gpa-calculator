import { Card } from '@/components/ui/card';
import { type LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  variant?: 'default' | 'accent' | 'secondary';
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  variant = 'default',
}: StatsCardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'accent':
        return 'bg-accent/10 text-accent';
      case 'secondary':
        return 'bg-secondary/10 text-secondary';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  return (
    <Card className="p-4 border border-border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${getVariantClasses()}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
