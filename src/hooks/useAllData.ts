
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useWeightData } from './useWeightData';
import { usePredictionData } from './usePredictionData';
import { useGoalData } from './useGoalData';
import { useBodyCompositionData } from './useBodyCompositionData';
import { useBodybuildingGoalData } from './useBodybuildingGoalData';
import { toast } from '@/hooks/use-toast';

export const useAllData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const weightData = useWeightData();
  const predictionData = usePredictionData();
  const goalData = useGoalData();
  const bodyCompositionData = useBodyCompositionData();
  const bodybuildingGoalData = useBodybuildingGoalData();

  const loadAllData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        weightData.loadWeights(),
        predictionData.loadPredictions(),
        goalData.loadWeightGoals(),
        bodyCompositionData.loadBodyCompositions(),
        bodybuildingGoalData.loadBodybuildingGoals()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error loading data",
        description: "Please refresh the page to try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  return {
    // Data
    weights: weightData.weights,
    savedPredictions: predictionData.savedPredictions,
    weightGoals: goalData.weightGoals,
    bodyCompositions: bodyCompositionData.bodyCompositions,
    bodybuildingGoals: bodybuildingGoalData.bodybuildingGoals,
    loading,
    
    // Weight operations
    addWeight: weightData.addWeight,
    deleteWeight: weightData.deleteWeight,
    editWeight: weightData.editWeight,
    
    // Prediction operations
    savePrediction: predictionData.savePrediction,
    deletePrediction: predictionData.deletePrediction,
    
    // Goal operations
    addGoal: goalData.addGoal,
    deleteGoal: goalData.deleteGoal,
    
    // Body composition operations
    saveBodyComposition: bodyCompositionData.saveBodyComposition,
    deleteBodyComposition: bodyCompositionData.deleteBodyComposition,
    editBodyComposition: bodyCompositionData.editBodyComposition,
    
    // Bodybuilding goal operations
    addBodybuildingGoal: bodybuildingGoalData.addBodybuildingGoal,
    deleteBodybuildingGoal: bodybuildingGoalData.deleteBodybuildingGoal
  };
};
