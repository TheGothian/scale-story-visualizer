
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WeightEntry } from '../types/weight';
import { useAuth } from './useAuth';

export const useWeightData = () => {
  const { user } = useAuth();
  const [weights, setWeights] = useState<WeightEntry[]>([]);

  const loadWeights = async () => {
    if (!user) return;

    const token = localStorage.getItem('custom_auth_token');

    const { data: res, error } = await supabase.functions.invoke('user-data', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: {
        op: 'list',
        entity: 'weight_entries',
        orderBy: 'date',
        direction: 'asc'
      }
    });

    if (error) throw error;
    
    const rows = (res as any)?.data ?? [];
    const formattedWeights: WeightEntry[] = rows.map(entry => ({
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

    const token = localStorage.getItem('custom_auth_token');

    const { data: res, error } = await supabase.functions.invoke('user-data', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: {
        op: 'insert',
        entity: 'weight_entries',
        values: {
          weight: entry.weight,
          date: entry.date,
          note: entry.note,
          unit: entry.unit
        }
      }
    });

    if (error) throw error;
    const data = (res as any)?.data;

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
    const token = localStorage.getItem('custom_auth_token');
    const { error } = await supabase.functions.invoke('user-data', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: { op: 'delete', entity: 'weight_entries', id }
    });

    if (error) throw error;
    setWeights(prev => prev.filter(entry => entry.id !== id));
  };

  const editWeight = async (id: string, updatedEntry: Partial<WeightEntry>) => {
    const token = localStorage.getItem('custom_auth_token');
    const { error } = await supabase.functions.invoke('user-data', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: {
        op: 'update',
        entity: 'weight_entries',
        id,
        updated: {
          weight: updatedEntry.weight,
          date: updatedEntry.date,
          note: updatedEntry.note
        }
      }
    });

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
