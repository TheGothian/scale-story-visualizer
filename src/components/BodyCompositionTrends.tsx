
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingDown, Activity, Percent } from 'lucide-react';

interface BodyCompositionTrendsProps {
  bodyCompData: any[];
  bodyCompTrends: {
    bodyFatChange: number;
    muscleMassChange: number;
    timeSpan: number;
  } | null;
}

export const BodyCompositionTrends: React.FC<BodyCompositionTrendsProps> = ({
  bodyCompData,
  bodyCompTrends
}) => {
  if (!bodyCompTrends) return null;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-purple-700">Body Composition Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-red-50 to-red-100">
              <div className="p-2 rounded-full bg-red-100">
                <TrendingDown className={`h-5 w-5 ${bodyCompTrends.bodyFatChange < 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Body Fat Change</p>
                <p className={`font-semibold ${bodyCompTrends.bodyFatChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {bodyCompTrends.bodyFatChange > 0 ? '+' : ''}{bodyCompTrends.bodyFatChange.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">Over {bodyCompTrends.timeSpan} days</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100">
              <div className="p-2 rounded-full bg-green-100">
                <Activity className={`h-5 w-5 ${bodyCompTrends.muscleMassChange > 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Muscle Mass Change</p>
                <p className={`font-semibold ${bodyCompTrends.muscleMassChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {bodyCompTrends.muscleMassChange > 0 ? '+' : ''}{bodyCompTrends.muscleMassChange.toFixed(1)} kg
                </p>
                <p className="text-xs text-gray-500">Over {bodyCompTrends.timeSpan} days</p>
              </div>
            </div>
          </div>

          {bodyCompData.length > 1 && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bodyCompData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="bodyFat" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Body Fat %" 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="muscleMass" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="Muscle Mass (kg)" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dedicated Body Fat Percentage Chart */}
      {bodyCompData.length > 1 && (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Body Fat Percentage Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bodyCompData}>
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
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
