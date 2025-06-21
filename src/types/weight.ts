
export interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  note?: string;
}

export interface TrendData {
  slope: number;
  intercept: number;
  rSquared: number;
  weeklyChange: number;
  monthlyChange: number;
}
