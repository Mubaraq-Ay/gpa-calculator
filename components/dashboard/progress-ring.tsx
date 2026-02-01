import { Card } from '@/components/ui/card';

interface ProgressRingProps {
  current: number;
  target: number;
  maxValue: number;
  title?: string;
  subtitle?: string;
}

export function ProgressRing({
  current,
  target,
  maxValue,
  title = 'Progress to Target',
  subtitle,
}: ProgressRingProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((current / target) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 100) return '#4CAF50';
    if (percentage >= 75) return 'oklch(0.62 0.24 29.24)';
    if (percentage >= 50) return 'oklch(0.68 0.19 264.76)';
    return 'oklch(0.64 0.23 25.3)';
  };

  return (
    <Card className="p-6 border border-border">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">{title}</h3>
      
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative w-32 h-32">
          <svg width="128" height="128" className="transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="oklch(0.92 0.01 258)"
              strokeWidth="6"
              className="dark:stroke-[oklch(0.26_0.05_256)]"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke={getColor()}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-foreground">{percentage.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">{current.toFixed(2)}/{target.toFixed(2)}</div>
          </div>
        </div>

        {subtitle && (
          <p className="text-xs text-muted-foreground text-center">{subtitle}</p>
        )}

        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Current: {current.toFixed(2)}</span>
            <span>Target: {target.toFixed(2)}</span>
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Remaining: {Math.max(target - current, 0).toFixed(2)}
          </div>
        </div>
      </div>
    </Card>
  );
}
