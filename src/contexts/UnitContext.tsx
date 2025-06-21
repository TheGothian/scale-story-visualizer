
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UnitSystem } from '../types/weight';

interface UnitContextType {
  unitSystem: UnitSystem;
  setUnitSystem: (system: UnitSystem) => void;
  getWeightUnit: () => string;
  convertWeight: (weight: number, fromUnit: 'kg' | 'lbs', toUnit: 'kg' | 'lbs') => number;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export const UnitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>('metric');

  // Load unit preference from localStorage
  useEffect(() => {
    const savedUnit = localStorage.getItem('weightTrackerUnit') as UnitSystem;
    if (savedUnit && (savedUnit === 'metric' || savedUnit === 'imperial')) {
      setUnitSystemState(savedUnit);
    }
  }, []);

  const setUnitSystem = (system: UnitSystem) => {
    setUnitSystemState(system);
    localStorage.setItem('weightTrackerUnit', system);
  };

  const getWeightUnit = () => {
    return unitSystem === 'metric' ? 'kg' : 'lbs';
  };

  const convertWeight = (weight: number, fromUnit: 'kg' | 'lbs', toUnit: 'kg' | 'lbs') => {
    if (fromUnit === toUnit) return weight;
    
    if (fromUnit === 'kg' && toUnit === 'lbs') {
      return weight * 2.20462;
    } else if (fromUnit === 'lbs' && toUnit === 'kg') {
      return weight / 2.20462;
    }
    
    return weight;
  };

  return (
    <UnitContext.Provider value={{
      unitSystem,
      setUnitSystem,
      getWeightUnit,
      convertWeight
    }}>
      {children}
    </UnitContext.Provider>
  );
};

export const useUnit = () => {
  const context = useContext(UnitContext);
  if (context === undefined) {
    throw new Error('useUnit must be used within a UnitProvider');
  }
  return context;
};
