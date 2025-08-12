
import React from 'react';

interface GoalLine {
  id: string;
  name: string;
  targetWeight: number;
  color?: string;
}

interface WeightChartLegendProps {
  hasData: boolean;
  hasPredictions: boolean;
  goalLines: GoalLine[];
  showIIR: boolean;
  onToggleIIR: () => void;
  visibleGoalIds: string[];
  onToggleGoal: (id: string) => void;
}

export const WeightChartLegend: React.FC<WeightChartLegendProps> = ({
  hasData,
  hasPredictions,
  goalLines,
  showIIR,
  onToggleIIR,
  visibleGoalIds,
  onToggleGoal,
}) => {
  if (!hasData) return null;

  const goalColors = ['#ef4444', '#f97316', '#84cc16', '#06b6d4', '#8b5cf6', '#ec4899'];
  const visibleSet = new Set(visibleGoalIds);

  const chipBase = 'flex items-center gap-1 px-2 py-1 rounded-full border text-xs select-none cursor-pointer';

  return (
    <div className="flex items-center gap-2 text-xs text-gray-600 mt-2 flex-wrap">
      <div className={chipBase} aria-pressed={true} role="button">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <span>Actual Weight</span>
      </div>

      <button
        type="button"
        onClick={onToggleIIR}
        className={`${chipBase} ${showIIR ? '' : 'opacity-50 line-through'}`}
        aria-pressed={showIIR}
      >
        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
        <span>IIR Filter (α=0.3)</span>
      </button>

      {hasPredictions && (
        <div className={chipBase} aria-pressed={true} role="button">
          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
          <span>Predictions</span>
        </div>
      )}

      {goalLines.map((goal, index) => {
        const active = visibleSet.has(goal.id);
        const color = goalColors[index % goalColors.length];
        return (
          <button
            key={goal.id}
            type="button"
            onClick={() => onToggleGoal(goal.id)}
            className={`${chipBase} ${active ? '' : 'opacity-50 line-through'}`}
            aria-pressed={active}
          >
            <div
              className="w-3 h-0.5"
              style={{ backgroundColor: color, borderTop: `2px dashed ${color}` }}
            />
            <span>{goal.name}</span>
          </button>
        );
      })}
    </div>
  );
};
