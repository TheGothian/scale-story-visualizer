
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Target, Calendar, Activity, Zap, BarChart3 } from 'lucide-react';
import { WeightEntry } from '../types/weight';
import { calculateTrend } from '../utils/calculations';
import { useUnit } from '../contexts/UnitContext';

interface EnhancedTrendAnalysisProps {
  weights: WeightEntry[];
}

export const EnhancedTrendAnalysis: React.FC<EnhancedTrendAnalysisProps> = ({ weights }) => {
  const { getWeightUnit } = useUnit();

  if (weights.length < 2) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-blue-700">Enhanced Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Add at least 2 weight entries to see enhanced trend analysis.</p>
        </CardContent>
      </Card>
    );
  }

  const trend = calculateTrend(weights);
  const isLosingWeight = trend.slope < 0;
  const isGainingWeight = trend.slope > 0;
  const unit = getWeightUnit();

  const getStreakIcon = (type: string) => {
    switch (type) {
      case 'loss': return <TrendingDown className="h-4 w-4 text-green-600" />;
      case 'gain': return <TrendingUp className="h-4 w-4 text-red-600" />;
      default: return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getBestDay = () => {
    const pattern = trend.dayOfWeekPattern;
    const days = Object.entries(pattern).filter(([_, weight]) => weight > 0);
    if (days.length === 0) return null;
    
    return days.reduce((best, [day, weight]) => 
      weight < best[1] ? [day, weight] : best
    );
  };

  const bestDay = getBestDay();

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-blue-700">Enhanced Trend Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
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
                {trend.weeklyChange > 0 ? '+' : ''}{trend.weeklyChange.toFixed(2)} {unit}/week
              </p>
            </div>
          </div>

          {/* Volatility */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100">
            <div className="p-2 rounded-full bg-purple-100">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Volatility</p>
              <p className="font-semibold text-purple-600">
                ±{trend.volatility.toFixed(2)} {unit}
              </p>
              <p className="text-xs text-purple-500">
                {trend.volatility < 1 ? 'Very stable' : trend.volatility < 2 ? 'Stable' : 'Variable'}
              </p>
            </div>
          </div>

          {/* Acceleration */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100">
            <div className="p-2 rounded-full bg-amber-100">
              <Zap className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Acceleration</p>
              <p className={`font-semibold ${trend.acceleration < 0 ? 'text-green-600' : trend.acceleration > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {trend.acceleration > 0 ? '+' : ''}{trend.acceleration.toFixed(3)} {unit}/day²
              </p>
              <p className="text-xs text-amber-600">
                {Math.abs(trend.acceleration) < 0.01 ? 'Steady' : trend.acceleration < 0 ? 'Improving' : 'Slowing'}
              </p>
            </div>
          </div>

          {/* Longest Streak */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100">
            <div className="p-2 rounded-full bg-green-100">
              {getStreakIcon(trend.longestStreak.type)}
            </div>
            <div>
              <p className="text-sm text-gray-600">Longest Streak</p>
              <p className="font-semibold text-green-600">
                {trend.longestStreak.count} days
              </p>
              <p className="text-xs text-green-500">
                {trend.longestStreak.type} {trend.longestStreak.current ? '(current)' : ''}
              </p>
            </div>
          </div>

          {/* Plateau Status */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="p-2 rounded-full bg-gray-100">
              <BarChart3 className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Plateau Status</p>
              <p className={`font-semibold ${trend.plateauDetection.isInPlateau ? 'text-orange-600' : 'text-green-600'}`}>
                {trend.plateauDetection.isInPlateau ? 'In Plateau' : 'Trending'}
              </p>
              {trend.plateauDetection.isInPlateau && (
                <p className="text-xs text-orange-500">
                  {trend.plateauDetection.plateauDays} days
                </p>
              )}
            </div>
          </div>

          {/* Best Day Pattern */}
          {bestDay && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100">
              <div className="p-2 rounded-full bg-indigo-100">
                <Calendar className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Best Weigh-in Day</p>
                <p className="font-semibold text-indigo-600">
                  {bestDay[0]}
                </p>
                <p className="text-xs text-indigo-500">
                  Avg: {bestDay[1].toFixed(1)} {unit}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Current Moving Averages */}
        {trend.movingAverage7.length > 0 && (
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-green-50">
            <h4 className="font-semibold text-gray-700 mb-3">Moving Averages</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">7-Day Average</p>
                <p className="font-semibold text-blue-600">
                  {trend.movingAverage7[trend.movingAverage7.length - 1]?.toFixed(1)} {unit}
                </p>
              </div>
              {trend.movingAverage30.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600">30-Day Average</p>
                  <p className="font-semibold text-green-600">
                    {trend.movingAverage30[trend.movingAverage30.length - 1]?.toFixed(1)} {unit}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trend Description */}
        <div className="mt-4 p-4 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-700">
            <strong>Trend Strength:</strong> {(trend.rSquared * 100).toFixed(1)}% correlation
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {trend.rSquared > 0.7 ? 'Strong' : trend.rSquared > 0.4 ? 'Moderate' : 'Weak'} trend consistency.
            {isLosingWeight && !trend.plateauDetection.isInPlateau && ' Keep up the great work! 🎉'}
            {isGainingWeight && ' Consider reviewing your routine. 💪'}
            {trend.plateauDetection.isInPlateau && ' Time to mix things up! 🔄'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
