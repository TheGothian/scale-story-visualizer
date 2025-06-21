
export interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  note?: string;
  unit: 'kg' | 'lbs';
}

export interface TrendData {
  slope: number;
  intercept: number;
  rSquared: number;
  weeklyChange: number;
  monthlyChange: number;
  volatility: number;
  acceleration: number;
  movingAverage7: number[];
  movingAverage30: number[];
  longestStreak: {
    type: 'loss' | 'gain' | 'stable';
    count: number;
    current: boolean;
  };
  plateauDetection: {
    isInPlateau: boolean;
    plateauDays: number;
  };
  dayOfWeekPattern: {
    [key: string]: number;
  };
}

export interface SavedPrediction {
  id: string;
  name: string;
  targetDate: string;
  predictedWeight: number;
  unit: 'kg' | 'lbs';
  createdAt: string;
}

export interface WeightGoal {
  id: string;
  name: string;
  targetWeight: number;
  targetDate: string;
  description?: string;
  unit: 'kg' | 'lbs';
  createdAt: string;
  isActive: boolean;
}

export type UnitSystem = 'metric' | 'imperial';
