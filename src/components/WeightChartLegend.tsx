
import React from 'react';

interface GoalLine {
  id: string;
  name: string;
  targetWeight: number;
  color: string;
}

interface WeightChartLegendProps {
  hasData: boolean;
  hasPredictions: boolean;
  goalLines: GoalLine[];
}

export const WeightChartLegend: React.FC<WeightChartLegendProps> = ({
  hasData,
  hasPredictions,
  goalLines
}) => {
  if (!hasData) return null;

  const goalColors = ['#ef4444', '#f97316', '#84cc16', '#06b6d4', '#8b5cf6', '#ec4899'];

  return (
    <div className="flex items-center gap-4 text-xs text-gray-600 mt-2 flex-wrap">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <span>Actual Weight</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
        <span>IIR Filter (α=0.3)</span>
      </div>
      {hasPredictions && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
          <span>Predictions (click red × to delete)</span>
        </div>
      )}
      {goalLines.map((goal, index) => (
        <div key={goal.id} className="flex items-center gap-1">
          <div 
            className="w-3 h-0.5" 
            style={{ 
              backgroundColor: goalColors[index % goalColors.length],
              borderTop: `2px dashed ${goalColors[index % goalColors.length]}`
            }}
          ></div>
          <span>{goal.name}</span>
        </div>
      ))}
    </div>
  );
};
