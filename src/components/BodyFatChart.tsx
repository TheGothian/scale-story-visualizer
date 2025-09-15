import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  LineChart,
} from "recharts";
import { Percent } from "lucide-react";
import { BodyComposition } from "../types/bodybuilding";
import { format, parseISO } from "date-fns";
import { useBodyFatChart } from "../hooks/useBodyFatChart";
import { useBodyFatChartData } from "../hooks/useBodyFatChartData";
import { BodyFatChartDot } from "./BodyFatChartDot";
import { BodyFatEditDialog } from "./BodyFatEditDialog";
import { toast } from "@/hooks/use-toast";
import { WeightChartScrollControls } from "./WeightChartScrollControls";
import { useWeightChartScroll } from "../hooks/useWeightChartScroll";

interface BodyFatChartProps {
  compositions: BodyComposition[];
  onDeleteComposition?: (id: string) => void;
  onEditComposition?: (
    id: string,
    updatedComposition: Partial<BodyComposition>
  ) => void;
}

export const BodyFatChart: React.FC<BodyFatChartProps> = ({
  compositions,
  onDeleteComposition = () => {},
  onEditComposition = () => {},
}) => {
  const {
    editingEntry,
    editBodyFat,
    setEditBodyFat,
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
  } = useBodyFatChart(onDeleteComposition, onEditComposition);

  const { iirChartData } = useBodyFatChartData(compositions);
  const hasData = iirChartData.length > 0;

  // Visibility toggles for Actual and IIR filter
  const [showActual, setShowActual] = React.useState(true);
  const [showIIR, setShowIIR] = React.useState(true);
  const toggleActual = () => setShowActual((v) => !v);
  const toggleIIR = () => setShowIIR((v) => !v);

  // Time-based zoom functionality
  const [timeView, setTimeView] = React.useState<
    "all" | "weekly" | "monthly" | "6month" | "yearly"
  >("all");

  // Navigation state for time periods
  const [timeOffset, setTimeOffset] = React.useState(0); // 0 = current, -1 = previous, 1 = next, etc.

  // Scroll controls (reuse weight chart scroll hook)
  const {
    scrollContainerRef,
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight,
  } = useWeightChartScroll(iirChartData.length);

  // Overall X-domain from data
  const allTimestamps = React.useMemo(
    () =>
      iirChartData
        .map((d: any) => d.timestamp)
        .filter((t: any) => typeof t === "number"),
    [iirChartData]
  );
  const overallXMin = allTimestamps.length ? Math.min(...allTimestamps) : 0;
  const overallXMax = allTimestamps.length ? Math.max(...allTimestamps) : 0;

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

  // Calculate time-based X domain and filter data
  const currentXDomain: [number, number] = getTimeBasedXDomain(
    timeView,
    timeOffset
  );
  const dataInRange = iirChartData.filter(
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
    iirChartData.length
  );

  // Compute a stable Y domain based on current X range
  const yCandidates: number[] = React.useMemo(() => {
    const candidates: number[] = [];
    dataInRange.forEach((d: any) => {
      if (showActual && typeof d.bodyFat === "number")
        candidates.push(d.bodyFat);
      if (showIIR && typeof d.iirFiltered === "number")
        candidates.push(d.iirFiltered);
    });
    return candidates;
  }, [dataInRange, showActual, showIIR, timeView, timeOffset]);

  const yMin = yCandidates.length ? Math.min(...yCandidates) : 0;
  const yMax = yCandidates.length ? Math.max(...yCandidates) : 50;
  const yPadding = 1;
  const yDomain: [number, number] = [
    Math.max(0, Math.floor(yMin) - yPadding),
    Math.min(100, Math.ceil(yMax) + yPadding),
  ];
  const handleSaveWithToast = () => {
    handleSaveEdit();
    toast({
      title: "Body fat updated!",
      description: `Updated to ${editBodyFat}% on ${format(
        parseISO(editDate),
        "MMM dd, yyyy"
      )}`,
    });
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const isActive = activeEntry === payload.id;

    return (
      <BodyFatChartDot
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

  return (
    <>
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-red-700 flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Body Fat Progress
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTimeViewChange("all")}
                  aria-label="Reset zoom"
                >
                  Reset Zoom
                </Button>
              )}

              {/* Time period selector */}
              <div className="flex items-center gap-1">
                <Button
                  variant={timeView === "weekly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeViewChange("weekly")}
                  className="text-xs px-2 py-1 h-7"
                  title="Current Week (Monday-Sunday)"
                >
                  Week
                </Button>
                <Button
                  variant={timeView === "monthly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeViewChange("monthly")}
                  className="text-xs px-2 py-1 h-7"
                  title="Current Month"
                >
                  Month
                </Button>
                <Button
                  variant={timeView === "6month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeViewChange("6month")}
                  className="text-xs px-2 py-1 h-7"
                  title="Current Quarter + Previous Quarter (6 months)"
                >
                  6M
                </Button>
                <Button
                  variant={timeView === "yearly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeViewChange("yearly")}
                  className="text-xs px-2 py-1 h-7"
                  title="Current Year"
                >
                  Year
                </Button>
                <Button
                  variant={timeView === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeViewChange("all")}
                  className="text-xs px-2 py-1 h-7"
                  title="All Data"
                >
                  All
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
          {hasData && (
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-2 flex-wrap">
              <button
                type="button"
                onClick={toggleActual}
                className={`flex items-center gap-1 px-2 py-1 rounded-full border select-none ${
                  showActual ? "" : "opacity-50 line-through"
                }`}
                aria-pressed={showActual}
              >
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Actual</span>
              </button>
              <button
                type="button"
                onClick={toggleIIR}
                className={`flex items-center gap-1 px-2 py-1 rounded-full border select-none ${
                  showIIR ? "" : "opacity-50 line-through"
                }`}
                aria-pressed={showIIR}
              >
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>IIR Filter (a=0.3)</span>
              </button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {hasData ? (
            <div className="flex items-stretch">
              {/* Fixed Y-axis panel */}
              <div className="h-80 w-16 flex-shrink-0">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart
                    data={dataInRange}
                    margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
                  >
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      domain={yDomain}
                      tickFormatter={(value) => `${value}%`}
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
                >
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart
                      data={dataInRange}
                      margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient
                          id="bodyFatGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#ef4444"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#ef4444"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                      <XAxis
                        dataKey="timestamp"
                        type="number"
                        scale="time"
                        domain={currentXDomain}
                        stroke="#64748b"
                        fontSize={12}
                        tickFormatter={(timestamp) =>
                          format(new Date(timestamp), "MMM dd")
                        }
                      />
                      {/* Hidden Y-axis to lock domain with the fixed axis */}
                      <YAxis
                        domain={yDomain}
                        stroke="#64748b"
                        fontSize={12}
                        tick={false}
                        axisLine={false}
                        width={0}
                      />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "bodyFat")
                            return [`${value}%`, "Body Fat"];
                          if (name === "iirFiltered")
                            return [`${value}%`, "IIR Filter (a=0.3)"];
                          return [`${value}%`, name];
                        }}
                        labelFormatter={(timestamp) =>
                          format(new Date(timestamp), "MMM dd, yyyy")
                        }
                        labelStyle={{ color: "#374151" }}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />

                      {/* Actual body fat line */}
                      {showActual && (
                        <Line
                          type="monotone"
                          dataKey="bodyFat"
                          stroke="#ef4444"
                          strokeWidth={3}
                          dot={<CustomDot />}
                          connectNulls={false}
                        />
                      )}
                      {/* IIR Filtered line */}
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
          ) : (
            <div className="h-64 flex items-center justify-center bg-red-50 rounded-lg">
              <div className="text-center">
                <Percent className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-600 mb-2">No body fat data available</p>
                <p className="text-sm text-red-500">
                  Log your body fat percentage to see your progress
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <BodyFatEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        editBodyFat={editBodyFat}
        setEditBodyFat={setEditBodyFat}
        editDate={editDate}
        setEditDate={setEditDate}
        onSave={handleSaveWithToast}
      />
    </>
  );
};
