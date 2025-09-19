import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Goal, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { WeightGoal } from "../types/weight";
import { useUnit } from "../contexts/UnitContext";
import { toast } from "@/hooks/use-toast";

interface GoalSetterProps {
  goals?: WeightGoal[]; // Make goals optional
  onAddGoal: (goal: WeightGoal) => void;
  onDeleteGoal: (id: string) => void;
}

export const GoalSetter: React.FC<GoalSetterProps> = ({
  goals = [], // Provide default empty array
  onAddGoal,
  onDeleteGoal,
}) => {
  const [targetWeight, setTargetWeight] = useState("");
  const [targetDate, setTargetDate] = useState<Date>();
  const [goalName, setGoalName] = useState("");
  const [description, setDescription] = useState("");
  const { unitSystem, getWeightUnit } = useUnit();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetWeight || isNaN(Number(targetWeight))) {
      toast({
        title: "Invalid target weight",
        description: "Please enter a valid target weight.",
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

    if (!goalName.trim()) {
      toast({
        title: "Missing goal name",
        description: "Please enter a name for your goal.",
        variant: "destructive",
      });
      return;
    }

    const unit = unitSystem === "metric" ? "kg" : "lbs";
    const goal: WeightGoal = {
      id: Date.now().toString(),
      name: goalName.trim(),
      targetWeight: Number(targetWeight),
      targetDate: format(targetDate, "yyyy-MM-dd"),
      description: description.trim() || undefined,
      unit,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    onAddGoal(goal);
    setTargetWeight("");
    setGoalName("");
    setDescription("");
    setTargetDate(undefined);

    toast({
      title: "Goal created!",
      description: `Your goal "${goalName}" has been saved.`,
    });
  };

  const handleDeleteGoal = (goalId: string, goalName: string) => {
    onDeleteGoal(goalId);
    toast({
      title: "Goal deleted",
      description: `Goal "${goalName}" has been removed.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Goal Creation Form */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Goal className="h-5 w-5" />
            Set Weight Goal
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
                placeholder="e.g., Summer Body Goal"
                required
              />
            </div>

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
                required
              />
            </div>

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
                placeholder="Describe your goal motivation..."
                className="resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Goal className="mr-2 h-4 w-4" />
              Save Goal
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Goals List */}
      {goals && goals.length > 0 && (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-green-700">Your Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Goal className="h-4 w-4 text-green-600" />
                      <h4 className="font-semibold text-green-800">
                        {goal.name}
                      </h4>
                    </div>
                    <p className="text-sm text-green-700">
                      Target: {goal.targetWeight} {goal.unit} by{" "}
                      {format(new Date(goal.targetDate), "MMM dd, yyyy")}
                    </p>
                    {goal.description && (
                      <p className="text-xs text-green-600 mt-1">
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
