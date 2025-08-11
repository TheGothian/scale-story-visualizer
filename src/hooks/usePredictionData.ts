
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SavedPrediction } from '../types/weight';
import { useAuth } from './useAuth';

export const usePredictionData = () => {
  const { user } = useAuth();
  const [savedPredictions, setSavedPredictions] = useState<SavedPrediction[]>([]);

  const loadPredictions = async () => {
    if (!user) return;

    const token = localStorage.getItem('custom_auth_token');

    const { data: res, error } = await supabase.functions.invoke('user-data', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: {
        op: 'list',
        entity: 'saved_predictions',
        orderBy: 'created_at',
        direction: 'desc'
      }
    });

    if (error) throw error;
    
    const rows = (res as any)?.data ?? [];
    const formattedPredictions: SavedPrediction[] = rows.map(pred => ({
      id: pred.id,
      name: pred.name,
      targetDate: pred.target_date,
      predictedWeight: Number(pred.predicted_weight),
      unit: pred.unit as 'kg' | 'lbs',
      createdAt: pred.created_at
    }));
    
    setSavedPredictions(formattedPredictions);
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

  useEffect(() => {
    if (user) {
      loadPredictions();
    } else {
      setSavedPredictions([]);
    }
  }, [user]);

  return {
    savedPredictions,
    savePrediction,
    deletePrediction,
    loadPredictions
  };
};
