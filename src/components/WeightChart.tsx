
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { WeightEntry } from '../types/weight';
import { format, parseISO } from 'date-fns';
import { calculateTrend } from '../utils/calculations';
import { useUnit } from '../contexts/UnitContext';
import { WeightChartDot } from './WeightChartDot';
import { WeightEditDialog } from './WeightEditDialog';
import { useWeightChart } from '../hooks/useWeightChart';

interface WeightChartProps {
  weights: WeightEntry[];
  onDeleteWeight: (id: string) => void;
  onEditWeight: (id: string, updatedEntry: Partial<WeightEntry>) => void;
}

export const WeightChart: React.FC<WeightChartProps> = ({ weights, onDeleteWeight, onEditWeight }) => {
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
        </CardHeader>
        <CardContent>
          {weights.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No weight entries yet. Start by logging your first weight!</p>
            </div>
          ) : (
            <div className="h-80" onClick={handleChartClick}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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
                  
                  {/* Actual weight line */}
                  <Line
                    type="monotone"
                    dataKey="displayWeight"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={<CustomDot />}
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
