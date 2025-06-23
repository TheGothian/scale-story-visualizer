
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { WeightEntry, SavedPrediction, WeightGoal } from '../types/weight';
import { useUnit } from '../contexts/UnitContext';
import { WeightChartDot } from './WeightChartDot';
import { WeightEditDialog } from './WeightEditDialog';
import { WeightChartTooltip } from './WeightChartTooltip';
import { WeightChartLegend } from './WeightChartLegend';
import { WeightChartScrollControls } from './WeightChartScrollControls';
import { useWeightChart } from '../hooks/useWeightChart';
import { useWeightChartData } from '../hooks/useWeightChartData';
import { useWeightChartScroll } from '../hooks/useWeightChartScroll';

interface WeightChartProps {
  weights: WeightEntry[];
  savedPredictions: SavedPrediction[];
  weightGoals: WeightGoal[];
  onDeleteWeight: (id: string) => void;
  onEditWeight: (id: string, updatedEntry: Partial<WeightEntry>) => void;
  onDeletePrediction: (id: string) => void;
}

export const WeightChart: React.FC<WeightChartProps> = ({ 
  weights, 
  savedPredictions = [], 
  weightGoals = [],
  onDeleteWeight, 
  onEditWeight,
  onDeletePrediction 
}) => {
  const { getWeightUnit, convertWeight, unitSystem } = useUnit();
  
  const {
    editWeight,
    setEditWeight,
    editNote,
    setEditNote,
    editDate,
    setEditDate,
    isEditDialogOpen,
    setIsEditDialogOpen,
    activeEntry,
    isPopoverOpen,
    handleEditClick,
    handleDeleteClick,
    handleSaveEdit,
    handleDotClick,
    handlePopoverOpenChange,
    handleChartClick,
  } = useWeightChart(onDeleteWeight, onEditWeight);

  const { combinedData, weightChange, latestWeight, goalLines } = useWeightChartData(weights, savedPredictions, weightGoals);
  
  const {
    scrollContainerRef,
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight
  } = useWeightChartScroll(combinedData.length);

  // Define colors for goal lines
  const goalColors = ['#ef4444', '#f97316', '#84cc16', '#06b6d4', '#8b5cf6', '#ec4899'];

  // Debug logging
  console.log('WeightChart render - weights:', weights?.length || 0, 'predictions:', savedPredictions?.length || 0, 'goals:', weightGoals?.length || 0);
  console.log('Goal lines to render:', goalLines);

  // Early return for no data
  if (!weights || weights.length === 0) {
    console.log('No weights data available');
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-blue-700">Weight Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <p>No weight entries yet. Start by logging your first weight!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle prediction deletion
  const handleDeletePrediction = (predictionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log('Deleting prediction:', predictionId);
    onDeletePrediction(predictionId);
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    
    if (!payload) return null;
    
    // Special styling for prediction points
    if (payload.isPrediction) {
      return (
        <g>
          <circle
            cx={cx}
            cy={cy}
            r={6}
            fill="#f59e0b"
            stroke="#d97706"
            strokeWidth={2}
            className="cursor-pointer"
          />
          <circle
            cx={cx + 12}
            cy={cy - 12}
            r={8}
            fill="#ef4444"
            stroke="#ffffff"
            strokeWidth={1}
            className="cursor-pointer hover:fill-red-600"
            onClick={(e) => handleDeletePrediction(payload.id, e)}
          />
          <text
            x={cx + 12}
            y={cy - 8}
            fill="white"
            fontSize="10"
            textAnchor="middle"
            className="cursor-pointer pointer-events-none"
          >
            ×
          </text>
        </g>
      );
    }
    
    const isActive = activeEntry === payload.id;
    
    return (
      <WeightChartDot
        cx={cx}
        cy={cy}
        payload={payload}
        isActive={isActive}
        isPopoverOpen={isPopoverOpen}
        onDotClick={handleDotClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        onPopoverOpenChange={handlePopoverOpenChange}
      />
    );
  };

  // Ensure we have valid data before rendering the chart
  if (combinedData.length === 0) {
    console.log('No combined data available for chart');
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-blue-700">Weight Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <p>Unable to process weight data. Please try refreshing the page.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-blue-700">Weight Progress</CardTitle>
            <div className="flex items-center gap-2">
              {latestWeight && (
                <div className="flex items-center gap-2 text-sm">
                  {weightChange > 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : weightChange < 0 ? (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  ) : (
                    <Minus className="h-4 w-4 text-gray-500" />
                  )}
                  <span className={weightChange > 0 ? 'text-red-500' : weightChange < 0 ? 'text-green-500' : 'text-gray-500'}>
                    {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} {getWeightUnit()}
                  </span>
                </div>
              )}
              <WeightChartScrollControls
                dataLength={combinedData.length}
                canScrollLeft={canScrollLeft}
                canScrollRight={canScrollRight}
                onScrollLeft={scrollLeft}
                onScrollRight={scrollRight}
              />
            </div>
          </div>
          <WeightChartLegend
            hasData={weights.length > 0}
            hasPredictions={savedPredictions.length > 0}
            goalLines={goalLines}
          />
        </CardHeader>
        <CardContent>
          <div 
            ref={scrollContainerRef}
            className="h-80 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            onClick={handleChartClick}
          >
            <div style={{ minWidth: Math.max(800, combinedData.length * 60) }}>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={combinedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis 
                    dataKey="formattedDate" 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  
                  <Tooltip content={(props) => (
                    <WeightChartTooltip {...props} onDeletePrediction={handleDeletePrediction} />
                  )} />
                  
                  {/* Goal reference lines */}
                  {goalLines.map((goal, index) => {
                    console.log(`Rendering goal line: ${goal.name} at ${goal.targetWeight} ${getWeightUnit()}`);
                    return (
                      <ReferenceLine
                        key={goal.id}
                        y={goal.targetWeight}
                        stroke={goalColors[index % goalColors.length]}
                        strokeDasharray="8 4"
                        strokeWidth={2}
                        label={{
                          value: goal.name,
                          position: "insideTopLeft",
                          fill: goalColors[index % goalColors.length],
                          fontSize: 10,
                          fontWeight: 600
                        }}
                      />
                    );
                  })}
                  
                  {/* Actual weight line */}
                  <Line
                    type="monotone"
                    dataKey="displayWeight"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={<CustomDot />}
                    connectNulls={false}
                  />
                  
                  {/* IIR Filtered line */}
                  <Line
                    type="monotone"
                    dataKey="iirFiltered"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <WeightEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        editWeight={editWeight}
        setEditWeight={setEditWeight}
        editNote={editNote}
        setEditNote={setEditNote}
        editDate={editDate}
        setEditDate={setEditDate}
        onSave={handleSaveEdit}
      />
    </>
  );
};
