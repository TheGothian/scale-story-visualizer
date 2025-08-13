
export interface BodyComposition {
  id: string;
  date: string;
  bodyFatPercentage?: number;
  muscleMass?: number;
  visceralFat?: number;
  waterPercentage?: number;
  boneMass?: number;
  metabolicAge?: number;
  measurements: BodyMeasurements;
  note?: string;
  createdAt: string;
}

export interface BodyMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  leftArm?: number;
  rightArm?: number;
  leftThigh?: number;
  rightThigh?: number;
  neck?: number;
  shoulders?: number;
  forearms?: number;
  calves?: number;
}

export interface BodybuildingGoal extends Omit<import('./weight').WeightGoal, 'targetWeight'> {
  phase: 'cutting' | 'bulking' | 'maintenance' | 'contest-prep';
  targetWeight?: number;
  targetBodyFat?: number;
  targetMuscleMass?: number;
  weeklyWeightTarget?: number; // kg/lbs per week
  caloricTarget?: number;
  proteinTarget?: number;
  metrics: string[]; // which metrics to track for this goal
}

export interface StrengthRecord {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  sets: number;
  date: string;
  unit: 'kg' | 'lbs';
  oneRepMax?: number;
  volume: number; // weight * reps * sets
  createdAt: string;
}

export interface BodybuildingAnalytics {
  bodyCompositionTrend: {
    bodyFatChange: number;
    muscleMassChange: number;
    leanMassRatio: number;
  };
  strengthProgression: {
    totalVolumeChange: number;
    strengthGains: { [exercise: string]: number };
    progressionRate: number;
  };
  phaseProgress: {
    currentPhase: string;
    daysInPhase: number;
    phaseGoalProgress: number;
    recommendedAdjustments: string[];
  };
  symmetryAnalysis: {
    leftRightBalance: { [measurement: string]: number };
    proportionRatios: { [ratio: string]: number };
    asymmetryScore: number;
  };
}
