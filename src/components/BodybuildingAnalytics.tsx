
import React from 'react';
import { WeightEntry } from '../types/weight';
import { BodyComposition, BodybuildingGoal, StrengthRecord } from '../types/bodybuilding';
import { format, parseISO, differenceInDays } from 'date-fns';
import { PhaseProgressCard } from './PhaseProgressCard';
import { BodyCompositionTrends } from './BodyCompositionTrends';
import { SymmetryAnalysis } from './SymmetryAnalysis';
import { QuickStats } from './QuickStats';

interface BodybuildingAnalyticsProps {
  weights: WeightEntry[];
  compositions: BodyComposition[];
  goals: BodybuildingGoal[];
  strengthRecords?: StrengthRecord[];
}

export const BodybuildingAnalytics: React.FC<BodybuildingAnalyticsProps> = ({
  weights,
  compositions,
  goals,
  strengthRecords = []
}) => {
  // Prepare data for body composition chart
  const bodyCompData = compositions.map(comp => ({
    date: format(parseISO(comp.date), 'MMM dd'),
    fullDate: comp.date,
    timestamp: new Date(comp.date).getTime(),
    bodyFat: comp.bodyFatPercentage || 0,
    muscleMass: comp.muscleMass || 0,
    weight: weights.find(w => w.date === comp.date)?.weight || 0
  })).sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  // Calculate symmetry analysis
  const calculateSymmetryAnalysis = () => {
    if (compositions.length === 0) return null;
    
    const latestComp = compositions[compositions.length - 1];
    const measurements = latestComp.measurements;
    
    const symmetryData = [];
    if (measurements.leftArm && measurements.rightArm) {
      const diff = Math.abs(measurements.leftArm - measurements.rightArm);
      const avg = (measurements.leftArm + measurements.rightArm) / 2;
      symmetryData.push({
        muscle: 'Arms',
        difference: diff,
        asymmetryPercent: (diff / avg) * 100,
        left: measurements.leftArm,
        right: measurements.rightArm
      });
    }
    
    if (measurements.leftThigh && measurements.rightThigh) {
      const diff = Math.abs(measurements.leftThigh - measurements.rightThigh);
      const avg = (measurements.leftThigh + measurements.rightThigh) / 2;
      symmetryData.push({
        muscle: 'Thighs',
        difference: diff,
        asymmetryPercent: (diff / avg) * 100,
        left: measurements.leftThigh,
        right: measurements.rightThigh
      });
    }
    
    return symmetryData;
  };

  // Calculate phase progress for all active goals
  const calculateActivePhaseProgress = () => {
    const activeGoals = goals.filter(goal => goal.isActive);
    if (activeGoals.length === 0) return [];

    return activeGoals.map(goal => {
      const daysInPhase = differenceInDays(new Date(), parseISO(goal.createdAt));
      const totalPhaseDays = differenceInDays(parseISO(goal.targetDate), parseISO(goal.createdAt));
      const progressPercent = Math.min(100, (daysInPhase / totalPhaseDays) * 100);

      return {
        id: goal.id,
        phase: goal.phase,
        name: goal.name,
        daysInPhase,
        totalDays: totalPhaseDays,
        progressPercent,
        remainingDays: Math.max(0, totalPhaseDays - daysInPhase)
      };
    });
  };

  // Calculate body composition trends
  const calculateBodyCompTrends = () => {
    if (compositions.length < 2) return null;

    const first = compositions[0];
    const latest = compositions[compositions.length - 1];
    
    const bodyFatChange = (latest.bodyFatPercentage || 0) - (first.bodyFatPercentage || 0);
    const muscleMassChange = (latest.muscleMass || 0) - (first.muscleMass || 0);
    
    return {
      bodyFatChange,
      muscleMassChange,
      timeSpan: differenceInDays(parseISO(latest.date), parseISO(first.date))
    };
  };

  const symmetryAnalysis = calculateSymmetryAnalysis();
  const activePhaseProgress = calculateActivePhaseProgress();
  const bodyCompTrends = calculateBodyCompTrends();

  return (
    <div className="space-y-6">
      {/* Multiple Phase Progress Cards */}
      {activePhaseProgress.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Active Phase Progress</h2>
          {activePhaseProgress.map((phaseProgress) => (
            <PhaseProgressCard key={phaseProgress.id} phaseProgress={phaseProgress} />
          ))}
        </div>
      )}

      {/* Body Composition Trends */}
      <BodyCompositionTrends 
        bodyCompData={bodyCompData}
        bodyCompTrends={bodyCompTrends}
      />

      {/* Symmetry Analysis */}
      <SymmetryAnalysis symmetryAnalysis={symmetryAnalysis} />

      {/* Quick Stats */}
      <QuickStats 
        weights={weights}
        compositions={compositions}
        goals={goals}
      />
    </div>
  );
};
