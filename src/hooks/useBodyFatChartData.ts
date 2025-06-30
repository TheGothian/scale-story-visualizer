
import { useMemo } from 'react';
import { BodyComposition } from '../types/bodybuilding';
import { format, parseISO } from 'date-fns';
import { calculateIIRFilter } from '../utils/calculations';

export const useBodyFatChartData = (compositions: BodyComposition[]) => {
  const processedData = useMemo(() => {
    // Filter compositions that have body fat data
    const validCompositions = compositions.filter(comp => comp.bodyFatPercentage && comp.bodyFatPercentage > 0);
    
    if (validCompositions.length === 0) {
      return { chartData: [], iirChartData: [] };
    }

    // Sort by date
    const sortedCompositions = [...validCompositions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Process chart data
    const chartData = sortedCompositions.map((comp, index) => ({
      ...comp,
      bodyFat: comp.bodyFatPercentage,
      date: format(parseISO(comp.date), 'MMM dd'),
      fullDate: comp.date,
      index
    }));

    // Calculate IIR filtered data for body fat
    const bodyFatValues = sortedCompositions.map(comp => comp.bodyFatPercentage!);
    const iirFilteredBodyFat = calculateIIRFilter(
      sortedCompositions.map(comp => ({ 
        weight: comp.bodyFatPercentage!, 
        date: comp.date, 
        id: comp.id,
        unit: '%'
      })), 
      0.3
    );

    // Combine original data with IIR filtered data
    const iirChartData = chartData.map((entry, index) => ({
      ...entry,
      iirFiltered: iirFilteredBodyFat[index] ? Number(iirFilteredBodyFat[index].toFixed(2)) : undefined
    }));

    return { chartData, iirChartData };
  }, [compositions]);

  return processedData;
};
