
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, Activity, Info } from 'lucide-react';
import { format } from 'date-fns';

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

  return (
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
                <XAxis 
                  dataKey="timestamp"
                  type="number"
                  scale="time"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(timestamp) => format(new Date(timestamp), 'MMM dd')}
                />
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
  );
};
