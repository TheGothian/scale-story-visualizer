
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useUnit } from '../contexts/UnitContext';

interface WeightChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  onDeletePrediction: (predictionId: string, event: React.MouseEvent) => void;
}

export const WeightChartTooltip: React.FC<WeightChartTooltipProps> = ({
  active,
  payload,
  label,
  onDeletePrediction
}) => {
  const { getWeightUnit } = useUnit();

  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  
  if (data.isPrediction) {
    return (
      <div className="bg-white p-3 border border-amber-200 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-1">
          <p className="font-semibold text-sm text-amber-800">{data.predictionName}</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={(e) => onDeletePrediction(data.id, e)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-amber-600 font-medium">{`${data.displayWeight.toFixed(1)} ${getWeightUnit()}`}</p>
        <p className="text-xs text-amber-600">Predicted for {format(parseISO(data.date), 'MMM dd, yyyy')}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-sm">{format(parseISO(data.date), 'MMM dd, yyyy')}</p>
      <p className="text-blue-600 font-medium">{`${data.displayWeight.toFixed(1)} ${getWeightUnit()}`}</p>
      {data.iirFiltered && (
        <p className="text-purple-600 font-medium">{`IIR Filtered: ${data.iirFiltered.toFixed(1)} ${getWeightUnit()}`}</p>
      )}
      {data.note && (
        <p className="text-gray-600 text-xs mt-1 bg-gray-50 p-1 rounded">{data.note}</p>
      )}
    </div>
  );
};
