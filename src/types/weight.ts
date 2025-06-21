
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
}

export interface SavedPrediction {
  id: string;
  name: string;
  targetDate: string;
  predictedWeight: number;
  unit: 'kg' | 'lbs';
  createdAt: string;
}

export type UnitSystem = 'metric' | 'imperial';
