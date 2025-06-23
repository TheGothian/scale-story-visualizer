
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeightChartScrollControlsProps {
  dataLength: number;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onScrollLeft: () => void;
  onScrollRight: () => void;
}

export const WeightChartScrollControls: React.FC<WeightChartScrollControlsProps> = ({
  dataLength,
  canScrollLeft,
  canScrollRight,
  onScrollLeft,
  onScrollRight
}) => {
  if (dataLength <= 8) return null;

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={onScrollLeft}
        disabled={!canScrollLeft}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onScrollRight}
        disabled={!canScrollRight}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
