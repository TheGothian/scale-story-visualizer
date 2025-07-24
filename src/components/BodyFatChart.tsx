
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
              Body Fat Percentage Progress
            </CardTitle>
          </div>
          {hasData && (
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-red-500"></div>
                <span>Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-purple-500"></div>
                <span>Smoothed (IIR Filter)</span>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {hasData ? (
            <div className="h-64" onClick={handleChartClick}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={iirChartData}>
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
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    domain={['dataMin - 1', 'dataMax + 1']}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'bodyFat') return [`${value}%`, 'Body Fat'];
                      if (name === 'iirFiltered') return [`${value}%`, 'Smoothed'];
                      return [`${value}%`, name];
                    }}
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
