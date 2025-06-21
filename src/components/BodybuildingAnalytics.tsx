
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Target, Activity, Scale, Zap, BarChart3, Users } from 'lucide-react';
import { WeightEntry } from '../types/weight';
import { BodyComposition, BodybuildingGoal, StrengthRecord } from '../types/bodybuilding';
import { useUnit } from '../contexts/UnitContext';
import { format, parseISO, differenceInDays } from 'date-fns';

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
  const { getWeightUnit, convertWeight } = useUnit();

  // Prepare data for body composition chart
  const bodyCompData = compositions.map(comp => ({
    date: format(parseISO(comp.date), 'MMM dd'),
    bodyFat: comp.bodyFatPercentage || 0,
    muscleMass: comp.muscleMass || 0,
    weight: weights.find(w => w.date === comp.date)?.weight || 0
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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

  // Get phase color based on phase type
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
          {activePhaseProgress.map((phaseProgress) => {
            const colors = getPhaseColor(phaseProgress.phase);
            return (
              <Card key={phaseProgress.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
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
          })}
        </div>
      )}

      {/* Body Composition Trends */}
      {bodyCompTrends && (
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

            {/* Body Composition Chart */}
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
      )}

      {/* Symmetry Analysis */}
      {symmetryAnalysis && symmetryAnalysis.length > 0 && (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-indigo-700">Symmetry Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {symmetryAnalysis.map((analysis, index) => (
                <div key={index} className="p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-indigo-600" />
                      <h4 className="font-semibold text-indigo-800">{analysis.muscle}</h4>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      analysis.asymmetryPercent < 2 ? 'bg-green-100 text-green-800' :
                      analysis.asymmetryPercent < 5 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {analysis.asymmetryPercent < 2 ? 'Excellent' :
                       analysis.asymmetryPercent < 5 ? 'Good' : 'Needs Work'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-blue-600">{analysis.left.toFixed(1)}</p>
                      <p className="text-xs text-gray-600">Left</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-purple-600">{analysis.difference.toFixed(1)}</p>
                      <p className="text-xs text-gray-600">Difference</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-blue-600">{analysis.right.toFixed(1)}</p>
                      <p className="text-xs text-gray-600">Right</p>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">
                      Asymmetry: {analysis.asymmetryPercent.toFixed(1)}%
                      {analysis.asymmetryPercent > 5 && ' - Consider unilateral training'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
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
      </div>
    );
  };
};
