
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BodyComposition, BodyMeasurements } from '../types/bodybuilding';
import { useAuth } from './useAuth';

export const useBodyCompositionData = () => {
  const { user } = useAuth();
  const [bodyCompositions, setBodyCompositions] = useState<BodyComposition[]>([]);

  const loadBodyCompositions = async () => {
    if (!user) return;

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
      measurements: (comp.measurements as BodyMeasurements) || {},
      createdAt: comp.created_at
    }));
    
    setBodyCompositions(formattedCompositions);
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
        measurements: composition.measurements as any
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
      measurements: (data.measurements as BodyMeasurements) || {},
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
        measurements: updatedComposition.measurements as any
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

  useEffect(() => {
    if (user) {
      loadBodyCompositions();
    } else {
      setBodyCompositions([]);
    }
  }, [user]);

  return {
    bodyCompositions,
    saveBodyComposition,
    deleteBodyComposition,
    editBodyComposition,
    loadBodyCompositions
  };
};
