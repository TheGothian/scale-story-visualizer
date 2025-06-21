
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Trash2, Edit } from 'lucide-react';
import { WeightEntry } from '../types/weight';
import { format, parseISO } from 'date-fns';
import { calculateTrend } from '../utils/calculations';
import { useUnit } from '../contexts/UnitContext';

interface WeightChartProps {
  weights: WeightEntry[];
  onDeleteWeight: (id: string) => void;
  onEditWeight: (id: string, updatedEntry: Partial<WeightEntry>) => void;
}

export const WeightChart: React.FC<WeightChartProps> = ({ weights, onDeleteWeight, onEditWeight }) => {
  const { unitSystem, getWeightUnit, convertWeight } = useUnit();
  const currentUnit = unitSystem === 'metric' ? 'kg' : 'lbs';
  const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editDate, setEditDate] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeEntry, setActiveEntry] = useState<string | null>(null);

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

  const handleEditClick = (entry: WeightEntry) => {
    console.log('Edit clicked for entry:', entry.id);
    setEditingEntry(entry);
    setEditWeight(convertWeight(entry.weight, entry.unit, currentUnit).toString());
    setEditNote(entry.note || '');
    setEditDate(entry.date);
    setIsEditDialogOpen(true);
    setActiveEntry(null); // Close hover card
  };

  const handleDeleteClick = (id: string) => {
    console.log('Delete clicked for entry:', id);
    onDeleteWeight(id);
    setActiveEntry(null); // Close hover card
  };

  const handleSaveEdit = () => {
    if (!editingEntry) return;

    const weightInOriginalUnit = convertWeight(parseFloat(editWeight), currentUnit, editingEntry.unit);
    
    onEditWeight(editingEntry.id, {
      weight: weightInOriginalUnit,
      note: editNote.trim() || undefined,
      date: editDate,
    });

    setIsEditDialogOpen(false);
    setEditingEntry(null);
  };

  const handleDotClick = (data: any) => {
    console.log('Dot clicked:', data);
    setActiveEntry(activeEntry === data.id ? null : data.id);
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const isActive = activeEntry === payload.id;
    
    return (
      <>
        <circle
          cx={cx}
          cy={cy}
          r={8}
          fill={isActive ? "#1d4ed8" : "#2563eb"}
          stroke="#2563eb"
          strokeWidth={2}
          className="cursor-pointer hover:fill-blue-700 transition-all"
          onClick={() => handleDotClick(payload)}
        />
        {isActive && (
          <g>
            <foreignObject
              x={cx + 15}
              y={cy - 50}
              width={180}
              height={100}
              className="overflow-visible"
            >
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
                <p className="font-semibold mb-1">{format(parseISO(payload.date), 'MMM dd, yyyy')}</p>
                <p className="text-blue-600 mb-2">{`Weight: ${payload.displayWeight.toFixed(1)} ${getWeightUnit()}`}</p>
                {payload.note && <p className="text-gray-600 text-xs mb-2">{payload.note}</p>}
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs px-2 py-1 h-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(payload);
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="text-xs px-2 py-1 h-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(payload.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </foreignObject>
          </g>
        )}
      </>
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
            <div className="h-80" onClick={() => setActiveEntry(null)}>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Weight Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-weight">Weight ({getWeightUnit()})</Label>
              <Input
                id="edit-weight"
                type="number"
                step="0.1"
                value={editWeight}
                onChange={(e) => setEditWeight(e.target.value)}
                placeholder={`Enter weight in ${getWeightUnit()}`}
              />
            </div>
            <div>
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-note">Note (optional)</Label>
              <Textarea
                id="edit-note"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="Add a note about this weight entry..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveEdit}
                disabled={!editWeight || !editDate}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
