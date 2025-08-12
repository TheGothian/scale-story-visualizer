
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Target, Calendar, Activity, Zap, BarChart3 } from 'lucide-react';
import { WeightEntry, WeightGoal } from '../types/weight';
import { calculateTrend } from '../utils/calculations';
import { useUnit } from '../contexts/UnitContext';
import { parseISO, differenceInCalendarDays, addDays, format } from 'date-fns';

interface EnhancedTrendAnalysisProps {
  weights: WeightEntry[];
  weightGoals?: WeightGoal[];
}

export const EnhancedTrendAnalysis: React.FC<EnhancedTrendAnalysisProps> = ({ weights, weightGoals }) => {
  const { getWeightUnit, convertWeight } = useUnit();

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
  const unit = getWeightUnit() as 'kg' | 'lbs';

  // Goal-aware metrics
  const currentUnit = unit;
  const latest = [...weights].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[weights.length - 1];
  const activeGoals = (weightGoals ?? []).filter(g => g.isActive);
  const activeGoal = activeGoals.length ? activeGoals.reduce((acc, g) => (parseISO(g.targetDate) < parseISO(acc.targetDate) ? g : acc)) : null;

  let requiredWeeklyChange: number | null = null;
  let paceDelta: number | null = null;
  let paceDeltaColor = 'text-gray-600';
  let paceStatusLabel: string | null = null;
  let paceStatusColor = 'text-gray-600';
  let paceNarrative: string | null = null;
  let projectionWindow: null | { minDate: Date; maxDate: Date; estDate: Date } = null;
  let weeksUntilTarget: number | null = null;
  let direction = 0;

  if (activeGoal && latest) {
    const currentWeight = convertWeight(latest.weight, latest.unit, currentUnit);
    const goalWeight = convertWeight(activeGoal.targetWeight, activeGoal.unit, currentUnit);
    const deltaToGoal = goalWeight - currentWeight;
    direction = Math.sign(deltaToGoal);
    weeksUntilTarget = differenceInCalendarDays(parseISO(activeGoal.targetDate), new Date()) / 7;
    if (weeksUntilTarget !== 0) {
      requiredWeeklyChange = deltaToGoal / weeksUntilTarget;
    }
    const actualWeeklyChange = trend.weeklyChange;
    const actualTowards = direction * actualWeeklyChange;
    const requiredTowards = requiredWeeklyChange != null ? Math.abs(requiredWeeklyChange) : null;

    if (requiredTowards != null && Number.isFinite(requiredTowards)) {
      paceDelta = actualTowards - requiredTowards;
      const neededSign = Math.sign(deltaToGoal);
      const aligned = neededSign === 0 ? true : Math.sign(actualWeeklyChange) === neededSign;
      const epsilon = 1e-3;

      if (!aligned || actualWeeklyChange === 0) {
        paceDeltaColor = 'text-red-600';
      } else if (Math.abs(actualWeeklyChange) + epsilon >= Math.abs(requiredWeeklyChange!)) {
        paceDeltaColor = 'text-green-600';
      } else {
        paceDeltaColor = 'text-orange-600';
      }

      const diff = Math.abs(actualTowards - requiredTowards);
      if (!aligned || actualWeeklyChange === 0) {
        paceStatusLabel = `Wrong direction · behind by ${diff.toFixed(2)} ${currentUnit}/week`;
        paceStatusColor = 'text-red-600';
      } else if (Math.abs(actualWeeklyChange) + epsilon >= Math.abs(requiredWeeklyChange!)) {
        const aheadBy = (actualTowards - requiredTowards);
        paceStatusLabel = `Ahead by ${aheadBy.toFixed(2)} ${currentUnit}/week`;
        paceStatusColor = 'text-green-600';
      } else {
        const behindBy = (requiredTowards - actualTowards);
        paceStatusLabel = `Behind by ${behindBy.toFixed(2)} ${currentUnit}/week`;
        paceStatusColor = 'text-orange-600';
      }

      // Build a plain-language narrative
      const goalDirection = (requiredWeeklyChange! < 0) ? 'weight-loss' : 'weight-gain';
      const currentStr = `${actualWeeklyChange >= 0 ? '+' : ''}${actualWeeklyChange.toFixed(2)} ${currentUnit}/week`;
      const requiredStr = `${requiredWeeklyChange! >= 0 ? '+' : ''}${requiredWeeklyChange!.toFixed(2)} ${currentUnit}/week`;
      const directionText = (!aligned || actualWeeklyChange === 0) ? "it's the wrong direction" : "that's the right direction";
      const aheadOrBehind = (!aligned || Math.abs(actualWeeklyChange) + epsilon < Math.abs(requiredWeeklyChange!)) ? 'behind' : 'ahead';
      const arithmetic = (!aligned || actualWeeklyChange === 0)
        ? `${Math.abs(requiredWeeklyChange!).toFixed(2)} + ${Math.abs(actualWeeklyChange).toFixed(2)} ≈ ${(Math.abs(requiredWeeklyChange!) + Math.abs(actualWeeklyChange)).toFixed(2)}`
        : (Math.abs(actualWeeklyChange) + epsilon >= Math.abs(requiredWeeklyChange!))
          ? `${Math.abs(actualWeeklyChange).toFixed(2)} - ${Math.abs(requiredWeeklyChange!).toFixed(2)} ≈ ${diff.toFixed(2)}`
          : `${Math.abs(requiredWeeklyChange!).toFixed(2)} - ${Math.abs(actualWeeklyChange).toFixed(2)} ≈ ${diff.toFixed(2)}`;

      paceNarrative = `You set a ${goalDirection} goal (need ${requiredStr}), but your current trend is ${currentStr}, so ${directionText}. You're ${diff.toFixed(2)} ${currentUnit}/week ${aheadOrBehind} because ${arithmetic}.`;
    }

    const canProject = actualTowards > 0;
    if (canProject) {
      const daysToGoal = (Math.abs(deltaToGoal) / actualTowards) * 7;
      const confidence = Math.max(0, Math.min(1, trend.rSquared));
      const windowPct = Math.max(0.1, Math.min(0.6, 1 - confidence));
      const minDays = Math.max(0, Math.round(daysToGoal * (1 - windowPct)));
      const maxDays = Math.round(daysToGoal * (1 + windowPct));
      const estDays = Math.round(daysToGoal);
      projectionWindow = {
        minDate: addDays(new Date(), minDays),
        maxDate: addDays(new Date(), maxDays),
        estDate: addDays(new Date(), estDays),
      };
    }
  }

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

          {/* Pace vs Target (slope delta) */}
          {activeGoal && (
            <div className="md:col-span-2 lg:col-span-2 flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100">
              <div className="p-2 rounded-full bg-emerald-100">
                <Target className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pace vs Target</p>
                <p className={`font-semibold ${paceStatusColor}`}>
                  {paceStatusLabel ?? '—'}
                </p>
                <p className="text-xs text-emerald-600">
                  Current: {`${trend.weeklyChange >= 0 ? '+' : ''}${trend.weeklyChange.toFixed(2)} ${unit}/week`}
                </p>
                <p className="text-xs text-emerald-600">
                  Required: {requiredWeeklyChange != null && Number.isFinite(requiredWeeklyChange) ? `${requiredWeeklyChange >= 0 ? '+' : ''}${requiredWeeklyChange.toFixed(2)} ${unit}/week` : '—'}
                </p>
                {paceNarrative && (
                  <p className="mt-2 text-xs text-emerald-700">
                    {paceNarrative}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Goal hit projection window */}
          {activeGoal && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-rose-50 to-rose-100">
              <div className="p-2 rounded-full bg-rose-100">
                <Calendar className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Goal Projection</p>
                {projectionWindow ? (
                  <>
                    <p className="font-semibold text-rose-600">
                      {format(projectionWindow.minDate, 'MMM d')} – {format(projectionWindow.maxDate, 'MMM d')}
                    </p>
                    <p className="text-xs text-rose-600">Est: {format(projectionWindow.estDate, 'MMM d')}</p>
                  </>
                ) : (
                  <p className="font-semibold text-gray-600">
                    {weeksUntilTarget != null && weeksUntilTarget <= 0
                      ? 'Target date passed'
                      : direction === 0
                      ? 'At target'
                      : 'Trend not toward goal'}
                  </p>
                )}
              </div>
            </div>
          )}

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
