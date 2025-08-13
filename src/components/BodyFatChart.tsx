
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart, ReferenceArea } from 'recharts';
import { Percent } from 'lucide-react';
import { BodyComposition } from '../types/bodybuilding';
import { format, parseISO } from 'date-fns';
import { useBodyFatChart } from '../hooks/useBodyFatChart';
import { useBodyFatChartData } from '../hooks/useBodyFatChartData';
import { BodyFatChartDot } from './BodyFatChartDot';
import { BodyFatEditDialog } from './BodyFatEditDialog';
import { toast } from '@/hooks/use-toast';
import { WeightChartScrollControls } from './WeightChartScrollControls';
import { useWeightChartScroll } from '../hooks/useWeightChartScroll';
interface BodyFatChartProps {
  compositions: BodyComposition[];
  onDeleteComposition?: (id: string) => void;
  onEditComposition?: (id: string, updatedComposition: Partial<BodyComposition>) => void;
}

export const BodyFatChart: React.FC<BodyFatChartProps> = ({ 
  compositions,
  onDeleteComposition = () => {},
  onEditComposition = () => {}
}) => {
  const {
    editingEntry,
    editBodyFat,
    setEditBodyFat,
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
  } = useBodyFatChart(onDeleteComposition, onEditComposition);

  const { iirChartData } = useBodyFatChartData(compositions);
  const hasData = iirChartData.length > 0;

  // Visibility toggle for IIR filter
  const [showIIR, setShowIIR] = React.useState(true);
  const toggleIIR = () => setShowIIR((v) => !v);

  // Scroll controls (reuse weight chart scroll hook)
  const {
    scrollContainerRef,
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight
  } = useWeightChartScroll(iirChartData.length);

  // Zoom state and helpers
  const allTimestamps = React.useMemo(() => (
    iirChartData.map((d: any) => d.timestamp).filter((t: any) => typeof t === 'number')
  ), [iirChartData]);
  const overallXMin = allTimestamps.length ? Math.min(...allTimestamps) : 0;
  const overallXMax = allTimestamps.length ? Math.max(...allTimestamps) : 0;

  const [xDomain, setXDomain] = React.useState<[number, number] | null>(null);
  React.useEffect(() => {
    if (allTimestamps.length) setXDomain([overallXMin, overallXMax]);
  }, [overallXMin, overallXMax, allTimestamps.length]);

  // Desktop drag-to-zoom selection
  const [refAreaLeft, setRefAreaLeft] = React.useState<number | null>(null);
  const [refAreaRight, setRefAreaRight] = React.useState<number | null>(null);
  const [isSelecting, setIsSelecting] = React.useState(false);

  // Pinch-to-zoom (mobile)
  const chartAreaRef = React.useRef<HTMLDivElement | null>(null);
  const pointers = React.useRef<Map<number, number>>(new Map()); // pointerId -> clientX
  const pinchStartDistance = React.useRef<number | null>(null);
  const pinchStartDomain = React.useRef<[number, number] | null>(null);
  const pinchCenterValue = React.useRef<number | null>(null);

  const clampDomain = React.useCallback((d: [number, number]): [number, number] => {
    let [a, b] = d[0] <= d[1] ? d : [d[1], d[0]];
    const totalRange = Math.max(1, overallXMax - overallXMin);
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
    if (allTimestamps.length) setXDomain([overallXMin, overallXMax]);
  }, [overallXMin, overallXMax, allTimestamps.length]);

  const handleMouseDown = (e: any) => {
    if (e && typeof e.activeLabel === 'number') {
      setRefAreaLeft(e.activeLabel);
      setRefAreaRight(null);
      setIsSelecting(true);
    }
  };
  const handleMouseMove = (e: any) => {
    if (!isSelecting) return;
    if (e && typeof e.activeLabel === 'number') {
      setRefAreaRight(e.activeLabel);
    }
  };
  const applySelectionZoom = React.useCallback(() => {
    if (refAreaLeft != null && refAreaRight != null) {
      const next = clampDomain([refAreaLeft, refAreaRight]);
      setXDomain(next);
    }
    setIsSelecting(false);
    setRefAreaLeft(null);
    setRefAreaRight(null);
  }, [refAreaLeft, refAreaRight, clampDomain]);
  const handleMouseUp = () => applySelectionZoom();
  const handleMouseLeave = () => { if (isSelecting) applySelectionZoom(); };

  const setScrollAndChartRef = React.useCallback((node: HTMLDivElement | null) => {
    chartAreaRef.current = node;
    // Combine with scroll ref
    // @ts-ignore
    if (scrollContainerRef) (scrollContainerRef as any).current = node;
  }, [scrollContainerRef]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as any).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, e.clientX);
    if (pointers.current.size === 2) {
      const xs = Array.from(pointers.current.values());
      const dist = Math.abs(xs[0] - xs[1]) || 1;
      pinchStartDistance.current = dist;
      pinchStartDomain.current = (xDomain ?? [overallXMin, overallXMax]);
      const centerX = (xs[0] + xs[1]) / 2;
      const rect = chartAreaRef.current?.getBoundingClientRect();
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
      const totalRange = Math.max(1, overallXMax - overallXMin);
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

  const currentXDomain: [number, number] = xDomain ?? [overallXMin || 0, overallXMax || 0];
  const isZoomed = xDomain ? (xDomain[0] > overallXMin || xDomain[1] < overallXMax) : false;

  // Compute a stable Y domain based on current X range
  const dataInRange = iirChartData.filter((d: any) => d.timestamp >= currentXDomain[0] && d.timestamp <= currentXDomain[1]);
  const yCandidates: number[] = dataInRange.reduce((acc: number[], d: any) => {
    if (typeof d.bodyFat === 'number') acc.push(d.bodyFat);
    if (showIIR && typeof d.iirFiltered === 'number') acc.push(d.iirFiltered);
    return acc;
  }, []);
  const yMin = yCandidates.length ? Math.min(...yCandidates) : 0;
  const yMax = yCandidates.length ? Math.max(...yCandidates) : 50;
  const yPadding = 1;
  const yDomain: [number, number] = [
    Math.max(0, Math.floor(yMin) - yPadding),
    Math.min(100, Math.ceil(yMax) + yPadding)
  ];
  const handleSaveWithToast = () => {
    handleSaveEdit();
    toast({
      title: "Body fat updated!",
      description: `Updated to ${editBodyFat}% on ${format(parseISO(editDate), 'MMM dd, yyyy')}`,
    });
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const isActive = activeEntry === payload.id;
    
    return (
      <BodyFatChartDot
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
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-red-700 flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Body Fat Progress
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasData && (
                <Button variant="outline" size="sm" onClick={resetZoom} disabled={!isZoomed} aria-label="Reset zoom">
                  Reset Zoom
                </Button>
              )}
              <WeightChartScrollControls
                dataLength={iirChartData.length}
                canScrollLeft={canScrollLeft}
                canScrollRight={canScrollRight}
                onScrollLeft={scrollLeft}
                onScrollRight={scrollRight}
              />
            </div>
          </div>
          {hasData && (
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-2 flex-wrap">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full border select-none">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Actual</span>
              </div>
              <button
                type="button"
                onClick={toggleIIR}
                className={`flex items-center gap-1 px-2 py-1 rounded-full border select-none ${showIIR ? '' : 'opacity-50 line-through'}`}
                aria-pressed={showIIR}
              >
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>IIR Filter (a=0.3)</span>
              </button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {hasData ? (
            <div className="flex items-stretch">
              {/* Fixed Y-axis panel */}
              <div className="h-80 w-16 flex-shrink-0">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={iirChartData} margin={{ top: 20, right: 0, left: 0, bottom: 5 }}>
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={12} 
                      domain={yDomain}
                      tickFormatter={(value) => `${value}%`} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Scrollable chart area */}
              <div
                ref={setScrollAndChartRef}
                className="h-80 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 flex-1"
                onClick={handleChartClick}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                <div style={{ minWidth: Math.max(800, iirChartData.length * 60) }}>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={iirChartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}>
                      <defs>
                        <linearGradient id="bodyFatGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
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
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'bodyFat') return [`${value}%`, 'Body Fat'];
                          if (name === 'iirFiltered') return [`${value}%`, 'IIR Filter (a=0.3)'];
                          return [`${value}%`, name];
                        }}
                        labelFormatter={(timestamp) => format(new Date(timestamp), 'MMM dd, yyyy')}
                        labelStyle={{ color: '#374151' }}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />

                      {isSelecting && refAreaLeft != null && refAreaRight != null && (
                        <ReferenceArea x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} />
                      )}

                      {/* Actual body fat line */}
                      <Line
                        type="monotone"
                        dataKey="bodyFat"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={<CustomDot />}
                        connectNulls={false}
                      />
                      {/* IIR Filtered line */}
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
          ) : (
            <div className="h-64 flex items-center justify-center bg-red-50 rounded-lg">
              <div className="text-center">
                <Percent className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-600 mb-2">No body fat data available</p>
                <p className="text-sm text-red-500">Log your body fat percentage to see your progress</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <BodyFatEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        editBodyFat={editBodyFat}
        setEditBodyFat={setEditBodyFat}
        editDate={editDate}
        setEditDate={setEditDate}
        onSave={handleSaveWithToast}
      />
    </>
  );
};
