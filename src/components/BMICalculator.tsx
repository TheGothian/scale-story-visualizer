
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, TrendingUp, TrendingDown } from 'lucide-react';
import { WeightEntry } from '../types/weight';
import { useUnit } from '../contexts/UnitContext';

interface BMICalculatorProps {
  weights: WeightEntry[];
}

export const BMICalculator: React.FC<BMICalculatorProps> = ({ weights }) => {
  const { unitSystem, getWeightUnit, convertWeight } = useUnit();
  const [height, setHeight] = useState('');
  const [bmi, setBMI] = useState<number | null>(null);

  // Load height from localStorage
  useEffect(() => {
    const savedHeight = localStorage.getItem('userHeight');
    if (savedHeight) {
      setHeight(savedHeight);
    }
  }, []);

  // Save height to localStorage
  useEffect(() => {
    if (height) {
      localStorage.setItem('userHeight', height);
    }
  }, [height]);

  const calculateBMI = () => {
    if (!height || !weights.length) return;

    const latestWeight = weights[weights.length - 1];
    const heightValue = parseFloat(height);
    const weightValue = convertWeight(latestWeight.weight, latestWeight.unit, 'kg');

    let bmiValue: number;
    if (unitSystem === 'metric') {
      // Height in cm, weight in kg
      const heightInMeters = heightValue / 100;
      bmiValue = weightValue / (heightInMeters * heightInMeters);
    } else {
      // Height in inches, weight in lbs
      const weightInLbs = convertWeight(latestWeight.weight, latestWeight.unit, 'lbs');
      bmiValue = (weightInLbs / (heightValue * heightValue)) * 703;
    }

    setBMI(bmiValue);
  };

  // Auto-calculate BMI when height or weights change
  useEffect(() => {
    if (height && weights.length > 0) {
      calculateBMI();
    }
  }, [height, weights, unitSystem]);

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { category: 'Underweight', color: 'text-blue-600', icon: TrendingDown };
    if (bmiValue < 25) return { category: 'Normal weight', color: 'text-green-600', icon: TrendingUp };
    if (bmiValue < 30) return { category: 'Overweight', color: 'text-yellow-600', icon: TrendingUp };
    return { category: 'Obese', color: 'text-red-600', icon: TrendingUp };
  };

  const heightUnit = unitSystem === 'metric' ? 'cm' : 'inches';
  const heightPlaceholder = unitSystem === 'metric' ? 'Enter height in cm' : 'Enter height in inches';

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Calculator className="h-5 w-5" />
          BMI Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="height">Height ({heightUnit})</Label>
          <Input
            id="height"
            type="number"
            step="0.1"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder={heightPlaceholder}
          />
        </div>

        {weights.length > 0 && (
          <div className="text-sm text-gray-600">
            Current weight: {convertWeight(weights[weights.length - 1].weight, weights[weights.length - 1].unit, getWeightUnit() as 'kg' | 'lbs').toFixed(1)} {getWeightUnit()}
          </div>
        )}

        {bmi !== null && (
          <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              {(() => {
                const { category, color, icon: Icon } = getBMICategory(bmi);
                return (
                  <>
                    <Icon className={`h-5 w-5 ${color}`} />
                    <h4 className="font-semibold text-gray-800">Your BMI</h4>
                  </>
                );
              })()}
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {bmi.toFixed(1)}
            </p>
            <p className={`text-sm font-medium ${getBMICategory(bmi).color}`}>
              {getBMICategory(bmi).category}
            </p>
            <div className="mt-3 text-xs text-gray-500">
              <p>BMI Categories:</p>
              <ul className="mt-1 space-y-1">
                <li>• Underweight: Below 18.5</li>
                <li>• Normal: 18.5 - 24.9</li>
                <li>• Overweight: 25.0 - 29.9</li>
                <li>• Obese: 30.0 and above</li>
              </ul>
            </div>
          </div>
        )}

        {weights.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            Add a weight entry to calculate your BMI
          </p>
        )}
      </CardContent>
    </Card>
  );
};
