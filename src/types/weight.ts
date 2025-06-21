
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

export type UnitSystem = 'metric' | 'imperial';
