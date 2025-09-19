import { WeightEntry, TrendData } from "../types/weight";
import { parseISO, differenceInDays, format } from "date-fns";

// Generic interface for IIR filter data
interface FilterableData {
  id: string;
  weight: number;
  date: string;
  unit: string;
}

export const calculateIIRFilter = (
  weights: WeightEntry[],
  alpha: number = 0.3
): number[] => {
  if (weights.length === 0) return [];

  const sortedWeights = [...weights].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const filtered: number[] = [];

  // Initialize with first weight value
  filtered[0] = sortedWeights[0].weight;

  // Apply IIR filter: y[n] = α * x[n] + (1 - α) * y[n-1]
  for (let i = 1; i < sortedWeights.length; i++) {
    filtered[i] =
      alpha * sortedWeights[i].weight + (1 - alpha) * filtered[i - 1];
  }

  return filtered;
};

// Generic IIR filter that can work with any data type
export const calculateGenericIIRFilter = (
  data: FilterableData[],
  alpha: number = 0.3
): number[] => {
  if (data.length === 0) return [];

  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const filtered: number[] = [];

  // Initialize with first data value
  filtered[0] = sortedData[0].weight;

  // Apply IIR filter: y[n] = α * x[n] + (1 - α) * y[n-1]
  for (let i = 1; i < sortedData.length; i++) {
    filtered[i] = alpha * sortedData[i].weight + (1 - alpha) * filtered[i - 1];
  }

  return filtered;
};

