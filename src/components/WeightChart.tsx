import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format } from "date-fns";
import { WeightEntry, SavedPrediction, WeightGoal } from "../types/weight";
import { useUnit } from "../contexts/UnitContext";
import { WeightChartDot } from "./WeightChartDot";
import { WeightEditDialog } from "./WeightEditDialog";
import { WeightChartTooltip } from "./WeightChartTooltip";
import { WeightChartLegend } from "./WeightChartLegend";
import { WeightChartScrollControls } from "./WeightChartScrollControls";
import { useWeightChart } from "../hooks/useWeightChart";
import { useWeightChartData } from "../hooks/useWeightChartData";
import { useWeightChartScroll } from "../hooks/useWeightChartScroll";
import { useIsMobile } from "../hooks/use-mobile";

interface WeightChartProps {
  weights: WeightEntry[];
  savedPredictions: SavedPrediction[];
  weightGoals: WeightGoal[];
  onDeleteWeight: (id: string) => void;
  onEditWeight: (id: string, updatedEntry: Partial<WeightEntry>) => void;
  onDeletePrediction: (id: string) => void;
}

export const WeightChart: React.FC<WeightChartProps> = ({
  weights,
  savedPredictions = [],
  weightGoals = [],
  onDeleteWeight,
  onEditWeight,
  onDeletePrediction,
}) => {
  const { getWeightUnit, convertWeight, unitSystem } = useUnit();

  const {
    editWeight,
    setEditWeight,
    editNote,
    setEditNote,
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
  } = useWeightChart(onDeleteWeight, onEditWeight);

  const { combinedData, weightChange, latestWeight, goalLines } =
    useWeightChartData(weights, savedPredictions, weightGoals);

  const {
    scrollContainerRef,
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight,
  } = useWeightChartScroll(combinedData.length);

  // Visibility toggles for IIR filter and goals
  const [showIIR, setShowIIR] = React.useState(true);
  const [showActualWeight, setShowActualWeight] = React.useState(true);
  const [visibleGoals, setVisibleGoals] = React.useState<Set<string>>(
    new Set(goalLines.map((g) => g.id))
  );

  // Time-based zoom functionality
  const [timeView, setTimeView] = React.useState<
    "all" | "weekly" | "monthly" | "6month" | "yearly"
  >("all");

  // Navigation state for time periods
  const [timeOffset, setTimeOffset] = React.useState(0); // 0 = current, -1 = previous, 1 = next, etc.

  React.useEffect(() => {
    // Initialize/refresh visible goals when goalLines change
    setVisibleGoals((prev) => {
      const next = new Set<string>();
      for (const g of goalLines) next.add(g.id);
      return next;
    });
  }, [goalLines]);

  const toggleIIR = () => setShowIIR((v) => !v);
  const toggleActualWeight = () => setShowActualWeight((v) => !v);
  const toggleGoal = (id: string) => {
    setVisibleGoals((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Time view change handler
  const handleTimeViewChange = (
    view: "all" | "weekly" | "monthly" | "6month" | "yearly"
  ) => {
    console.log("Time view changing from", timeView, "to", view);
    setTimeView(view);
    setTimeOffset(0); // Reset to current period when changing view type
  };

  // Navigation handlers
  const goToPreviousPeriod = () => {
    setTimeOffset((prev) => prev - 1);
  };

  const goToNextPeriod = () => {
    setTimeOffset((prev) => prev + 1);
  };

  // Mobile detection
  const isMobile = useIsMobile();

  // Overall X-domain from data
  const allTimestamps = React.useMemo(
    () =>
      combinedData
        .map((d: any) => d.timestamp)
        .filter((t: any) => typeof t === "number"),
    [combinedData]
  );
  const overallXMin = Math.min(...allTimestamps);
  const overallXMax = Math.max(...allTimestamps);

  // Calculate time-based X domain
  const getTimeBasedXDomain = React.useCallback(
    (view: typeof timeView, offset: number): [number, number] => {
      if (view === "all") {
        console.log("Using all data domain:", [overallXMin, overallXMax]);
        return [overallXMin, overallXMax];
      }

      const now = new Date();
      const oneDay = 24 * 60 * 60 * 1000;

      let startTime: number;
      let endTime: number;

      switch (view) {
        case "weekly": {
          // Get current week (Monday to Sunday) + offset
          const dayOfWeek = now.getDay();
          const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, so Monday = 1
          const monday = new Date(now);
          monday.setDate(now.getDate() - mondayOffset);
          monday.setHours(0, 0, 0, 0);

          // Apply offset
          monday.setDate(monday.getDate() + offset * 7);

          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          sunday.setHours(23, 59, 59, 999);

          startTime = monday.getTime();
          endTime = sunday.getTime();
          console.log("Weekly view:", {
            monday: monday.toISOString(),
            sunday: sunday.toISOString(),
            startTime,
            endTime,
            offset,
          });
          break;
        }
        case "monthly": {
          // Get current month + offset
          const firstDay = new Date(
            now.getFullYear(),
            now.getMonth() + offset,
            1
          );
          const lastDay = new Date(
            firstDay.getFullYear(),
            firstDay.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
          );

          startTime = firstDay.getTime();
          endTime = lastDay.getTime();
          console.log("Monthly view:", {
            firstDay: firstDay.toISOString(),
            lastDay: lastDay.toISOString(),
            startTime,
            endTime,
            offset,
          });
          break;
        }
        case "6month": {
          // Get current quarter + offset
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const quarterStartMonth = currentQuarter * 3;
          const quarterStart = new Date(
            now.getFullYear(),
            quarterStartMonth + offset * 3,
            1
          );

          // Go back 6 months from quarter start
          const sixMonthStart = new Date(quarterStart);
          sixMonthStart.setMonth(quarterStart.getMonth() - 6);

          const quarterEnd = new Date(
            quarterStart.getFullYear(),
            quarterStart.getMonth() + 3,
            0,
            23,
            59,
            59,
            999
          );

          startTime = sixMonthStart.getTime();
          endTime = quarterEnd.getTime();
          console.log("6-month view:", {
            sixMonthStart: sixMonthStart.toISOString(),
            quarterEnd: quarterEnd.toISOString(),
            startTime,
            endTime,
            offset,
          });
          break;
        }
        case "yearly": {
          // Get current year + offset
          const yearStart = new Date(now.getFullYear() + offset, 0, 1);
          const yearEnd = new Date(
            yearStart.getFullYear(),
            11,
            31,
            23,
            59,
            59,
            999
          );

          startTime = yearStart.getTime();
          endTime = yearEnd.getTime();
          console.log("Yearly view:", {
            yearStart: yearStart.toISOString(),
            yearEnd: yearEnd.toISOString(),
            startTime,
            endTime,
            offset,
          });
          break;
        }
        default:
          startTime = overallXMin;
          endTime = overallXMax;
      }

      // Ensure we don't go before the earliest data point or after the latest
      startTime = Math.max(startTime, overallXMin);
      endTime = Math.min(endTime, overallXMax);

      console.log(
        "Final domain for",
        view,
        ":",
        [startTime, endTime],
        "data range:",
        [overallXMin, overallXMax],
        "offset:",
        offset
      );
      return [startTime, endTime];
    },
    [overallXMin, overallXMax]
  );

  // Calculate Y-axis domain based on visible data
  const currentXDomain: [number, number] = getTimeBasedXDomain(
    timeView,
    timeOffset
  );
  const dataInRange = combinedData.filter(
    (d: any) =>
      d.timestamp >= currentXDomain[0] && d.timestamp <= currentXDomain[1]
  );

  console.log(
    "Time view:",
    timeView,
    "X domain:",
    currentXDomain,
    "data in range:",
    dataInRange.length,
    "total data:",
    combinedData.length
  );

  const yCandidates: number[] = React.useMemo(() => {
    const candidates: number[] = [];
    dataInRange.forEach((d: any) => {
      if (showActualWeight && typeof d.displayWeight === "number")
        candidates.push(d.displayWeight);
      if (showIIR && typeof d.iirFiltered === "number")
        candidates.push(d.iirFiltered);
    });
    goalLines.forEach((g) => {
      if (visibleGoals.has(g.id) && typeof g.targetWeight === "number")
        candidates.push(g.targetWeight);
    });
    return candidates;
  }, [
    dataInRange,
    showActualWeight,
    showIIR,
    goalLines,
    visibleGoals,
    timeView,
    timeOffset,
  ]);
  const hasYCandidates = yCandidates.length > 0;
  const yMin = hasYCandidates ? Math.min(...yCandidates) : 0;
  const yMax = hasYCandidates ? Math.max(...yCandidates) : 1;
  // Ensure a non-zero range to render a visible line even if all values are equal
  const yDomain: [number, number] =
    yMin === yMax ? [yMin - 0.5, yMax + 0.5] : [yMin, yMax];

  // Define colors for goal lines
  const goalColors = [
    "#ef4444",
    "#f97316",
    "#84cc16",
    "#06b6d4",
    "#8b5cf6",
    "#ec4899",
  ];

  // Debug logging
  console.log(
    "WeightChart render - weights:",
    weights?.length || 0,
    "predictions:",
    savedPredictions?.length || 0,
    "goals:",
    weightGoals?.length || 0
  );
  console.log("Goal lines to render:", goalLines);
  // Early return for no data
  if (!weights || weights.length === 0) {
    console.log("No weights data available");
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-blue-700">Weight Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <p>No weight entries yet. Start by logging your first weight!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle prediction deletion
  const handleDeletePrediction = (
    predictionId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    console.log("Deleting prediction:", predictionId);
    onDeletePrediction(predictionId);
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;

    if (!payload) return null;

    // Special styling for prediction points
    if (payload.isPrediction) {
      return (
        <g>
          <circle
            cx={cx}
            cy={cy}
            r={6}
            fill="#f59e0b"
            stroke="#d97706"
            strokeWidth={2}
            className="cursor-pointer"
          />
          <circle
            cx={cx + 12}
            cy={cy - 12}
            r={8}
            fill="#ef4444"
            stroke="#ffffff"
            strokeWidth={1}
            className="cursor-pointer hover:fill-red-600"
            onClick={(e) => handleDeletePrediction(payload.id, e)}
          />
          <text
            x={cx + 12}
            y={cy - 8}
            fill="white"
            fontSize="10"
            textAnchor="middle"
            className="cursor-pointer pointer-events-none"
          >
            ×
          </text>
        </g>
      );
    }

    const isActive = activeEntry === payload.id;

    return (
      <WeightChartDot
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

  // Ensure we have valid data before rendering the chart
  if (combinedData.length === 0) {
    console.log("No combined data available for chart");
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-blue-700">Weight Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <p>
              Unable to process weight data. Please try refreshing the page.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <CardTitle className="text-blue-700">Weight Progress</CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              {latestWeight && (
                <div className="flex items-center gap-2 text-sm">
                  {weightChange > 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : weightChange < 0 ? (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  ) : (
                    <Minus className="h-4 w-4 text-gray-500" />
                  )}
                  <span
                    className={
                      weightChange > 0
                        ? "text-red-500"
                        : weightChange < 0
                        ? "text-green-500"
                        : "text-gray-500"
                    }
                  >
                    {weightChange > 0 ? "+" : ""}
                    {weightChange.toFixed(1)} {getWeightUnit()}
                  </span>
                </div>
              )}

              {/* Time period selector */}
              <div className="flex items-center gap-1 flex-wrap">
                <Button
                  variant={timeView === "weekly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeViewChange("weekly")}
                  className="text-xs px-1.5 sm:px-2 py-1 h-6 sm:h-7"
                  title="Current Week (Monday-Sunday)"
                >
                  <span className="hidden sm:inline">Week</span>
                  <span className="sm:hidden">W</span>
                </Button>
                <Button
                  variant={timeView === "monthly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeViewChange("monthly")}
                  className="text-xs px-1.5 sm:px-2 py-1 h-6 sm:h-7"
                  title="Current Month"
                >
                  <span className="hidden sm:inline">Month</span>
                  <span className="sm:hidden">M</span>
                </Button>
                <Button
                  variant={timeView === "6month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeViewChange("6month")}
                  className="text-xs px-1.5 sm:px-2 py-1 h-6 sm:h-7"
                  title="Current Quarter + Previous Quarter (6 months)"
                >
                  6M
                </Button>
                <Button
                  variant={timeView === "yearly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeViewChange("yearly")}
                  className="text-xs px-1.5 sm:px-2 py-1 h-6 sm:h-7"
                  title="Current Year"
                >
                  <span className="hidden sm:inline">Year</span>
                  <span className="sm:hidden">Y</span>
                </Button>
                <Button
                  variant={timeView === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeViewChange("all")}
                  className="text-xs px-1.5 sm:px-2 py-1 h-6 sm:h-7"
                  title="All Data"
                >
                  <span className="hidden sm:inline">All</span>
                  <span className="sm:hidden">A</span>
                </Button>
              </div>

              {/* Time period indicator */}
              {timeView !== "all" && (
                <div className="text-xs text-gray-600 text-center">
                  {timeOffset === 0
                    ? "Current"
                    : timeOffset < 0
                    ? `${Math.abs(timeOffset)} ${
                        timeView === "weekly"
                          ? "weeks"
                          : timeView === "monthly"
                          ? "months"
                          : timeView === "6month"
                          ? "quarters"
                          : "years"
                      } ago`
                    : `${timeOffset} ${
                        timeView === "weekly"
                          ? "weeks"
                          : timeView === "monthly"
                          ? "months"
                          : timeView === "6month"
                          ? "quarters"
                          : "years"
                      } ahead`}
                </div>
              )}

              <WeightChartScrollControls
                dataLength={dataInRange.length}
                canScrollLeft={
                  timeView === "all" ? canScrollLeft : timeOffset > -10
                } // Allow going back up to 10 periods
                canScrollRight={
                  timeView === "all" ? canScrollRight : timeOffset < 10
                } // Allow going forward up to 10 periods
                onScrollLeft={
                  timeView === "all" ? scrollLeft : goToPreviousPeriod
                }
                onScrollRight={
                  timeView === "all" ? scrollRight : goToNextPeriod
                }
              />
            </div>
          </div>
          <WeightChartLegend
            hasData={weights.length > 0}
            hasPredictions={savedPredictions.length > 0}
            goalLines={goalLines}
            showIIR={showIIR}
            onToggleIIR={toggleIIR}
            visibleGoalIds={[...visibleGoals]}
            onToggleGoal={toggleGoal}
            showActualWeight={showActualWeight}
            onToggleActualWeight={toggleActualWeight}
          />
        </CardHeader>
        <CardContent>
          <div className="flex items-stretch">
            {/* Fixed Y-axis panel */}
            <div className={`h-80 ${isMobile ? "w-12" : "w-16"} flex-shrink-0`}>
              <ResponsiveContainer width="100%" height={isMobile ? 250 : 320}>
                <LineChart
                  data={dataInRange}
                  margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
                >
                  <YAxis
                    stroke="#64748b"
                    fontSize={isMobile ? 10 : 12}
                    domain={yDomain}
                    width={isMobile ? 40 : 60}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Scrollable chart area */}
            <div
              ref={scrollContainerRef}
              className="h-80 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 flex-1"
              onClick={handleChartClick}
            >
              <div
                style={{ minWidth: Math.max(800, dataInRange.length * 60) }}
                className="select-none"
              >
                <ResponsiveContainer width="100%" height={isMobile ? 250 : 320}>
                  <LineChart
                    data={dataInRange}
                    margin={{
                      top: 20,
                      right: isMobile ? 20 : 30,
                      left: isMobile ? 5 : 10,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis
                      dataKey="timestamp"
                      type="number"
                      scale="time"
                      domain={currentXDomain}
                      stroke="#64748b"
                      fontSize={isMobile ? 10 : 12}
                      tickFormatter={(timestamp) =>
                        format(new Date(timestamp), "MMM dd")
                      }
                    />
                    {/* Hidden Y-axis to lock domain with the fixed axis */}
                    <YAxis
                      domain={yDomain}
                      stroke="#64748b"
                      fontSize={isMobile ? 10 : 12}
                      tick={false}
                      axisLine={false}
                      width={0}
                    />

                    <Tooltip
                      content={(props) => (
                        <WeightChartTooltip
                          {...props}
                          onDeletePrediction={handleDeletePrediction}
                        />
                      )}
                    />

                    {goalLines
                      .filter((g) => visibleGoals.has(g.id))
                      .map((goal, index) => (
                        <ReferenceLine
                          key={goal.id}
                          y={goal.targetWeight}
                          stroke={goalColors[index % goalColors.length]}
                          strokeDasharray="8 4"
                          strokeWidth={2}
                          label={{
                            value: goal.name,
                            position: "insideTopLeft",
                            fill: goalColors[index % goalColors.length],
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        />
                      ))}

                    {showActualWeight && (
                      <Line
                        type="monotone"
                        dataKey="displayWeight"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={<CustomDot />}
                        connectNulls={false}
                      />
                    )}

                    {showIIR && (
                      <Line
                        type="monotone"
                        dataKey="iirFiltered"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={false}
                        connectNulls={false}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <WeightEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        editWeight={editWeight}
        setEditWeight={setEditWeight}
        editNote={editNote}
        setEditNote={setEditNote}
        editDate={editDate}
        setEditDate={setEditDate}
        onSave={handleSaveEdit}
      />
    </>
  );
};
