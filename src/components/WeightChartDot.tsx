
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { WeightEntry } from '../types/weight';
import { format, parseISO } from 'date-fns';
import { useUnit } from '../contexts/UnitContext';

interface WeightChartDotProps {
  cx: number;
  cy: number;
  payload: WeightEntry & {
    displayWeight: number;
    formattedDate: string;
  };
  isActive: boolean;
  isPopoverOpen: boolean;
  onDotClick: (data: any, event: any) => void;
  onEditClick: (entry: WeightEntry) => void;
  onDeleteClick: (id: string) => void;
  onPopoverOpenChange: (open: boolean) => void;
}

export const WeightChartDot: React.FC<WeightChartDotProps> = ({
  cx,
  cy,
  payload,
  isActive,
  isPopoverOpen,
  onDotClick,
  onEditClick,
  onDeleteClick,
  onPopoverOpenChange,
}) => {
  const { getWeightUnit } = useUnit();

  return (
    <Popover 
      open={isActive && isPopoverOpen} 
      onOpenChange={onPopoverOpenChange}
    >
      <PopoverTrigger asChild>
        <circle
          cx={cx}
          cy={cy}
          r={isActive ? 8 : 6}
          fill={isActive ? "#1d4ed8" : "#2563eb"}
          stroke="#ffffff"
          strokeWidth={2}
          className="cursor-pointer transition-all hover:r-8"
          onClick={(e) => onDotClick(payload, e)}
          style={{ 
            filter: isActive ? 'drop-shadow(0 4px 8px rgba(37, 99, 235, 0.4))' : 'none',
            cursor: 'pointer'
          }}
        />
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-3 bg-white border shadow-lg z-50"
        side="top"
        align="center"
        sideOffset={15}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-2">
          <p className="font-semibold text-sm">{format(parseISO(payload.date), 'MMM dd, yyyy')}</p>
          <p className="text-blue-600 font-medium">{`${payload.displayWeight.toFixed(1)} ${getWeightUnit()}`}</p>
          {payload.note && (
            <p className="text-gray-600 text-xs bg-gray-50 p-2 rounded">{payload.note}</p>
          )}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onEditClick(payload);
              }}
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick(payload.id);
              }}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
