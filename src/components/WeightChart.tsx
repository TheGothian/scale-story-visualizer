
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Trash2 } from 'lucide-react';
import { WeightEntry } from '../types/weight';
import { format, parseISO } from 'date-fns';
import { calculateTrend } from '../utils/calculations';
import { useUnit } from '../contexts/UnitContext';

interface WeightChartProps {
  weights: WeightEntry[];
  onDeleteWeight: (id: string) => void;
}

export const WeightChart: React.FC<WeightChartProps> = ({ weights, onDeleteWeight }) => {
  const { unitSystem, getWeightUnit, convertWeight } = useUnit();
  const currentUnit = unitSystem === 'metric' ? 'kg' : 'lbs';

  const chartData = weights.map((entry, index) => {
    const displayWeight = convertWeight(entry.weight, entry.unit, currentUnit);
    return {
      ...entry,
      displayWeight,
      index,
      formattedDate: format(parseISO(entry.date), 'MMM dd'),
      trend: weights.length > 1 ? calculateTrend(weights).slope * index + calculateTrend(weights).intercept : displayWeight
    };
  });

  const trend = weights.length > 1 ? calculateTrend(weights) : null;
  const latestWeight = weights[weights.length - 1];
  const previousWeight = weights[weights.length - 2];
  
  let weightChange = 0;
  if (latestWeight && previousWeight) {
    const latestDisplay = convertWeight(latestWeight.weight, latestWeight.unit, currentUnit);
    const previousDisplay = convertWeight(previousWeight.weight, previousWeight.unit, currentUnit);
    weightChange = latestDisplay - previousDisplay;
  }

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <circle
            cx={cx}
            cy={cy}
            r={6}
            fill="#2563eb"
            stroke="#2563eb"
            strokeWidth={2}
            className="cursor-pointer hover:r-8 transition-all"
          />
        </HoverCardTrigger>
        <HoverCardContent className="w-64" side="top">
          <div className="space-y-2">
            <p className="font-semibold">{format(parseISO(payload.date), 'MMM dd, yyyy')}</p>
            <p className="text-blue-600">{`Weight: ${payload.displayWeight.toFixed(1)} ${getWeightUnit()}`}</p>
            {payload.note && <p className="text-gray-600 text-sm">{payload.note}</p>}
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => onDeleteWeight(payload.id)}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete Entry
            </Button>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-blue-700">Weight Progress</CardTitle>
          {latestWeight && (
            <div className="flex items-center gap-2 text-sm">
              {weightChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : weightChange < 0 ? (
                <TrendingDown className="h-4 w-4 text-green-500" />
              ) : (
                <Minus className="h-4 w-4 text-gray-500" />
              )}
              <span className={weightChange > 0 ? 'text-red-500' : weightChange < 0 ? 'text-green-500' : 'text-gray-500'}>
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} {getWeightUnit()}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {weights.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No weight entries yet. Start by logging your first weight!</p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis 
                  dataKey="formattedDate" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                
                {/* Actual weight line */}
                <Line
                  type="monotone"
                  dataKey="displayWeight"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={<CustomDot />}
                />
                
                {/* Trend line */}
                {trend && weights.length > 2 && (
                  <Line
                    type="monotone"
                    dataKey="trend"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
