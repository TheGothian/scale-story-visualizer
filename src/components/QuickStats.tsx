
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Scale, BarChart3, Target, Zap } from 'lucide-react';
import { WeightEntry, WeightGoal } from '../types/weight';
import { BodyComposition, BodybuildingGoal } from '../types/bodybuilding';
import { differenceInDays, parseISO } from 'date-fns';

interface QuickStatsProps {
  weights: WeightEntry[];
  compositions: BodyComposition[];
  goals: BodybuildingGoal[];
  weightGoals: WeightGoal[];
}

export const QuickStats: React.FC<QuickStatsProps> = ({ weights, compositions, goals, weightGoals }) => {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-gray-700">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-blue-50">
            <Scale className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-semibold text-blue-900">{weights.length}</p>
            <p className="text-xs text-blue-600">Weigh-ins</p>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center p-3 rounded-lg bg-purple-50" aria-label="Body scans with body fat percentage">
                <BarChart3 className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <p className="text-lg font-semibold text-purple-900">{compositions.filter(c => c.bodyFatPercentage != null).length}</p>
                <p className="text-xs text-purple-600">Body Fat Scans</p>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              Counts scans that include a body fat percentage.
            </TooltipContent>
          </Tooltip>
          
          <div className="text-center p-3 rounded-lg bg-green-50">
            <Target className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-semibold text-green-900">{weightGoals.filter(g => g.isActive).length}</p>
            <p className="text-xs text-green-600">Active Goals</p>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-orange-50">
            <Zap className="h-6 w-6 text-orange-600 mx-auto mb-1" />
            <p className="text-lg font-semibold text-orange-900">
              {weights.length > 0 ? Math.abs(differenceInDays(new Date(), parseISO(weights[0].date))) : 0}
            </p>
            <p className="text-xs text-orange-600">Days Tracking</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
