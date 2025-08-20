
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine, ReferenceArea } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';
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
import { useIsMobile } from '../hooks/use-mobile';
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

  // Visibility toggles for IIR filter and goals
  const [showIIR, setShowIIR] = React.useState(true);
  const [visibleGoals, setVisibleGoals] = React.useState<Set<string>>(new Set(goalLines.map((g) => g.id)));

  React.useEffect(() => {
    // Initialize/refresh visible goals when goalLines change
    setVisibleGoals((prev) => {
      const next = new Set<string>();
      for (const g of goalLines) next.add(g.id);
      return next;
    });
  }, [goalLines]);

  const toggleIIR = () => setShowIIR((v) => !v);
  const toggleGoal = (id: string) => {
    setVisibleGoals((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

// Mobile detection
const isMobile = useIsMobile();

// Overall X-domain from data
const allTimestamps = React.useMemo(() => (
  combinedData.map((d: any) => d.timestamp).filter((t: any) => typeof t === 'number')
), [combinedData]);
const overallXMin = Math.min(...allTimestamps);
const overallXMax = Math.max(...allTimestamps);

// Zoom state (X domain)
const [xDomain, setXDomain] = React.useState<[number, number] | null>(null);
React.useEffect(() => {
  if (allTimestamps.length) setXDomain([overallXMin, overallXMax]);
}, [overallXMin, overallXMax, allTimestamps.length]);

// Desktop drag-to-zoom selection
const [refAreaLeft, setRefAreaLeft] = React.useState<number | null>(null);
const [refAreaRight, setRefAreaRight] = React.useState<number | null>(null);
const [isSelecting, setIsSelecting] = React.useState(false);

// Pinch-to-zoom (mobile)
const chartAreaRef = React.useRef<HTMLDivElement>(null);
const pointers = React.useRef<Map<number, number>>(new Map()); // pointerId -> clientX
const pinchStartDistance = React.useRef<number | null>(null);
const pinchStartDomain = React.useRef<[number, number] | null>(null);
const pinchCenterValue = React.useRef<number | null>(null);

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

  const currentXDomain: [number, number] = xDomain ?? [overallXMin, overallXMax];
  const dataInRange = combinedData.filter((d: any) => d.timestamp >= currentXDomain[0] && d.timestamp <= currentXDomain[1]);
  const yCandidates: number[] = dataInRange.reduce((acc: number[], d: any) => {
    if (typeof d.displayWeight === 'number') acc.push(d.displayWeight);
    if (showIIR && typeof d.iirFiltered === 'number') acc.push(d.iirFiltered);
    return acc;
  }, []);
  for (const g of goalLines) {
    if (visibleGoals.has(g.id) && typeof g.targetWeight === 'number') yCandidates.push(g.targetWeight);
  }
  const yMin = Math.min(...yCandidates);
  const yMax = Math.max(...yCandidates);
  const yPadding = 5;
  const yDomain: [number, number] = [Math.floor(yMin) - yPadding, Math.ceil(yMax) + yPadding];

  // Helpers and handlers for zoom
  const clampDomain = React.useCallback((d: [number, number]): [number, number] => {
    let [a, b] = d[0] <= d[1] ? d : [d[1], d[0]];
    const totalRange = overallXMax - overallXMin || 1;
    const minSpan = Math.max(totalRange / 100, 24 * 60 * 60 * 1000); // at least 1 day
    if (b - a < minSpan) {
      const mid = (a + b) / 2;
      a = mid - minSpan / 2;
      b = mid + minSpan / 2;
    }
    a = Math.max(overallXMin, a);
    b = Math.min(overallXMax, b);
    if (a >= b) return [overallXMin, overallXMax];
    return [a, b];
  }, [overallXMin, overallXMax]);

  const resetZoom = React.useCallback(() => {
    setXDomain([overallXMin, overallXMax]);
  }, [overallXMin, overallXMax]);

  const applySelectionZoom = React.useCallback(() => {
    if (refAreaLeft != null && refAreaRight != null) {
      const next = clampDomain([refAreaLeft, refAreaRight]);
      setXDomain(next);
    }
    setIsSelecting(false);
    setRefAreaLeft(null);
    setRefAreaRight(null);
  }, [refAreaLeft, refAreaRight, clampDomain]);

  // Convert mouse coordinates to chart data coordinates
  const getDataValueFromMouseX = React.useCallback((mouseX: number, chartContainer: HTMLElement): number => {
    const rect = chartContainer.getBoundingClientRect();
    
    // The scrollable container includes the Y-axis panel, so we need to account for it
    const yAxisWidth = 64; // Width of the fixed Y-axis panel
    const chartLeftMargin = 10; // Left margin from LineChart
    const chartRightMargin = 30; // Right margin from LineChart
    
    // Calculate the actual chart area within the scrollable container
    const chartStartX = yAxisWidth + chartLeftMargin;
    const chartEndX = rect.width - chartRightMargin;
    const chartWidth = chartEndX - chartStartX;
    
    // Calculate relative position within the chart area
    const mouseRelativeToContainer = mouseX - rect.left;
    const mouseRelativeToChart = mouseRelativeToContainer - chartStartX;
    const relativeX = mouseRelativeToChart / chartWidth;
    const clampedX = Math.max(0, Math.min(1, relativeX));
    
    // Convert to data coordinates
    const [domainStart, domainEnd] = currentXDomain;
    const dataValue = domainStart + clampedX * (domainEnd - domainStart);
    
    console.log('Mouse conversion:', { 
      mouseX, 
      rectLeft: rect.left, 
      mouseRelativeToContainer,
      mouseRelativeToChart,
      chartWidth,
      relativeX, 
      clampedX, 
      dataValue, 
      domainStart, 
      domainEnd 
    });
    
    return dataValue;
  }, [currentXDomain]);

  const handleMouseDown = (e: React.MouseEvent) => {
    console.log('Mouse down triggered');
    if (!scrollContainerRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    
    const dataValue = getDataValueFromMouseX(e.clientX, scrollContainerRef.current);
    console.log('Setting refAreaLeft to:', dataValue);
    setRefAreaLeft(dataValue);
    setRefAreaRight(null);
    setIsSelecting(true);
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !scrollContainerRef.current) return;
    console.log('Mouse move while selecting');
    e.preventDefault();
    
    const dataValue = getDataValueFromMouseX(e.clientX, scrollContainerRef.current);
    console.log('Setting refAreaRight to:', dataValue);
    setRefAreaRight(dataValue);
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    console.log('Mouse up triggered, applying zoom');
    e.preventDefault();
    document.body.style.userSelect = '';
    applySelectionZoom();
  };

  const handleMouseLeave = () => { 
    console.log('Mouse leave triggered');
    document.body.style.userSelect = '';
    if (isSelecting) applySelectionZoom(); 
  };

  // Pinch-to-zoom handlers (mobile) - updated to use scrollContainerRef
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as any).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, e.clientX);
    if (pointers.current.size === 2) {
      const xs = Array.from(pointers.current.values());
      const dist = Math.abs(xs[0] - xs[1]) || 1;
      pinchStartDistance.current = dist;
      pinchStartDomain.current = (xDomain ?? [overallXMin, overallXMax]);
      const centerX = (xs[0] + xs[1]) / 2;
      const rect = scrollContainerRef.current?.getBoundingClientRect();
      if (rect && pinchStartDomain.current) {
        const ratio = Math.min(Math.max((centerX - rect.left) / rect.width, 0), 1);
        const [d0, d1] = pinchStartDomain.current;
        pinchCenterValue.current = d0 + ratio * (d1 - d0);
      } else {
        pinchCenterValue.current = null;
      }
    }
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pinchStartDistance.current) return;
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, e.clientX);
    if (pointers.current.size === 2 && pinchStartDomain.current) {
      const xs = Array.from(pointers.current.values());
      const dist = Math.abs(xs[0] - xs[1]) || 1;
      const s = dist / (pinchStartDistance.current || 1);
      const [d0, d1] = pinchStartDomain.current;
      const baseRange = d1 - d0;
      let newRange = baseRange / s; // spread fingers => s>1 => zoom in
      const totalRange = overallXMax - overallXMin || 1;
      const minRange = Math.max(totalRange / 100, 24 * 60 * 60 * 1000);
      const maxRange = totalRange;
      newRange = Math.max(minRange, Math.min(maxRange, newRange));
      const center = pinchCenterValue.current ?? (d0 + d1) / 2;
      let next: [number, number] = [center - newRange / 2, center + newRange / 2];
      next = clampDomain(next);
      setXDomain(next);
    }
  };
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) {
      pinchStartDistance.current = null;
      pinchStartDomain.current = null;
      pinchCenterValue.current = null;
    }
  };

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
              {combinedData.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetZoom} 
                  disabled={!xDomain || (xDomain[0] <= overallXMin && xDomain[1] >= overallXMax)} 
                  aria-label="Reset zoom"
                >
                  Reset Zoom
                </Button>
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
            showIIR={showIIR}
            onToggleIIR={toggleIIR}
            visibleGoalIds={[...visibleGoals]}
            onToggleGoal={toggleGoal}
          />
        </CardHeader>
        <CardContent>
          <div className="flex items-stretch">
            {/* Fixed Y-axis panel */}
            <div className="h-80 w-16 flex-shrink-0">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={combinedData} margin={{ top: 20, right: 0, left: 0, bottom: 5 }}>
                  <YAxis stroke="#64748b" fontSize={12} domain={yDomain} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Scrollable chart area */}
            <div
              ref={scrollContainerRef}
              className="h-80 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 flex-1"
              onClick={handleChartClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <div 
                style={{ minWidth: Math.max(800, combinedData.length * 60) }}
                className="select-none"
              >
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart 
                    data={combinedData} 
                    margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis 
                      dataKey="timestamp"
                      type="number"
                      scale="time"
                      domain={currentXDomain}
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(timestamp) => format(new Date(timestamp), 'MMM dd')}
                    />
                    {/* Hidden Y-axis to lock domain with the fixed axis */}
                    <YAxis domain={yDomain} stroke="#64748b" fontSize={12} tick={false} axisLine={false} width={0} />

                    <Tooltip content={(props) => (
                      <WeightChartTooltip {...props} onDeletePrediction={handleDeletePrediction} />
                    )} />

                    {isSelecting && refAreaLeft != null && refAreaRight != null && (
                      <ReferenceArea x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} />
                    )}

                    {goalLines.filter((g) => visibleGoals.has(g.id)).map((goal, index) => (
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
                    ))}

                    <Line
                      type="monotone"
                      dataKey="displayWeight"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={<CustomDot />}
                      connectNulls={false}
                    />

                    {showIIR && (
                      <Line
                        type="monotone"
                        dataKey="iirFiltered"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={false}
                        connectNulls={false}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
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
