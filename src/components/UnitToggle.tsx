
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale } from 'lucide-react';
import { useUnit } from '../contexts/UnitContext';

export const UnitToggle: React.FC = () => {
  const { unitSystem, setUnitSystem } = useUnit();

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Scale className="h-5 w-5" />
          Unit System
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ToggleGroup 
          type="single" 
          value={unitSystem} 
          onValueChange={(value) => value && setUnitSystem(value as 'metric' | 'imperial')}
          className="justify-start"
        >
          <ToggleGroupItem value="metric" aria-label="Metric system">
            Metric (kg)
          </ToggleGroupItem>
          <ToggleGroupItem value="imperial" aria-label="Imperial system">
            Imperial (lbs)
          </ToggleGroupItem>
        </ToggleGroup>
      </CardContent>
    </Card>
  );
};
