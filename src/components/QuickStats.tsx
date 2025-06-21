
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, BarChart3, Target, Zap } from 'lucide-react';
import { WeightEntry } from '../types/weight';
import { BodyComposition, BodybuildingGoal } from '../types/bodybuilding';
import { differenceInDays, parseISO } from 'date-fns';

interface QuickStatsProps {
  weights: WeightEntry[];
  compositions: BodyComposition[];
  goals: BodybuildingGoal[];
}

export const QuickStats: React.FC<QuickStatsProps> = ({ weights, compositions, goals }) => {
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
          
          <div className="text-center p-3 rounded-lg bg-purple-50">
            <BarChart3 className="h-6 w-6 text-purple-600 mx-auto mb-1" />
            <p className="text-lg font-semibold text-purple-900">{compositions.length}</p>
            <p className="text-xs text-purple-600">Body Scans</p>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-green-50">
            <Target className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-semibold text-green-900">{goals.filter(g => g.isActive).length}</p>
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
