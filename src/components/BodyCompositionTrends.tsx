
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingDown, Activity, Percent, Info } from 'lucide-react';

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
  // Show component even without trends data
  const hasData = bodyCompData.length > 0;
  const hasBodyFatData = bodyCompData.some(data => data.bodyFat > 0);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-purple-700">Body Composition Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Show trends summary only if we have trend data */}
          {bodyCompTrends && (
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
          )}

          {/* Combined chart - show if we have any data */}
          {hasData ? (
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
                    connectNulls={false}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="muscleMass" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="Muscle Mass (kg)" 
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No body composition data yet</p>
                <p className="text-sm text-gray-500">Add body composition entries to see trends</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dedicated Body Fat Percentage Chart */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Body Fat Percentage Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasBodyFatData ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bodyCompData.filter(data => data.bodyFat > 0)}>
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
                <p className="text-sm text-red-500">Add body fat percentage in your composition entries to see this chart</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
