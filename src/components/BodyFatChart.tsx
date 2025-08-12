
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart } from 'recharts';
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

  // Compute a stable Y domain so Y-axis stays fixed while scrolling
  const yCandidates: number[] = iirChartData.reduce((acc: number[], d: any) => {
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
            <WeightChartScrollControls
              dataLength={iirChartData.length}
              canScrollLeft={canScrollLeft}
              canScrollRight={canScrollRight}
              onScrollLeft={scrollLeft}
              onScrollRight={scrollRight}
            />
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
                ref={scrollContainerRef}
                className="h-80 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 flex-1"
                onClick={handleChartClick}
              >
                <div style={{ minWidth: Math.max(800, iirChartData.length * 60) }}>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={iirChartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
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
                        domain={['dataMin', 'dataMax']}
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
