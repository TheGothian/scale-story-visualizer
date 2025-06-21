
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight, X } from 'lucide-react';
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
  onDeletePrediction: (id: string) => void;
}

export const WeightChart: React.FC<WeightChartProps> = ({ 
  weights, 
  savedPredictions = [], 
  onDeleteWeight, 
  onEditWeight,
  onDeletePrediction 
}) => {
  const { unitSystem, getWeightUnit, convertWeight } = useUnit();
  const currentUnit = unitSystem === 'metric' ? 'kg' : 'lbs';
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
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

  // Move all useEffect hooks to the top, before any conditional returns
  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
      setTimeout(checkScrollButtons, 300);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
      setTimeout(checkScrollButtons, 300);
    }
  };

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
  const combinedData = [...chartData, ...predictionData].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // This useEffect must be called on every render, regardless of data state
  useEffect(() => {
    if (combinedData.length > 0) {
      checkScrollButtons();
      const container = scrollContainerRef.current;
      if (container) {
        container.addEventListener('scroll', checkScrollButtons);
        return () => container.removeEventListener('scroll', checkScrollButtons);
      }
    }
  }, [combinedData]);

  // Debug logging
  console.log('WeightChart render - weights:', weights?.length || 0, 'predictions:', savedPredictions?.length || 0);

  // Early return for no data with better error handling
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

  // Calculate trend once to avoid repeated calculations
  let trend = null;
  try {
    trend = weights.length > 1 ? calculateTrend(weights) : null;
    console.log('Calculated trend:', trend);
  } catch (error) {
    console.error('Error calculating trend:', error);
  }

  console.log('Processed chartData:', chartData.length);
  console.log('Processed predictionData:', predictionData.length);
  console.log('Combined data for chart:', combinedData.length);

  // Calculate weight change safely
  const latestWeight = weights[weights.length - 1];
  const previousWeight = weights[weights.length - 2];
  
  let weightChange = 0;
  if (latestWeight && previousWeight) {
    try {
      const latestDisplay = convertWeight(latestWeight.weight, latestWeight.unit, currentUnit);
      const previousDisplay = convertWeight(previousWeight.weight, previousWeight.unit, currentUnit);
      weightChange = latestDisplay - previousDisplay;
    } catch (error) {
      console.error('Error calculating weight change:', error);
    }
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
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
                onClick={(e) => handleDeletePrediction(data.id, e)}
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
          {data.note && (
            <p className="text-gray-600 text-xs mt-1 bg-gray-50 p-1 rounded">{data.note}</p>
          )}
        </div>
      );
    }
    return null;
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
              {combinedData.length > 8 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={scrollLeft}
                    disabled={!canScrollLeft}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={scrollRight}
                    disabled={!canScrollRight}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          {savedPredictions.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Predictions (click red × to delete)</span>
              </div>
            </div>
          )}
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
