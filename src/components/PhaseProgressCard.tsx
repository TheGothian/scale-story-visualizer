
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { differenceInDays, parseISO } from 'date-fns';

interface PhaseProgress {
  id: string;
  phase: string;
  name: string;
  daysInPhase: number;
  totalDays: number;
  progressPercent: number;
  remainingDays: number;
}

interface PhaseProgressCardProps {
  phaseProgress: PhaseProgress;
}

const getPhaseColor = (phase: string) => {
  switch (phase) {
    case 'cutting':
      return { bg: 'from-red-500 to-red-600', light: 'from-red-50 to-red-100', text: 'text-red-700' };
    case 'bulking':
      return { bg: 'from-green-500 to-green-600', light: 'from-green-50 to-green-100', text: 'text-green-700' };
    case 'maintenance':
      return { bg: 'from-blue-500 to-blue-600', light: 'from-blue-50 to-blue-100', text: 'text-blue-700' };
    case 'contest-prep':
      return { bg: 'from-purple-500 to-purple-600', light: 'from-purple-50 to-purple-100', text: 'text-purple-700' };
    default:
      return { bg: 'from-orange-500 to-orange-600', light: 'from-orange-50 to-orange-100', text: 'text-orange-700' };
  }
};

export const PhaseProgressCard: React.FC<PhaseProgressCardProps> = ({ phaseProgress }) => {
  const colors = getPhaseColor(phaseProgress.phase);

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className={colors.text}>
          {phaseProgress.name} - {phaseProgress.phase.charAt(0).toUpperCase() + phaseProgress.phase.slice(1).replace('-', ' ')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{phaseProgress.name}</h3>
              <p className="text-sm text-gray-600 capitalize">{phaseProgress.phase.replace('-', ' ')} Phase</p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${colors.text}`}>{phaseProgress.progressPercent.toFixed(0)}%</p>
              <p className="text-sm text-gray-600">Complete</p>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`bg-gradient-to-r ${colors.bg} h-3 rounded-full transition-all duration-300`}
              style={{ width: `${phaseProgress.progressPercent}%` }}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-blue-600">{phaseProgress.daysInPhase}</p>
              <p className="text-xs text-gray-600">Days In</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-green-600">{phaseProgress.remainingDays}</p>
              <p className="text-xs text-gray-600">Days Left</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-purple-600">{phaseProgress.totalDays}</p>
              <p className="text-xs text-gray-600">Total Days</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
