
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WeightEntry } from '../types/weight';
import { useAuth } from './useAuth';

export const useWeightData = () => {
  const { user } = useAuth();
  const [weights, setWeights] = useState<WeightEntry[]>([]);

  const loadWeights = async () => {
    if (!user) return;

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

  useEffect(() => {
    if (user) {
      loadWeights();
    } else {
      setWeights([]);
    }
  }, [user]);

  return {
    weights,
    addWeight,
    deleteWeight,
    editWeight,
    loadWeights
  };
};
