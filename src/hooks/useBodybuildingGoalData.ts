
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BodybuildingGoal } from '../types/bodybuilding';
import { useAuth } from './useAuth';

export const useBodybuildingGoalData = () => {
  const { user } = useAuth();
  const [bodybuildingGoals, setBodybuildingGoals] = useState<BodybuildingGoal[]>([]);

  const loadBodybuildingGoals = async () => {
    if (!user) return;

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

  useEffect(() => {
    if (user) {
      loadBodybuildingGoals();
    } else {
      setBodybuildingGoals([]);
    }
  }, [user]);

  return {
    bodybuildingGoals,
    addBodybuildingGoal,
    deleteBodybuildingGoal,
    loadBodybuildingGoals
  };
};
