
import { useMemo } from 'react';
import { WeightEntry, SavedPrediction } from '../types/weight';
import { format, parseISO } from 'date-fns';
import { calculateTrend, calculateIIRFilter } from '../utils/calculations';
import { useUnit } from '../contexts/UnitContext';

export const useWeightChartData = (weights: WeightEntry[], savedPredictions: SavedPrediction[]) => {
  const { unitSystem, convertWeight } = useUnit();
  const currentUnit = unitSystem === 'metric' ? 'kg' : 'lbs';

  const processedData = useMemo(() => {
    // Process chart data only if weights exist
    const chartData = weights?.length > 0 ? weights.map((entry, index) => {
      try {
        const displayWeight = convertWeight(entry.weight, entry.unit, currentUnit);
        const trend = weights.length > 1 ? calculateTrend(weights) : null;
        const trendValue = trend ? (trend.slope * index + trend.intercept) : displayWeight;
        
        return {
          ...entry,
          displayWeight: Number(displayWeight.toFixed(2)),
          index,
          formattedDate: format(parseISO(entry.date), 'MMM dd'),
          trend: Number(trendValue.toFixed(2))
        };
      } catch (error) {
        console.error('Error processing weight entry:', entry, error);
        return null;
      }
    }).filter(Boolean) : [];

    // Calculate IIR filtered data
    const iirFilteredWeights = weights?.length > 0 ? calculateIIRFilter(weights, 0.3) : [];
    const iirChartData = chartData.map((entry, index) => {
      if (entry && iirFilteredWeights[index] !== undefined) {
        const displayFilteredWeight = convertWeight(iirFilteredWeights[index], entry.unit, currentUnit);
        return {
          ...entry,
          iirFiltered: Number(displayFilteredWeight.toFixed(2))
        };
      }
      return entry;
    });

    // Process prediction data
    const predictionData = savedPredictions?.length > 0 ? savedPredictions.map(prediction => {
      try {
        const displayWeight = convertWeight(prediction.predictedWeight, prediction.unit, currentUnit);
        return {
          id: prediction.id,
          weight: prediction.predictedWeight,
          displayWeight: Number(displayWeight.toFixed(2)),
          date: prediction.targetDate,
          formattedDate: format(parseISO(prediction.targetDate), 'MMM dd'),
          isPrediction: true,
          predictionName: prediction.name
        };
      } catch (error) {
        console.error('Error processing prediction:', prediction, error);
        return null;
      }
    }).filter(Boolean) : [];

    // Combine and sort data
    const combinedData = [...iirChartData, ...predictionData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return { chartData, iirChartData, predictionData, combinedData };
  }, [weights, savedPredictions, currentUnit, convertWeight]);

  const trend = useMemo(() => {
    try {
      return weights.length > 1 ? calculateTrend(weights) : null;
    } catch (error) {
      console.error('Error calculating trend:', error);
      return null;
    }
  }, [weights]);

  const weightChange = useMemo(() => {
    if (weights.length < 2) return 0;
    
    const latestWeight = weights[weights.length - 1];
    const previousWeight = weights[weights.length - 2];
    
    try {
      const latestDisplay = convertWeight(latestWeight.weight, latestWeight.unit, currentUnit);
      const previousDisplay = convertWeight(previousWeight.weight, previousWeight.unit, currentUnit);
      return latestDisplay - previousDisplay;
    } catch (error) {
      console.error('Error calculating weight change:', error);
      return 0;
    }
  }, [weights, currentUnit, convertWeight]);

  return {
    ...processedData,
    trend,
    weightChange,
    latestWeight: weights[weights.length - 1]
  };
};
