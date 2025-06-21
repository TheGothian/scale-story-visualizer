
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Percent } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { BodyComposition } from '../types/bodybuilding';
import { toast } from '@/hooks/use-toast';

interface BodyFatFormProps {
  onSaveComposition: (composition: BodyComposition) => void;
}

export const BodyFatForm: React.FC<BodyFatFormProps> = ({ onSaveComposition }) => {
  const [bodyFat, setBodyFat] = useState('');
  const [date, setDate] = useState<Date>(new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bodyFat || isNaN(Number(bodyFat))) {
      toast({
        title: "Invalid body fat",
        description: "Please enter a valid body fat percentage.",
        variant: "destructive"
      });
      return;
    }

    const bodyFatNum = Number(bodyFat);
    if (bodyFatNum < 1 || bodyFatNum > 50) {
      toast({
        title: "Invalid range",
        description: "Body fat percentage should be between 1% and 50%.",
        variant: "destructive"
      });
      return;
    }

    const composition: BodyComposition = {
      id: Date.now().toString(),
      date: format(date, 'yyyy-MM-dd'),
      bodyFatPercentage: bodyFatNum,
      measurements: {},
      createdAt: new Date().toISOString()
    };

    onSaveComposition(composition);
    setBodyFat('');
    
    toast({
      title: "Body fat logged!",
      description: `Added ${bodyFat}% on ${format(date, 'MMM dd, yyyy')}`,
    });
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-red-700">
          <Percent className="h-5 w-5" />
          Log Body Fat
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bodyFat">Body Fat Percentage (%)</Label>
            <Input
              id="bodyFat"
              type="number"
              step="0.1"
              min="1"
              max="50"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              placeholder="Enter body fat percentage"
              className="text-lg"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
            <Percent className="mr-2 h-4 w-4" />
            Log Body Fat
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
