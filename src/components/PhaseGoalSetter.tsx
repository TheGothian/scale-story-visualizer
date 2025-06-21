
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Target, Trash2, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { BodybuildingGoal } from '../types/bodybuilding';
import { useUnit } from '../contexts/UnitContext';
import { toast } from '@/hooks/use-toast';

interface PhaseGoalSetterProps {
  goals: BodybuildingGoal[];
  onAddGoal: (goal: BodybuildingGoal) => void;
  onDeleteGoal: (id: string) => void;
}

export const PhaseGoalSetter: React.FC<PhaseGoalSetterProps> = ({ 
  goals, 
  onAddGoal, 
  onDeleteGoal 
}) => {
  const [goalName, setGoalName] = useState('');
  const [phase, setPhase] = useState<'cutting' | 'bulking' | 'maintenance' | 'contest-prep'>('cutting');
  const [targetWeight, setTargetWeight] = useState('');
  const [targetBodyFat, setTargetBodyFat] = useState('');
  const [targetMuscleMass, setTargetMuscleMass] = useState('');
  const [weeklyWeightTarget, setWeeklyWeightTarget] = useState('');
  const [caloricTarget, setCaloricTarget] = useState('');
  const [proteinTarget, setProteinTarget] = useState('');
  const [targetDate, setTargetDate] = useState<Date>();
  const [description, setDescription] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['weight', 'bodyFat']);
  
  const { unitSystem, getWeightUnit } = useUnit();

  const availableMetrics = [
    { id: 'weight', label: 'Weight' },
    { id: 'bodyFat', label: 'Body Fat %' },
    { id: 'muscleMass', label: 'Muscle Mass' },
    { id: 'measurements', label: 'Body Measurements' },
    { id: 'strength', label: 'Strength Progress' },
    { id: 'photos', label: 'Progress Photos' },
    { id: 'calories', label: 'Caloric Intake' },
    { id: 'protein', label: 'Protein Intake' }
  ];

  const phaseConfigs = {
    cutting: {
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200',
      description: 'Focus on fat loss while preserving muscle mass'
    },
    bulking: {
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200',
      description: 'Build muscle mass with controlled weight gain'
    },
    maintenance: {
      icon: Minus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
      description: 'Maintain current physique and strength'
    },
    'contest-prep': {
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-200',
      description: 'Peak for competition with precise conditioning'
    }
  };

  const handleMetricToggle = (metricId: string, checked: boolean) => {
    if (checked) {
      setSelectedMetrics(prev => [...prev, metricId]);
    } else {
      setSelectedMetrics(prev => prev.filter(id => id !== metricId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goalName.trim()) {
      toast({
        title: "Missing goal name",
        description: "Please enter a name for your goal.",
        variant: "destructive"
      });
      return;
    }

    if (!targetDate) {
      toast({
        title: "Missing target date",
        description: "Please select a target date for your goal.",
        variant: "destructive"
      });
      return;
    }

    if (selectedMetrics.length === 0) {
      toast({
        title: "No metrics selected",
        description: "Please select at least one metric to track.",
        variant: "destructive"
      });
      return;
    }

    const unit = unitSystem === 'metric' ? 'kg' : 'lbs';
    const goal: BodybuildingGoal = {
      id: Date.now().toString(),
      name: goalName.trim(),
      phase,
      targetDate: format(targetDate, 'yyyy-MM-dd'),
      description: description.trim() || undefined,
      unit,
      createdAt: new Date().toISOString(),
      isActive: true,
      targetWeight: targetWeight ? Number(targetWeight) : undefined,
      targetBodyFat: targetBodyFat ? Number(targetBodyFat) : undefined,
      targetMuscleMass: targetMuscleMass ? Number(targetMuscleMass) : undefined,
      weeklyWeightTarget: weeklyWeightTarget ? Number(weeklyWeightTarget) : undefined,
      caloricTarget: caloricTarget ? Number(caloricTarget) : undefined,
      proteinTarget: proteinTarget ? Number(proteinTarget) : undefined,
      metrics: selectedMetrics
    };

    onAddGoal(goal);
    
    // Reset form
    setGoalName('');
    setTargetWeight('');
    setTargetBodyFat('');
    setTargetMuscleMass('');
    setWeeklyWeightTarget('');
    setCaloricTarget('');
    setProteinTarget('');
    setDescription('');
    setTargetDate(undefined);
    setSelectedMetrics(['weight', 'bodyFat']);
    
    toast({
      title: "Phase goal created!",
      description: `Your ${phase} goal "${goalName}" has been saved.`,
    });
  };

  const handleDeleteGoal = (goalId: string, goalName: string) => {
    onDeleteGoal(goalId);
    toast({
      title: "Goal deleted",
      description: `Goal "${goalName}" has been removed.`,
    });
  };

  const currentPhaseConfig = phaseConfigs[phase];
  const PhaseIcon = currentPhaseConfig.icon;

  return (
    <div className="space-y-6">
      {/* Phase Goal Creation Form */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <Target className="h-5 w-5" />
            Set Phase-Based Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goalName">Goal Name</Label>
                <Input
                  id="goalName"
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g., Summer Cut 2024"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phase">Training Phase</Label>
                <Select value={phase} onValueChange={(value: any) => setPhase(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cutting">Cutting</SelectItem>
                    <SelectItem value="bulking">Bulking</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="contest-prep">Contest Prep</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Phase Description */}
            <div className={`p-3 rounded-lg ${currentPhaseConfig.bgColor}`}>
              <div className="flex items-center gap-2 mb-1">
                <PhaseIcon className={`h-4 w-4 ${currentPhaseConfig.color}`} />
                <span className={`font-medium ${currentPhaseConfig.color} capitalize`}>{phase.replace('-', ' ')}</span>
              </div>
              <p className="text-sm text-gray-600">{currentPhaseConfig.description}</p>
            </div>

            {/* Target Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetWeight">Target Weight ({getWeightUnit()})</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetBodyFat">Target Body Fat (%)</Label>
                <Input
                  id="targetBodyFat"
                  type="number"
                  step="0.1"
                  value={targetBodyFat}
                  onChange={(e) => setTargetBodyFat(e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weeklyWeightTarget">Weekly Change ({getWeightUnit()})</Label>
                <Input
                  id="weeklyWeightTarget"
                  type="number"
                  step="0.1"
                  value={weeklyWeightTarget}
                  onChange={(e) => setWeeklyWeightTarget(e.target.value)}
                  placeholder="±0.5"
                />
              </div>
            </div>

            {/* Nutrition Targets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="caloricTarget">Daily Calories</Label>
                <Input
                  id="caloricTarget"
                  type="number"
                  value={caloricTarget}
                  onChange={(e) => setCaloricTarget(e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proteinTarget">Daily Protein (g)</Label>
                <Input
                  id="proteinTarget"
                  type="number"
                  value={proteinTarget}
                  onChange={(e) => setProteinTarget(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Target Date */}
            <div className="space-y-2">
              <Label>Target Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !targetDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {targetDate ? format(targetDate, "PPP") : <span>Pick target date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={targetDate}
                    onSelect={(date) => date && setTargetDate(date)}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Metrics to Track */}
            <div className="space-y-2">
              <Label>Metrics to Track</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableMetrics.map((metric) => (
                  <div key={metric.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={metric.id}
                      checked={selectedMetrics.includes(metric.id)}
                      onCheckedChange={(checked) => handleMetricToggle(metric.id, !!checked)}
                    />
                    <Label htmlFor={metric.id} className="text-sm font-normal">
                      {metric.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your goal strategy..."
                className="resize-none"
              />
            </div>

            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
              <Target className="mr-2 h-4 w-4" />
              Create Phase Goal
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Phase Goals List */}
      {goals.length > 0 && (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-orange-700">Your Phase Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {goals.map((goal) => {
                const phaseConfig = phaseConfigs[goal.phase];
                const PhaseIcon = phaseConfig.icon;
                
                return (
                  <div
                    key={goal.id}
                    className={`p-4 rounded-lg border ${phaseConfig.bgColor}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <PhaseIcon className={`h-4 w-4 ${phaseConfig.color}`} />
                        <h4 className="font-semibold text-gray-800">{goal.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full bg-white ${phaseConfig.color} capitalize`}>
                          {goal.phase.replace('-', ' ')}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGoal(goal.id, goal.name)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-700 mb-2">
                      {goal.targetWeight && (
                        <p>Target Weight: {goal.targetWeight} {goal.unit}</p>
                      )}
                      {goal.targetBodyFat && (
                        <p>Target BF: {goal.targetBodyFat}%</p>
                      )}
                      {goal.weeklyWeightTarget && (
                        <p>Weekly: {goal.weeklyWeightTarget > 0 ? '+' : ''}{goal.weeklyWeightTarget} {goal.unit}/week</p>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      Target Date: {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {goal.metrics.map((metric) => (
                        <span key={metric} className="text-xs px-2 py-1 bg-white rounded text-gray-600">
                          {availableMetrics.find(m => m.id === metric)?.label || metric}
                        </span>
                      ))}
                    </div>
                    
                    {goal.description && (
                      <p className="text-xs text-gray-600 mt-2">{goal.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
