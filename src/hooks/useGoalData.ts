
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WeightGoal } from '../types/weight';
import { useAuth } from './useAuth';

export const useGoalData = () => {
  const { user } = useAuth();
  const [weightGoals, setWeightGoals] = useState<WeightGoal[]>([]);

  const loadWeightGoals = async () => {
    if (!user) return;

    const token = localStorage.getItem('custom_auth_token');

    const { data: res, error } = await supabase.functions.invoke('user-data', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: {
        op: 'list',
        entity: 'weight_goals',
        orderBy: 'created_at',
        direction: 'desc'
      }
    });

    if (error) throw error;
    
    const rows = (res as any)?.data ?? [];
    const formattedGoals: WeightGoal[] = rows.map(goal => ({
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

  const addGoal = async (goal: Omit<WeightGoal, 'id' | 'createdAt'>) => {
    if (!user) return;

    const token = localStorage.getItem('custom_auth_token');

    const { data: res, error } = await supabase.functions.invoke('user-data', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: {
        op: 'insert',
        entity: 'weight_goals',
        values: {
          name: goal.name,
          target_weight: goal.targetWeight,
          target_date: goal.targetDate,
          description: goal.description,
          unit: goal.unit,
          is_active: goal.isActive
        }
      }
    });

    if (error) throw error;
    const data = (res as any)?.data;

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
    const token = localStorage.getItem('custom_auth_token');
    const { error } = await supabase.functions.invoke('user-data', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: { op: 'delete', entity: 'weight_goals', id }
    });

    if (error) throw error;
    setWeightGoals(prev => prev.filter(goal => goal.id !== id));
  };

  useEffect(() => {
    if (user) {
      loadWeightGoals();
    } else {
      setWeightGoals([]);
    }
  }, [user]);

  return {
    weightGoals,
    addGoal,
    deleteGoal,
    loadWeightGoals
  };
};
