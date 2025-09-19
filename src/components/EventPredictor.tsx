import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Target,
  TrendingUp,
  TrendingDown,
  Save,
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { WeightEntry, SavedPrediction } from "../types/weight";
import { calculateTrend, predictWeight } from "../utils/calculations";
import { useUnit } from "../contexts/UnitContext";

interface EventPredictorProps {
  weights?: WeightEntry[]; // Make optional
  onSavePrediction: (prediction: SavedPrediction) => void;
}

export const EventPredictor: React.FC<EventPredictorProps> = ({
  weights = [], // Provide default empty array
  onSavePrediction,
}) => {
  const { getWeightUnit, convertWeight, unitSystem } = useUnit();
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState<Date>();
  const [prediction, setPrediction] = useState<number | null>(null);

  const handlePredict = () => {
    if (!eventDate || !weights || weights.length < 2) return;

    const latestEntry = weights[weights.length - 1];
    const latestDate = parseISO(latestEntry.date);
    const daysUntilEvent = differenceInDays(eventDate, latestDate);

    const predictedWeight = predictWeight(weights, daysUntilEvent);
    setPrediction(predictedWeight);
  };

  const handleSavePrediction = () => {
    if (!eventDate || !eventName || prediction === null) return;

    const currentUnit = getWeightUnit() as "kg" | "lbs";
    const savedPrediction: SavedPrediction = {
      id: Date.now().toString(),
      name: eventName,
      targetDate: eventDate.toISOString().split("T")[0],
      predictedWeight: prediction,
      unit: currentUnit,
      createdAt: new Date().toISOString(),
    };

    onSavePrediction(savedPrediction);

    // Reset form after saving
    setEventName("");
    setEventDate(undefined);
    setPrediction(null);
  };

  const trend = weights && weights.length > 1 ? calculateTrend(weights) : null;
  const isLosingWeight = trend && trend.slope < 0;
  const currentUnit = getWeightUnit();

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Target className="h-5 w-5" />
          Event Predictor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="eventName">Event Name</Label>
          <Input
            id="eventName"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="e.g., Wedding, Vacation, Reunion"
          />
        </div>

        <div className="space-y-2">
          <Label>Event Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !eventDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {eventDate ? (
                  format(eventDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={eventDate}
                onSelect={setEventDate}
                disabled={(date) => date <= new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button
          onClick={handlePredict}
          disabled={!eventDate || !weights || weights.length < 2 || !eventName}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          Predict Weight
        </Button>

        {prediction !== null && eventDate && eventName && (
          <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              {isLosingWeight ? (
                <TrendingDown className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingUp className="h-5 w-5 text-blue-600" />
              )}
              <h4 className="font-semibold text-gray-800">
                Prediction for {eventName}
              </h4>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {prediction.toFixed(1)} {currentUnit}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              on {format(eventDate, "MMMM dd, yyyy")}
            </p>
            {weights && weights.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Change from current:{" "}
                {(prediction - weights[weights.length - 1].weight).toFixed(1)}{" "}
                {currentUnit}
              </p>
            )}
            <Button
              onClick={handleSavePrediction}
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Prediction
            </Button>
          </div>
        )}

        {(!weights || weights.length < 2) && (
          <p className="text-sm text-gray-500 text-center py-4">
            Add at least 2 weight entries to enable predictions
          </p>
        )}
      </CardContent>
    </Card>
  );
};