export const calculateTrend = (weights: WeightEntry[]): TrendData => {
  if (weights.length < 2) {
    return {
      slope: 0,
      intercept: 0,
      rSquared: 0,
      weeklyChange: 0,
      monthlyChange: 0,
      volatility: 0,
      acceleration: 0,
      movingAverage7: [],
      movingAverage30: [],
      longestStreak: { type: "stable", count: 0, current: false },
      plateauDetection: { isInPlateau: false, plateauDays: 0 },
      dayOfWeekPattern: {},
    };
  }

  // Sort weights by date
  const sortedWeights = [...weights].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Convert dates to days since first entry
  const firstDate = parseISO(sortedWeights[0].date);
  const dataPoints = sortedWeights.map((entry) => ({
    x: differenceInDays(parseISO(entry.date), firstDate),
    y: entry.weight,
    date: parseISO(entry.date),
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
  const totalSumSquares = dataPoints.reduce(
    (sum, point) => sum + Math.pow(point.y - meanY, 2),
    0
  );
  const residualSumSquares = dataPoints.reduce((sum, point) => {
    const predicted = slope * point.x + intercept;
    return sum + Math.pow(point.y - predicted, 2);
  }, 0);
  const rSquared =
    totalSumSquares > 0 ? 1 - residualSumSquares / totalSumSquares : 0;

  // Calculate volatility (standard deviation of changes)
  const changes = dataPoints
    .slice(1)
    .map((point, i) => point.y - dataPoints[i].y);
  const meanChange =
    changes.reduce((sum, change) => sum + change, 0) / changes.length;
  const volatility = Math.sqrt(
    changes.reduce((sum, change) => sum + Math.pow(change - meanChange, 2), 0) /
      changes.length
  );

  // Calculate acceleration (change in slope over time)
  let acceleration = 0;
  if (dataPoints.length >= 4) {
    const mid = Math.floor(dataPoints.length / 2);
    const firstHalf = dataPoints.slice(0, mid);
    const secondHalf = dataPoints.slice(mid);

    const slope1 = calculateSimpleSlope(firstHalf);
    const slope2 = calculateSimpleSlope(secondHalf);
    acceleration = slope2 - slope1;
  }

  // Calculate moving averages
  const movingAverage7 = calculateMovingAverage(
    dataPoints.map((p) => p.y),
    7
  );
  const movingAverage30 = calculateMovingAverage(
    dataPoints.map((p) => p.y),
    30
  );

  // Calculate streaks
  const longestStreak = calculateLongestStreak(dataPoints.map((p) => p.y));

  // Plateau detection
  const plateauDetection = detectPlateau(dataPoints.map((p) => p.y));

  // Day of week pattern
  const dayOfWeekPattern = calculateDayOfWeekPattern(sortedWeights);

  return {
    slope,
    intercept,
    rSquared: Math.max(0, rSquared),
    weeklyChange: slope * 7,
    monthlyChange: slope * 30,
    volatility,
    acceleration,
    movingAverage7,
    movingAverage30,
    longestStreak,
    plateauDetection,
    dayOfWeekPattern,
  };
};

const calculateSimpleSlope = (points: { x: number; y: number }[]): number => {
  if (points.length < 2) return 0;
  const n = points.length;
  const sumX = points.reduce((sum, point) => sum + point.x, 0);
  const sumY = points.reduce((sum, point) => sum + point.y, 0);
  const sumXY = points.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumXX = points.reduce((sum, point) => sum + point.x * point.x, 0);
  return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
};

const calculateMovingAverage = (
  data: number[],
  windowSize: number
): number[] => {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = data.slice(start, i + 1);
    const average = window.reduce((sum, val) => sum + val, 0) / window.length;
    result.push(average);
  }
  return result;
};

const calculateLongestStreak = (weights: number[]) => {
  if (weights.length < 2)
    return { type: "stable" as const, count: 0, current: false };

  let longestStreak: {
    type: "loss" | "gain" | "stable";
    count: number;
    current: boolean;
  } = { type: "stable", count: 0, current: false };
  let currentStreak: { type: "loss" | "gain" | "stable"; count: number } = {
    type: "stable",
    count: 1,
  };

  for (let i = 1; i < weights.length; i++) {
    const diff = weights[i] - weights[i - 1];
    const changeType: "loss" | "gain" | "stable" =
      diff > 0.1 ? "gain" : diff < -0.1 ? "loss" : "stable";

    if (changeType === currentStreak.type) {
      currentStreak.count++;
    } else {
      if (currentStreak.count > longestStreak.count) {
        longestStreak = { ...currentStreak, current: false };
      }
      currentStreak = { type: changeType, count: 1 };
    }
  }

  // Check if current streak is the longest
  if (currentStreak.count > longestStreak.count) {
    longestStreak = { ...currentStreak, current: true };
  } else if (
    currentStreak.count === longestStreak.count &&
    currentStreak.type === longestStreak.type
  ) {
    longestStreak.current = true;
  }

  return longestStreak;
};

const detectPlateau = (weights: number[]) => {
  if (weights.length < 7) return { isInPlateau: false, plateauDays: 0 };

  const recentWeights = weights.slice(-7);
  const maxWeight = Math.max(...recentWeights);
  const minWeight = Math.min(...recentWeights);
  const range = maxWeight - minWeight;

  // Consider it a plateau if the range is less than 1 unit over the last 7 entries
  const isInPlateau = range < 1;
  const plateauDays = isInPlateau ? 7 : 0;

  return { isInPlateau, plateauDays };
};

const calculateDayOfWeekPattern = (weights: WeightEntry[]) => {
  const dayPattern: { [key: string]: number[] } = {
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  };

  weights.forEach((entry) => {
    const dayName = format(parseISO(entry.date), "EEEE");
    if (dayPattern[dayName]) {
      dayPattern[dayName].push(entry.weight);
    }
  });

  const averagePattern: { [key: string]: number } = {};
  Object.entries(dayPattern).forEach(([day, weights]) => {
    averagePattern[day] =
      weights.length > 0
        ? weights.reduce((sum, w) => sum + w, 0) / weights.length
        : 0;
  });

  return averagePattern;
};

export const predictWeight = (
  weights: WeightEntry[],
  daysFromNow: number
): number => {
  if (weights.length < 2) {
    return weights[weights.length - 1]?.weight || 0;
  }

  const trend = calculateTrend(weights);
  const latestWeight = weights[weights.length - 1].weight;

  // Simple linear prediction based on current trend
  const predictedWeight = latestWeight + trend.slope * daysFromNow;

  return Math.max(0, predictedWeight); // Ensure weight doesn't go negative
};

// Filter weights from a specific start date onwards
export const filterWeightsByStartDate = (
  weights: WeightEntry[],
  startDate: string
): WeightEntry[] => {
  const startDateTime = parseISO(startDate);
  return weights.filter((weight) => parseISO(weight.date) >= startDateTime);
};
