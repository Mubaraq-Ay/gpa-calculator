import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface GPACardProps {
  title: string;
  gpa: number;
  maxGPA: number;
  trend?: 'up' | 'down' | 'stable';
  description?: string;
  color?: 'primary' | 'accent' | 'secondary';
}

export function GPACard({
  title,
  gpa,
  maxGPA,
  trend,
  description,
  color = 'primary',
}: GPACardProps) {
  const percentage = (gpa / maxGPA) * 100;
  
  const getColorClasses = (col: string) => {
    switch (col) {
      case 'accent':
        return 'text-accent bg-accent/10';
      case 'secondary':
        return 'text-secondary bg-secondary/10';
      default:
        return 'text-primary bg-primary/10';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') {
      return <TrendingUp className="h-4 w-4 text-accent" />;
    }
    if (trend === 'down') {
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    }
    return null;
  };

  return (
    <Card className="p-6 border border-border hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">{gpa.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground">/{maxGPA.toFixed(1)}</span>
          </div>
        </div>
        {getTrendIcon()}
      </div>

      <div className="space-y-2">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${getColorClasses(color)} rounded-full transition-all`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </Card>
  );
}
