import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CalendarIcon,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { BodybuildingGoal } from "../types/bodybuilding";
import { useUnit } from "../contexts/UnitContext";
import { toast } from "@/hooks/use-toast";

interface PhaseGoalSetterProps {
  goals?: BodybuildingGoal[]; // Make goals optional
  onAddGoal: (goal: BodybuildingGoal) => void;
  onDeleteGoal: (id: string) => void;
}

export const PhaseGoalSetter: React.FC<PhaseGoalSetterProps> = ({
  goals = [], // Provide default empty array
  onAddGoal,
  onDeleteGoal,
}) => {
  const [goalName, setGoalName] = useState("");
  const [phase, setPhase] = useState<
    "cutting" | "bulking" | "maintenance" | "contest-prep"
  >("cutting");
  const [targetWeight, setTargetWeight] = useState("");
  const [targetBodyFat, setTargetBodyFat] = useState("");
  const [targetMuscleMass, setTargetMuscleMass] = useState("");
  const [weeklyWeightTarget, setWeeklyWeightTarget] = useState("");
  const [caloricTarget, setCaloricTarget] = useState("");
  const [proteinTarget, setProteinTarget] = useState("");
  const [targetDate, setTargetDate] = useState<Date>();
  const [description, setDescription] = useState("");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const { unitSystem, getWeightUnit } = useUnit();

  const availableMetrics = [
    { id: "weight", label: "Weight", icon: Target },
    { id: "bodyFat", label: "Body Fat %", icon: TrendingDown },
    { id: "muscleMass", label: "Muscle Mass", icon: TrendingUp },
    { id: "weeklyWeight", label: "Weekly Weight Change", icon: Minus },
    { id: "calories", label: "Daily Calories", icon: Target },
    { id: "protein", label: "Daily Protein (g)", icon: Target },
  ];

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metricId)
        ? prev.filter((id) => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!goalName.trim()) {
      toast({
        title: "Missing goal name",
        description: "Please enter a name for your goal.",
        variant: "destructive",
      });
      return;
    }

    if (selectedMetrics.length === 0) {
      toast({
        title: "No metrics selected",
        description: "Please select at least one metric to track.",
        variant: "destructive",
      });
      return;
    }

    if (!targetDate) {
      toast({
        title: "Missing target date",
        description: "Please select a target date for your goal.",
        variant: "destructive",
      });
      return;
    }

    // Validate selected metrics
    const validationErrors: string[] = [];

    if (
      selectedMetrics.includes("weight") &&
      (!targetWeight || isNaN(Number(targetWeight)))
    ) {
      validationErrors.push("Please enter a valid target weight.");
    }

    if (
      selectedMetrics.includes("bodyFat") &&
      (!targetBodyFat || isNaN(Number(targetBodyFat)))
    ) {
      validationErrors.push("Please enter a valid target body fat percentage.");
    }

    if (
      selectedMetrics.includes("muscleMass") &&
      (!targetMuscleMass || isNaN(Number(targetMuscleMass)))
    ) {
      validationErrors.push("Please enter a valid target muscle mass.");
    }

    if (
      selectedMetrics.includes("weeklyWeight") &&
      (!weeklyWeightTarget || isNaN(Number(weeklyWeightTarget)))
    ) {
      validationErrors.push("Please enter a valid weekly weight target.");
    }

    if (
      selectedMetrics.includes("calories") &&
      (!caloricTarget || isNaN(Number(caloricTarget)))
    ) {
      validationErrors.push("Please enter a valid caloric target.");
    }

    if (
      selectedMetrics.includes("protein") &&
      (!proteinTarget || isNaN(Number(proteinTarget)))
    ) {
      validationErrors.push("Please enter a valid protein target.");
    }

    if (validationErrors.length > 0) {
      toast({
        title: "Invalid input",
        description: validationErrors.join(" "),
        variant: "destructive",
      });
      return;
    }

    const unit = unitSystem === "metric" ? "kg" : "lbs";
    const goal: BodybuildingGoal = {
      id: Date.now().toString(),
      name: goalName.trim(),
      phase,
      targetWeight: selectedMetrics.includes("weight")
        ? Number(targetWeight)
        : undefined,
      targetBodyFat: selectedMetrics.includes("bodyFat")
        ? Number(targetBodyFat)
        : undefined,
      targetMuscleMass: selectedMetrics.includes("muscleMass")
        ? Number(targetMuscleMass)
        : undefined,
      weeklyWeightTarget: selectedMetrics.includes("weeklyWeight")
        ? Number(weeklyWeightTarget)
        : undefined,
      caloricTarget: selectedMetrics.includes("calories")
        ? Number(caloricTarget)
        : undefined,
      proteinTarget: selectedMetrics.includes("protein")
        ? Number(proteinTarget)
        : undefined,
      targetDate: format(targetDate, "yyyy-MM-dd"),
      description: description.trim() || undefined,
      unit,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    onAddGoal(goal);

    // Reset form
    setGoalName("");
    setTargetWeight("");
    setTargetBodyFat("");
    setTargetMuscleMass("");
    setWeeklyWeightTarget("");
    setCaloricTarget("");
    setProteinTarget("");
    setDescription("");
    setTargetDate(undefined);
    setSelectedMetrics([]);

    toast({
      title: "Goal created!",
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

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case "cutting":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "bulking":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "maintenance":
        return <Minus className="h-4 w-4 text-blue-600" />;
      case "contest-prep":
        return <Target className="h-4 w-4 text-purple-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "cutting":
        return "text-red-600 bg-red-50 border-red-200";
      case "bulking":
        return "text-green-600 bg-green-50 border-green-200";
      case "maintenance":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "contest-prep":
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Goal Creation Form */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Target className="h-5 w-5" />
            Set Bodybuilding Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Select
                value={phase}
                onValueChange={(value: any) => setPhase(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select training phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cutting">Cutting</SelectItem>
                  <SelectItem value="bulking">Bulking</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="contest-prep">Contest Prep</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Metrics to Track</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableMetrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div
                      key={metric.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={metric.id}
                        checked={selectedMetrics.includes(metric.id)}
                        onCheckedChange={() => handleMetricToggle(metric.id)}
                      />
                      <Label
                        htmlFor={metric.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Icon className="h-3 w-3" />
                        {metric.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedMetrics.includes("weight") && (
              <div className="space-y-2">
                <Label htmlFor="targetWeight">
                  Target Weight ({getWeightUnit()})
                </Label>
                <Input
                  id="targetWeight"
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder={`Enter your target weight in ${getWeightUnit()}`}
                />
              </div>
            )}

            {selectedMetrics.includes("bodyFat") && (
              <div className="space-y-2">
                <Label htmlFor="targetBodyFat">Target Body Fat (%)</Label>
                <Input
                  id="targetBodyFat"
                  type="number"
                  step="0.1"
                  value={targetBodyFat}
                  onChange={(e) => setTargetBodyFat(e.target.value)}
                  placeholder="Enter your target body fat percentage"
                />
              </div>
            )}

            {selectedMetrics.includes("muscleMass") && (
              <div className="space-y-2">
                <Label htmlFor="targetMuscleMass">
                  Target Muscle Mass ({getWeightUnit()})
                </Label>
                <Input
                  id="targetMuscleMass"
                  type="number"
                  step="0.1"
                  value={targetMuscleMass}
                  onChange={(e) => setTargetMuscleMass(e.target.value)}
                  placeholder={`Enter your target muscle mass in ${getWeightUnit()}`}
                />
              </div>
            )}

            {selectedMetrics.includes("weeklyWeight") && (
              <div className="space-y-2">
                <Label htmlFor="weeklyWeightTarget">
                  Weekly Weight Change ({getWeightUnit()}/week)
                </Label>
                <Input
                  id="weeklyWeightTarget"
                  type="number"
                  step="0.1"
                  value={weeklyWeightTarget}
                  onChange={(e) => setWeeklyWeightTarget(e.target.value)}
                  placeholder="Enter weekly weight change target"
                />
              </div>
            )}

            {selectedMetrics.includes("calories") && (
              <div className="space-y-2">
                <Label htmlFor="caloricTarget">Daily Caloric Target</Label>
                <Input
                  id="caloricTarget"
                  type="number"
                  value={caloricTarget}
                  onChange={(e) => setCaloricTarget(e.target.value)}
                  placeholder="Enter your daily caloric target"
                />
              </div>
            )}

            {selectedMetrics.includes("protein") && (
              <div className="space-y-2">
                <Label htmlFor="proteinTarget">Daily Protein Target (g)</Label>
                <Input
                  id="proteinTarget"
                  type="number"
                  value={proteinTarget}
                  onChange={(e) => setProteinTarget(e.target.value)}
                  placeholder="Enter your daily protein target in grams"
                />
              </div>
            )}

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
                    {targetDate ? (
                      format(targetDate, "PPP")
                    ) : (
                      <span>Pick target date</span>
                    )}
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

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your goal motivation and approach..."
                className="resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Target className="mr-2 h-4 w-4" />
              Save Goal
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Goals List */}
      {goals && goals.length > 0 && (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-purple-700">
              Your Bodybuilding Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${getPhaseColor(
                    goal.phase
                  )}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getPhaseIcon(goal.phase)}
                      <h4 className="font-semibold">{goal.name}</h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/50">
                        {goal.phase}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      {goal.targetWeight && (
                        <p>
                          Weight: {goal.targetWeight} {goal.unit}
                        </p>
                      )}
                      {goal.targetBodyFat && (
                        <p>Body Fat: {goal.targetBodyFat}%</p>
                      )}
                      {goal.targetMuscleMass && (
                        <p>
                          Muscle Mass: {goal.targetMuscleMass} {goal.unit}
                        </p>
                      )}
                      {goal.weeklyWeightTarget && (
                        <p>
                          Weekly Change: {goal.weeklyWeightTarget} {goal.unit}
                          /week
                        </p>
                      )}
                      {goal.caloricTarget && (
                        <p>Calories: {goal.caloricTarget}/day</p>
                      )}
                      {goal.proteinTarget && (
                        <p>Protein: {goal.proteinTarget}g/day</p>
                      )}
                      <p className="text-xs opacity-75">
                        Target:{" "}
                        {format(new Date(goal.targetDate), "MMM dd, yyyy")}
                      </p>
                    </div>
                    {goal.description && (
                      <p className="text-xs mt-1 opacity-75">
                        {goal.description}
                      </p>
                    )}
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
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
