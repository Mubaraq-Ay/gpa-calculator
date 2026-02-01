'use client';

import { Card } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface ChartData {
  semester: string;
  gpa: number;
  cgpa: number;
}

interface GPATrendChartProps {
  data: ChartData[];
  targetCGPA?: number;
}

export function GPATrendChart({ data, targetCGPA }: GPATrendChartProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';
  const gridColor = isDark ? 'oklch(0.26 0.05 256)' : 'oklch(0.92 0.01 258)';
  const textColor = isDark ? 'oklch(0.97 0.01 258)' : 'oklch(0.16 0.02 256.1)';

  if (!mounted || data.length === 0) {
    return (
      <Card className="p-6 border border-border">
        <p className="text-sm text-muted-foreground text-center py-8">
          Add semesters and courses to see your GPA trend
        </p>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    ...item,
    ...(targetCGPA && { targetCGPA }),
  }));

  return (
    <Card className="p-6 border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">GPA Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="semester" stroke={textColor} style={{ fontSize: '12px' }} />
          <YAxis domain={[0, 5.1]} stroke={textColor} style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? 'oklch(0.18 0.01 256)' : 'oklch(1 0 0)',
              border: `1px solid ${gridColor}`,
              borderRadius: '8px',
              color: textColor,
            }}
            labelStyle={{ color: textColor }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="gpa"
            stroke="oklch(0.62 0.24 29.24)"
            name="Semester GPA"
            strokeWidth={2}
            dot={{ fill: 'oklch(0.62 0.24 29.24)', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="cgpa"
            stroke="oklch(0.26 0.16 264.4)"
            name="CGPA"
            strokeWidth={2}
            dot={{ fill: 'oklch(0.26 0.16 264.4)', r: 4 }}
            activeDot={{ r: 6 }}
          />
          {targetCGPA && (
            <Line
              type="monotone"
              dataKey="targetCGPA"
              stroke={gridColor}
              name="Target CGPA"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
