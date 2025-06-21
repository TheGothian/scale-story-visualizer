import React, { useState, useEffect } from 'react';
import { WeightForm } from '../components/WeightForm';
import { WeightChart } from '../components/WeightChart';
import { TrendAnalysis } from '../components/TrendAnalysis';
import { EventPredictor } from '../components/EventPredictor';
import { UnitToggle } from '../components/UnitToggle';
import { UnitProvider } from '../contexts/UnitContext';
import { WeightEntry, SavedPrediction, WeightGoal } from '../types/weight';
import { BodyComposition, BodybuildingGoal } from '../types/bodybuilding';
import { Scale } from 'lucide-react';
import { BMICalculator } from '../components/BMICalculator';
import { EnhancedTrendAnalysis } from '../components/EnhancedTrendAnalysis';
import { GoalSetter } from '../components/GoalSetter';
import { BodyCompositionCalculator } from '../components/BodyCompositionCalculator';
import { PhaseGoalSetter } from '../components/PhaseGoalSetter';
import { BodybuildingAnalytics } from '../components/BodybuildingAnalytics';
import { BodyFatForm } from '../components/BodyFatForm';
import { BodyFatChart } from '../components/BodyFatChart';
import { BodyCompositionTrends } from '../components/BodyCompositionTrends';

const IndexContent = () => {
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [savedPredictions, setSavedPredictions] = useState<SavedPrediction[]>([]);
  const [weightGoals, setWeightGoals] = useState<WeightGoal[]>([]);
  const [bodyCompositions, setBodyCompositions] = useState<BodyComposition[]>([]);
  const [bodybuildingGoals, setBodybuildingGoals] = useState<BodybuildingGoal[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedWeights = localStorage.getItem('weightEntries');
    if (savedWeights) {
      setWeights(JSON.parse(savedWeights));
    }
    
    const savedPreds = localStorage.getItem('savedPredictions');
    if (savedPreds) {
      setSavedPredictions(JSON.parse(savedPreds));
    }

    const savedGoals = localStorage.getItem('weightGoals');
    if (savedGoals) {
      setWeightGoals(JSON.parse(savedGoals));
    }

    const savedCompositions = localStorage.getItem('bodyCompositions');
    if (savedCompositions) {
      setBodyCompositions(JSON.parse(savedCompositions));
    }

    const savedBBGoals = localStorage.getItem('bodybuildingGoals');
    if (savedBBGoals) {
      setBodybuildingGoals(JSON.parse(savedBBGoals));
    }
  }, []);

  // Save data to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('weightEntries', JSON.stringify(weights));
  }, [weights]);

  useEffect(() => {
    localStorage.setItem('savedPredictions', JSON.stringify(savedPredictions));
  }, [savedPredictions]);

  useEffect(() => {
    localStorage.setItem('weightGoals', JSON.stringify(weightGoals));
  }, [weightGoals]);

  useEffect(() => {
    localStorage.setItem('bodyCompositions', JSON.stringify(bodyCompositions));
  }, [bodyCompositions]);

  useEffect(() => {
    localStorage.setItem('bodybuildingGoals', JSON.stringify(bodybuildingGoals));
  }, [bodybuildingGoals]);

  const addWeight = (entry: WeightEntry) => {
    setWeights(prev => [...prev, entry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const deleteWeight = (id: string) => {
    setWeights(prev => prev.filter(entry => entry.id !== id));
  };

  const editWeight = (id: string, updatedEntry: Partial<WeightEntry>) => {
    setWeights(prev => 
      prev.map(entry => 
        entry.id === id 
          ? { ...entry, ...updatedEntry }
          : entry
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );
  };

  const savePrediction = (prediction: SavedPrediction) => {
    setSavedPredictions(prev => [...prev, prediction]);
  };

  const deletePrediction = (id: string) => {
    setSavedPredictions(prev => prev.filter(prediction => prediction.id !== id));
  };

  const addGoal = (goal: WeightGoal) => {
    setWeightGoals(prev => [...prev, goal]);
  };

  const deleteGoal = (id: string) => {
    setWeightGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const saveBodyComposition = (composition: BodyComposition) => {
    setBodyCompositions(prev => [...prev, composition].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const deleteBodyComposition = (id: string) => {
    setBodyCompositions(prev => prev.filter(comp => comp.id !== id));
  };

  const editBodyComposition = (id: string, updatedComposition: Partial<BodyComposition>) => {
    setBodyCompositions(prev => 
      prev.map(comp => 
        comp.id === id 
          ? { ...comp, ...updatedComposition }
          : comp
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );
  };

  const addBodybuildingGoal = (goal: BodybuildingGoal) => {
    // Deactivate other goals of the same phase
    setBodybuildingGoals(prev => 
      prev.map(g => g.phase === goal.phase ? { ...g, isActive: false } : g)
    );
    setBodybuildingGoals(prev => [...prev, goal]);
  };

  const deleteBodybuildingGoal = (id: string) => {
    setBodybuildingGoals(prev => prev.filter(goal => goal.id !== id));
  };

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
          </div>
          <p className="text-gray-600 text-lg">
            Track your physique transformation and achieve your bodybuilding goals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            <UnitToggle />
            <WeightForm onAddWeight={addWeight} />
            <BodyFatForm onSaveComposition={saveBodyComposition} />
            <BodyCompositionCalculator 
              weights={weights}
              onSaveComposition={saveBodyComposition}
              compositions={bodyCompositions}
            />
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
            />
            
            <EnhancedTrendAnalysis weights={weights} />
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
