
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { WeightEntry, SavedPrediction } from '../types/weight';
import { format, parseISO } from 'date-fns';
import { calculateTrend } from '../utils/calculations';
import { useUnit } from '../contexts/UnitContext';
import { WeightChartDot } from './WeightChartDot';
import { WeightEditDialog } from './WeightEditDialog';
import { useWeightChart } from '../hooks/useWeightChart';

interface WeightChartProps {
  weights: WeightEntry[];
  savedPredictions: SavedPrediction[];
  onDeleteWeight: (id: string) => void;
  onEditWeight: (id: string, updatedEntry: Partial<WeightEntry>) => void;
}

export const WeightChart: React.FC<WeightChartProps> = ({ 
  weights, 
  savedPredictions, 
  onDeleteWeight, 
  onEditWeight 
}) => {
  const { unitSystem, getWeightUnit, convertWeight } = useUnit();
  const currentUnit = unitSystem === 'metric' ? 'kg' : 'lbs';
  
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

  const chartData = weights.map((entry, index) => {
    const displayWeight = convertWeight(entry.weight, entry.unit, currentUnit);
    return {
      ...entry,
      displayWeight,
      index,
      formattedDate: format(parseISO(entry.date), 'MMM dd'),
      trend: weights.length > 1 ? calculateTrend(weights).slope * index + calculateTrend(weights).intercept : displayWeight
    };
  });

  // Add prediction points to chart data
  const predictionData = savedPredictions.map(prediction => {
    const displayWeight = convertWeight(prediction.predictedWeight, prediction.unit, currentUnit);
    return {
      id: prediction.id,
      weight: prediction.predictedWeight,
      displayWeight,
      date: prediction.targetDate,
      formattedDate: format(parseISO(prediction.targetDate), 'MMM dd'),
      isPrediction: true,
      predictionName: prediction.name
    };
  });

  // Combine actual weights and predictions for the chart
  const combinedData = [...chartData, ...predictionData].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const trend = weights.length > 1 ? calculateTrend(weights) : null;
  const latestWeight = weights[weights.length - 1];
  const previousWeight = weights[weights.length - 2];
  
  let weightChange = 0;
  if (latestWeight && previousWeight) {
    const latestDisplay = convertWeight(latestWeight.weight, latestWeight.unit, currentUnit);
    const previousDisplay = convertWeight(previousWeight.weight, previousWeight.unit, currentUnit);
    weightChange = latestDisplay - previousDisplay;
  }

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    
    // Special styling for prediction points
    if (payload.isPrediction) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="#f59e0b"
          stroke="#d97706"
          strokeWidth={2}
          className="cursor-pointer"
        />
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      if (data.isPrediction) {
        return (
          <div className="bg-white p-3 border border-amber-200 rounded-lg shadow-lg">
            <p className="font-semibold text-sm text-amber-800">{data.predictionName}</p>
            <p className="text-amber-600 font-medium">{`${data.displayWeight.toFixed(1)} ${getWeightUnit()}`}</p>
            <p className="text-xs text-amber-600">Predicted for {format(parseISO(data.date), 'MMM dd, yyyy')}</p>
          </div>
        );
      }
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-sm">{format(parseISO(data.date), 'MMM dd, yyyy')}</p>
          <p className="text-blue-600 font-medium">{`${data.displayWeight.toFixed(1)} ${getWeightUnit()}`}</p>
          {data.note && (
            <p className="text-gray-600 text-xs mt-1 bg-gray-50 p-1 rounded">{data.note}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-blue-700">Weight Progress</CardTitle>
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
          </div>
          {savedPredictions.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Predictions</span>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {weights.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No weight entries yet. Start by logging your first weight!</p>
            </div>
          ) : (
            <div className="h-80" onClick={handleChartClick}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedData}>
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
                  
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Actual weight line */}
                  <Line
                    type="monotone"
                    dataKey="displayWeight"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={<CustomDot />}
                    connectNulls={false}
                  />
                  
                  {/* Trend line */}
                  {trend && weights.length > 2 && (
                    <Line
                      type="monotone"
                      dataKey="trend"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      activeDot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
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
