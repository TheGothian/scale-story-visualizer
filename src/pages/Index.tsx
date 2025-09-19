import React, { useEffect } from "react";
import { WeightForm } from "../components/WeightForm";
import { WeightChart } from "../components/WeightChart";
import { EventPredictor } from "../components/EventPredictor";
import { HamburgerMenu } from "../components/HamburgerMenu";
import { Scale } from "lucide-react";
import { BMICalculator } from "../components/BMICalculator";
import { EnhancedTrendAnalysis } from "../components/EnhancedTrendAnalysis";
import { GoalSetter } from "../components/GoalSetter";

import { PhaseGoalSetter } from "../components/PhaseGoalSetter";
import { BodybuildingAnalytics } from "../components/BodybuildingAnalytics";
import { BodyFatForm } from "../components/BodyFatForm";
import { BodyFatChart } from "../components/BodyFatChart";
import { AICoach } from "../components/AICoach";
import { useAuth } from "../hooks/useAuth";
import { useAllData } from "../hooks/useAllData";
import { useNavigate } from "react-router-dom";
import { parseISO } from "date-fns";

const IndexContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    weights,
    savedPredictions,
    weightGoals,
    bodyCompositions,
    bodybuildingGoals,
    loading,
    addWeight,
    deleteWeight,
    editWeight,
    savePrediction,
    deletePrediction,
    addGoal,
    deleteGoal,
    saveBodyComposition,
    deleteBodyComposition,
    editBodyComposition,
    addBodybuildingGoal,
    deleteBodybuildingGoal,
  } = useAllData();

  // Redirect to auth if not logged in (use useEffect to avoid setState during render)
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Show loading while redirecting
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Scale className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Redirecting to authentication...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Scale className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <HamburgerMenu />

      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Scale className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Bodybuilding Tracker
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Track your physique transformation and achieve your bodybuilding
            goals
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Welcome back, {user?.display_name || user?.email || "User"}!
          </p>
        </div>

        {/* Full Width Charts Section */}
        <div className="space-y-6 mb-8">
          <WeightChart
            weights={weights}
            predictions={savedPredictions}
            weightGoals={weightGoals}
            onDeleteWeight={deleteWeight}
            onEditWeight={editWeight}
            onDeletePrediction={deletePrediction}
          />

          <BodyFatChart
            compositions={bodyCompositions}
            onDeleteComposition={deleteBodyComposition}
            onEditComposition={editBodyComposition}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Forms and Calculators (1/3 width) */}
          <div className="lg:col-span-4 space-y-6">
            <WeightForm onAddWeight={addWeight} />
            <BodyFatForm onSaveComposition={saveBodyComposition} />
            <BMICalculator weights={weights} />
            <EventPredictor
              weights={weights}
              onSavePrediction={savePrediction}
            />
            <GoalSetter
              weightGoals={weightGoals}
              onAddGoal={addGoal}
              onDeleteGoal={deleteGoal}
            />
            <PhaseGoalSetter
              bodybuildingGoals={bodybuildingGoals}
              onAddGoal={addBodybuildingGoal}
              onDeleteGoal={deleteBodybuildingGoal}
            />
          </div>

          {/* Middle Column - Analytics (2/3 width) */}
          <div className="lg:col-span-8 space-y-6">
            <BodybuildingAnalytics
              weights={weights}
              compositions={bodyCompositions}
              goals={bodybuildingGoals}
              weightGoals={weightGoals}
            />

            {/* Goal-Specific Enhanced Trend Analysis */}
            {weightGoals &&
            weightGoals.filter((goal) => goal.isActive).length > 0 ? (
              weightGoals
                .filter((goal) => goal.isActive)
                .map((goal) => {
                  // Filter weights to only include data from when this goal was created
                  const goalWeights = weights.filter(
                    (weight) =>
                      parseISO(weight.date) >= parseISO(goal.createdAt)
                  );

                  return (
                    <div key={goal.id} className="mb-6">
                      <EnhancedTrendAnalysis
                        weights={goalWeights}
                        weightGoals={[goal]} // Only pass the specific goal
                        title={`Goal Analysis: ${goal.name}`}
                      />
                    </div>
                  );
                })
            ) : (
              // Fallback to general analysis if no active goals
              <EnhancedTrendAnalysis
                weights={weights}
                weightGoals={weightGoals}
              />
            )}

            <AICoach />
          </div>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return <IndexContent />;
};

export default Index;
