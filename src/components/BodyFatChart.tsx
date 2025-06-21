
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Percent, Info } from 'lucide-react';
import { BodyComposition } from '../types/bodybuilding';
import { format, parseISO } from 'date-fns';

interface BodyFatChartProps {
  compositions: BodyComposition[];
}

export const BodyFatChart: React.FC<BodyFatChartProps> = ({ compositions }) => {
  const chartData = compositions
    .filter(comp => comp.bodyFatPercentage && comp.bodyFatPercentage > 0)
    .map(comp => ({
      date: format(parseISO(comp.date), 'MMM dd'),
      bodyFat: comp.bodyFatPercentage,
      fullDate: comp.date
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  const hasData = chartData.length > 0;

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-red-700 flex items-center gap-2">
          <Percent className="h-5 w-5" />
          Body Fat Percentage Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="bodyFatGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis 
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Body Fat']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="bodyFat"
                  stroke="#ef4444"
                  strokeWidth={3}
                  fill="url(#bodyFatGradient)"
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center bg-red-50 rounded-lg">
            <div className="text-center">
              <Percent className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 mb-2">No body fat data available</p>
              <p className="text-sm text-red-500">Log your body fat percentage to see your progress</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
