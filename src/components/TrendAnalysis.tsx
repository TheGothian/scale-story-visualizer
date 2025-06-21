
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Target, Calendar } from 'lucide-react';
import { WeightEntry } from '../types/weight';
import { calculateTrend } from '../utils/calculations';

interface TrendAnalysisProps {
  weights: WeightEntry[];
}

export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ weights }) => {
  if (weights.length < 2) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-blue-700">Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Add at least 2 weight entries to see trend analysis.</p>
        </CardContent>
      </Card>
    );
  }

  const trend = calculateTrend(weights);
  const isLosingWeight = trend.slope < 0;
  const isGainingWeight = trend.slope > 0;

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-blue-700">Trend Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weekly Trend */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
            <div className={`p-2 rounded-full ${isLosingWeight ? 'bg-green-100' : isGainingWeight ? 'bg-red-100' : 'bg-gray-100'}`}>
              {isLosingWeight ? (
                <TrendingDown className="h-5 w-5 text-green-600" />
              ) : isGainingWeight ? (
                <TrendingUp className="h-5 w-5 text-red-600" />
              ) : (
                <Target className="h-5 w-5 text-gray-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Weekly Change</p>
              <p className={`font-semibold ${isLosingWeight ? 'text-green-600' : isGainingWeight ? 'text-red-600' : 'text-gray-600'}`}>
                {trend.weeklyChange > 0 ? '+' : ''}{trend.weeklyChange.toFixed(2)} lbs/week
              </p>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100">
            <div className="p-2 rounded-full bg-green-100">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Change</p>
              <p className={`font-semibold ${isLosingWeight ? 'text-green-600' : isGainingWeight ? 'text-red-600' : 'text-gray-600'}`}>
                {trend.monthlyChange > 0 ? '+' : ''}{trend.monthlyChange.toFixed(2)} lbs/month
              </p>
            </div>
          </div>
        </div>

        {/* Trend Description */}
        <div className="mt-4 p-4 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-700">
            <strong>Trend Strength:</strong> {(trend.rSquared * 100).toFixed(1)}% correlation
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {trend.rSquared > 0.7 ? 'Strong' : trend.rSquared > 0.4 ? 'Moderate' : 'Weak'} trend consistency.
            {isLosingWeight && ' Keep up the great work! 🎉'}
            {isGainingWeight && ' Consider reviewing your routine. 💪'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
