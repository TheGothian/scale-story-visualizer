
import { WeightEntry, TrendData } from '../types/weight';
import { parseISO, differenceInDays } from 'date-fns';

export const calculateTrend = (weights: WeightEntry[]): TrendData => {
  if (weights.length < 2) {
    return {
      slope: 0,
      intercept: 0,
      rSquared: 0,
      weeklyChange: 0,
      monthlyChange: 0
    };
  }

  // Sort weights by date
  const sortedWeights = [...weights].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Convert dates to days since first entry
  const firstDate = parseISO(sortedWeights[0].date);
  const dataPoints = sortedWeights.map(entry => ({
    x: differenceInDays(parseISO(entry.date), firstDate),
    y: entry.weight
  }));

  // Calculate linear regression
  const n = dataPoints.length;
  const sumX = dataPoints.reduce((sum, point) => sum + point.x, 0);
  const sumY = dataPoints.reduce((sum, point) => sum + point.y, 0);
  const sumXY = dataPoints.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumXX = dataPoints.reduce((sum, point) => sum + point.x * point.x, 0);
  const sumYY = dataPoints.reduce((sum, point) => sum + point.y * point.y, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared
  const meanY = sumY / n;
  const totalSumSquares = dataPoints.reduce((sum, point) => sum + Math.pow(point.y - meanY, 2), 0);
  const residualSumSquares = dataPoints.reduce((sum, point) => {
    const predicted = slope * point.x + intercept;
    return sum + Math.pow(point.y - predicted, 2);
  }, 0);
  const rSquared = totalSumSquares > 0 ? 1 - (residualSumSquares / totalSumSquares) : 0;

  return {
    slope,
    intercept,
    rSquared: Math.max(0, rSquared),
    weeklyChange: slope * 7,
    monthlyChange: slope * 30
  };
};

export const predictWeight = (weights: WeightEntry[], daysFromNow: number): number => {
  if (weights.length < 2) {
    return weights[weights.length - 1]?.weight || 0;
  }

  const trend = calculateTrend(weights);
  const latestWeight = weights[weights.length - 1].weight;
  
  // Simple linear prediction based on current trend
  const predictedWeight = latestWeight + (trend.slope * daysFromNow);
  
  return Math.max(0, predictedWeight); // Ensure weight doesn't go negative
};
