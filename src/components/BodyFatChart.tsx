
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Percent } from 'lucide-react';
import { BodyComposition } from '../types/bodybuilding';
import { format, parseISO } from 'date-fns';
import { useBodyFatChart } from '../hooks/useBodyFatChart';
import { BodyFatChartDot } from './BodyFatChartDot';
import { BodyFatEditDialog } from './BodyFatEditDialog';
import { toast } from '@/hooks/use-toast';

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

  const chartData = compositions
    .filter(comp => comp.bodyFatPercentage && comp.bodyFatPercentage > 0)
    .map(comp => ({
      ...comp,
      date: format(parseISO(comp.date), 'MMM dd'),
      bodyFat: comp.bodyFatPercentage,
      fullDate: comp.date
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  const hasData = chartData.length > 0;

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
          <CardTitle className="text-red-700 flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Body Fat Percentage Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <div className="h-64" onClick={handleChartClick}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="bodyFatGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis 
                    domain={['dataMin - 1', 'dataMax + 1']}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Body Fat']}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="bodyFat"
                    stroke="#ef4444"
                    strokeWidth={3}
                    fill="url(#bodyFatGradient)"
                    dot={<CustomDot />}
                    activeDot={false}
                    connectNulls={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
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
