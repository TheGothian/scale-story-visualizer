import React, { useState, useEffect } from 'react';
import { WeightForm } from '../components/WeightForm';
import { WeightChart } from '../components/WeightChart';
import { TrendAnalysis } from '../components/TrendAnalysis';
import { EventPredictor } from '../components/EventPredictor';
import { UnitToggle } from '../components/UnitToggle';
import { UnitProvider } from '../contexts/UnitContext';
import { WeightEntry } from '../types/weight';
import { Scale } from 'lucide-react';
import { BMICalculator } from '../components/BMICalculator';

const IndexContent = () => {
  const [weights, setWeights] = useState<WeightEntry[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedWeights = localStorage.getItem('weightEntries');
    if (savedWeights) {
      setWeights(JSON.parse(savedWeights));
    }
  }, []);

  // Save data to localStorage whenever weights change
  useEffect(() => {
    localStorage.setItem('weightEntries', JSON.stringify(weights));
  }, [weights]);

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
              Weight Tracker
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Track your weight journey and achieve your goals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            <UnitToggle />
            <WeightForm onAddWeight={addWeight} />
            <BMICalculator weights={weights} />
            <EventPredictor weights={weights} />
          </div>

          {/* Right Column - Chart and Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <WeightChart 
              weights={weights} 
              onDeleteWeight={deleteWeight}
              onEditWeight={editWeight}
            />
            <TrendAnalysis weights={weights} />
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
