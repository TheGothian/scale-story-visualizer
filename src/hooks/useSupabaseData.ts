
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WeightEntry, SavedPrediction, WeightGoal } from '../types/weight';
import { BodyComposition, BodybuildingGoal } from '../types/bodybuilding';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export const useSupabaseData = () => {
  const { user } = useAuth();
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [savedPredictions, setSavedPredictions] = useState<SavedPrediction[]>([]);
  const [weightGoals, setWeightGoals] = useState<WeightGoal[]>([]);
  const [bodyCompositions, setBodyCompositions] = useState<BodyComposition[]>([]);
  const [bodybuildingGoals, setBodybuildingGoals] = useState<BodybuildingGoal[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      // Clear data when user logs out
      setWeights([]);
      setSavedPredictions([]);
      setWeightGoals([]);
      setBodyCompositions([]);
      setBodybuildingGoals([]);
    }
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadWeights(),
        loadPredictions(),
        loadWeightGoals(),
        loadBodyCompositions(),
        loadBodybuildingGoals()
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

  const loadWeights = async () => {
    const { data, error } = await supabase
      .from('weight_entries')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    
    const formattedWeights: WeightEntry[] = data.map(entry => ({
      id: entry.id,
      weight: Number(entry.weight),
      date: entry.date,
      note: entry.note,
      unit: entry.unit as 'kg' | 'lbs'
    }));
    
    setWeights(formattedWeights);
  };

  const loadPredictions = async () => {
    const { data, error } = await supabase
      .from('saved_predictions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const formattedPredictions: SavedPrediction[] = data.map(pred => ({
      id: pred.id,
      name: pred.name,
      targetDate: pred.target_date,
      predictedWeight: Number(pred.predicted_weight),
      unit: pred.unit as 'kg' | 'lbs',
      createdAt: pred.created_at
    }));
    
    setSavedPredictions(formattedPredictions);
  };

  const loadWeightGoals = async () => {
    const { data, error } = await supabase
      .from('weight_goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const formattedGoals: WeightGoal[] = data.map(goal => ({
      id: goal.id,
      name: goal.name,
      targetWeight: Number(goal.target_weight),
      targetDate: goal.target_date,
      description: goal.description,
      unit: goal.unit as 'kg' | 'lbs',
      createdAt: goal.created_at,
      isActive: goal.is_active
    }));
    
    setWeightGoals(formattedGoals);
  };

  const loadBodyCompositions = async () => {
    const { data, error } = await supabase
      .from('body_compositions')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    
    const formattedCompositions: BodyComposition[] = data.map(comp => ({
      id: comp.id,
      date: comp.date,
      bodyFatPercentage: comp.body_fat_percentage ? Number(comp.body_fat_percentage) : undefined,
      muscleMass: comp.muscle_mass ? Number(comp.muscle_mass) : undefined,
      visceralFat: comp.visceral_fat ? Number(comp.visceral_fat) : undefined,
      waterPercentage: comp.water_percentage ? Number(comp.water_percentage) : undefined,
      boneMass: comp.bone_mass ? Number(comp.bone_mass) : undefined,
      metabolicAge: comp.metabolic_age,
      measurements: comp.measurements || {},
      createdAt: comp.created_at
    }));
    
    setBodyCompositions(formattedCompositions);
  };

  const loadBodybuildingGoals = async () => {
    const { data, error } = await supabase
      .from('bodybuilding_goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const formattedGoals: BodybuildingGoal[] = data.map(goal => ({
      id: goal.id,
      name: goal.name,
      phase: goal.phase as any,
      targetWeight: goal.target_weight ? Number(goal.target_weight) : undefined,
      targetBodyFat: goal.target_body_fat ? Number(goal.target_body_fat) : undefined,
      targetMuscleMass: goal.target_muscle_mass ? Number(goal.target_muscle_mass) : undefined,
      weeklyWeightTarget: goal.weekly_weight_target ? Number(goal.weekly_weight_target) : undefined,
      caloricTarget: goal.caloric_target,
      proteinTarget: goal.protein_target,
      metrics: goal.metrics || [],
      targetDate: goal.target_date,
      description: goal.description,
      unit: goal.unit as 'kg' | 'lbs',
      isActive: goal.is_active,
      createdAt: goal.created_at
    }));
    
    setBodybuildingGoals(formattedGoals);
  };

  // CRUD operations
  const addWeight = async (entry: Omit<WeightEntry, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('weight_entries')
      .insert({
        user_id: user.id,
        weight: entry.weight,
        date: entry.date,
        note: entry.note,
        unit: entry.unit
      })
      .select()
      .single();

    if (error) throw error;
    
    const newEntry: WeightEntry = {
      id: data.id,
      weight: Number(data.weight),
      date: data.date,
      note: data.note,
      unit: data.unit as 'kg' | 'lbs'
    };
    
    setWeights(prev => [...prev, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const deleteWeight = async (id: string) => {
    const { error } = await supabase
      .from('weight_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setWeights(prev => prev.filter(entry => entry.id !== id));
  };

  const editWeight = async (id: string, updatedEntry: Partial<WeightEntry>) => {
    const { error } = await supabase
      .from('weight_entries')
      .update({
        weight: updatedEntry.weight,
        date: updatedEntry.date,
        note: updatedEntry.note
      })
      .eq('id', id);

    if (error) throw error;
    
    setWeights(prev => 
      prev.map(entry => 
        entry.id === id 
          ? { ...entry, ...updatedEntry }
          : entry
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );
  };

  const savePrediction = async (prediction: Omit<SavedPrediction, 'id' | 'createdAt'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('saved_predictions')
      .insert({
        user_id: user.id,
        name: prediction.name,
        target_date: prediction.targetDate,
        predicted_weight: prediction.predictedWeight,
        unit: prediction.unit
      })
      .select()
      .single();

    if (error) throw error;
    
    const newPrediction: SavedPrediction = {
      id: data.id,
      name: data.name,
      targetDate: data.target_date,
      predictedWeight: Number(data.predicted_weight),
      unit: data.unit as 'kg' | 'lbs',
      createdAt: data.created_at
    };
    
    setSavedPredictions(prev => [newPrediction, ...prev]);
  };

  const deletePrediction = async (id: string) => {
    const { error } = await supabase
      .from('saved_predictions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setSavedPredictions(prev => prev.filter(prediction => prediction.id !== id));
  };

  const addGoal = async (goal: Omit<WeightGoal, 'id' | 'createdAt'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('weight_goals')
      .insert({
        user_id: user.id,
        name: goal.name,
        target_weight: goal.targetWeight,
        target_date: goal.targetDate,
        description: goal.description,
        unit: goal.unit,
        is_active: goal.isActive
      })
      .select()
      .single();

    if (error) throw error;
    
    const newGoal: WeightGoal = {
      id: data.id,
      name: data.name,
      targetWeight: Number(data.target_weight),
      targetDate: data.target_date,
      description: data.description,
      unit: data.unit as 'kg' | 'lbs',
      createdAt: data.created_at,
      isActive: data.is_active
    };
    
    setWeightGoals(prev => [newGoal, ...prev]);
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('weight_goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setWeightGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const saveBodyComposition = async (composition: Omit<BodyComposition, 'id' | 'createdAt'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('body_compositions')
      .insert({
        user_id: user.id,
        date: composition.date,
        body_fat_percentage: composition.bodyFatPercentage,
        muscle_mass: composition.muscleMass,
        visceral_fat: composition.visceralFat,
        water_percentage: composition.waterPercentage,
        bone_mass: composition.boneMass,
        metabolic_age: composition.metabolicAge,
        measurements: composition.measurements
      })
      .select()
      .single();

    if (error) throw error;
    
    const newComposition: BodyComposition = {
      id: data.id,
      date: data.date,
      bodyFatPercentage: data.body_fat_percentage ? Number(data.body_fat_percentage) : undefined,
      muscleMass: data.muscle_mass ? Number(data.muscle_mass) : undefined,
      visceralFat: data.visceral_fat ? Number(data.visceral_fat) : undefined,
      waterPercentage: data.water_percentage ? Number(data.water_percentage) : undefined,
      boneMass: data.bone_mass ? Number(data.bone_mass) : undefined,
      metabolicAge: data.metabolic_age,
      measurements: data.measurements || {},
      createdAt: data.created_at
    };
    
    setBodyCompositions(prev => [...prev, newComposition].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const deleteBodyComposition = async (id: string) => {
    const { error } = await supabase
      .from('body_compositions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setBodyCompositions(prev => prev.filter(comp => comp.id !== id));
  };

  const editBodyComposition = async (id: string, updatedComposition: Partial<BodyComposition>) => {
    const { error } = await supabase
      .from('body_compositions')
      .update({
        date: updatedComposition.date,
        body_fat_percentage: updatedComposition.bodyFatPercentage,
        muscle_mass: updatedComposition.muscleMass,
        measurements: updatedComposition.measurements
      })
      .eq('id', id);

    if (error) throw error;
    
    setBodyCompositions(prev => 
      prev.map(comp => 
        comp.id === id 
          ? { ...comp, ...updatedComposition }
          : comp
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );
  };

  const addBodybuildingGoal = async (goal: Omit<BodybuildingGoal, 'id' | 'createdAt'>) => {
    if (!user) return;

    // Deactivate other goals of the same phase
    if (goal.isActive) {
      await supabase
        .from('bodybuilding_goals')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('phase', goal.phase);
    }

    const { data, error } = await supabase
      .from('bodybuilding_goals')
      .insert({
        user_id: user.id,
        name: goal.name,
        phase: goal.phase,
        target_weight: goal.targetWeight,
        target_body_fat: goal.targetBodyFat,
        target_muscle_mass: goal.targetMuscleMass,
        weekly_weight_target: goal.weeklyWeightTarget,
        caloric_target: goal.caloricTarget,
        protein_target: goal.proteinTarget,
        metrics: goal.metrics,
        target_date: goal.targetDate,
        description: goal.description,
        unit: goal.unit,
        is_active: goal.isActive
      })
      .select()
      .single();

    if (error) throw error;
    
    const newGoal: BodybuildingGoal = {
      id: data.id,
      name: data.name,
      phase: data.phase as any,
      targetWeight: data.target_weight ? Number(data.target_weight) : undefined,
      targetBodyFat: data.target_body_fat ? Number(data.target_body_fat) : undefined,
      targetMuscleMass: data.target_muscle_mass ? Number(data.target_muscle_mass) : undefined,
      weeklyWeightTarget: data.weekly_weight_target ? Number(data.weekly_weight_target) : undefined,
      caloricTarget: data.caloric_target,
      proteinTarget: data.protein_target,
      metrics: data.metrics || [],
      targetDate: data.target_date,
      description: data.description,
      unit: data.unit as 'kg' | 'lbs',
      isActive: data.is_active,
      createdAt: data.created_at
    };
    
    // Update state: deactivate other goals of same phase and add new goal
    setBodybuildingGoals(prev => 
      prev.map(g => g.phase === goal.phase ? { ...g, isActive: false } : g).concat(newGoal)
    );
  };

  const deleteBodybuildingGoal = async (id: string) => {
    const { error } = await supabase
      .from('bodybuilding_goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setBodybuildingGoals(prev => prev.filter(goal => goal.id !== id));
  };

  return {
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
  };
};
