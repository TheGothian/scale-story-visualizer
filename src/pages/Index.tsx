import React from 'react';
import { WeightForm } from '../components/WeightForm';
import { WeightChart } from '../components/WeightChart';
import { EventPredictor } from '../components/EventPredictor';
import { UnitToggle } from '../components/UnitToggle';
import { UnitProvider } from '../contexts/UnitContext';
import { Scale, LogOut } from 'lucide-react';
import { BMICalculator } from '../components/BMICalculator';
import { EnhancedTrendAnalysis } from '../components/EnhancedTrendAnalysis';
import { GoalSetter } from '../components/GoalSetter';

import { PhaseGoalSetter } from '../components/PhaseGoalSetter';
import { BodybuildingAnalytics } from '../components/BodybuildingAnalytics';
import { BodyFatForm } from '../components/BodyFatForm';
import { BodyFatChart } from '../components/BodyFatChart';
import { useAuth } from '../hooks/useAuth';
import { useAllData } from '../hooks/useAllData';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const IndexContent = () => {
  const { user, signOut } = useAuth();
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
    deleteBodybuildingGoal
  } = useAllData();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate('/auth');
  };

  // Redirect to auth if not logged in
  if (!user) {
    navigate('/auth');
    return null;
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Scale className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Bodybuilding Tracker
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/weights')}
              className="ml-2"
            >
              View All Weights
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="ml-2"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
          <p className="text-gray-600 text-lg">
            Track your physique transformation and achieve your bodybuilding goals
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Welcome back, {user.email}!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            <UnitToggle />
            <WeightForm onAddWeight={addWeight} />
            <BodyFatForm onSaveComposition={saveBodyComposition} />
            <PhaseGoalSetter 
              goals={bodybuildingGoals}
              onAddGoal={addBodybuildingGoal}
              onDeleteGoal={deleteBodybuildingGoal}
            />
            <GoalSetter 
              goals={weightGoals}
              onAddGoal={addGoal}
              onDeleteGoal={deleteGoal}
            />
            <BMICalculator weights={weights} />
            <EventPredictor weights={weights} onSavePrediction={savePrediction} />
          </div>

          {/* Right Column - Charts and Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <WeightChart 
              weights={weights}
              savedPredictions={savedPredictions}
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
            
            <BodybuildingAnalytics 
              weights={weights}
              compositions={bodyCompositions}
              goals={bodybuildingGoals}
              weightGoals={weightGoals}
            />
            
            <EnhancedTrendAnalysis weights={weights} weightGoals={weightGoals} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <UnitProvider>
      <IndexContent />
    </UnitProvider>
  );
};

export default Index;
