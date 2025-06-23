
import React from 'react';
import { SavedPrediction } from '../types/weight';

interface WeightChartLegendProps {
  hasData: boolean;
  hasTrend: boolean;
  hasPredictions: boolean;
}

export const WeightChartLegend: React.FC<WeightChartLegendProps> = ({
  hasData,
  hasTrend,
  hasPredictions
}) => {
  if (!hasData) return null;

  return (
    <div className="flex items-center gap-4 text-xs text-gray-600 mt-2">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <span>Actual Weight</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
        <span>IIR Filter (α=0.3)</span>
      </div>
      {hasTrend && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Trend Line</span>
        </div>
      )}
      {hasPredictions && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
          <span>Predictions (click red × to delete)</span>
        </div>
      )}
    </div>
  );
};
