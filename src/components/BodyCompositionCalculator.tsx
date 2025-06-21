
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, User, Activity, Zap } from 'lucide-react';
import { WeightEntry } from '../types/weight';
import { BodyComposition } from '../types/bodybuilding';
import { useUnit } from '../contexts/UnitContext';
import { toast } from '@/hooks/use-toast';

interface BodyCompositionCalculatorProps {
  weights: WeightEntry[];
  onSaveComposition: (composition: BodyComposition) => void;
  compositions: BodyComposition[];
}

export const BodyCompositionCalculator: React.FC<BodyCompositionCalculatorProps> = ({ 
  weights, 
  onSaveComposition,
  compositions 
}) => {
  const { unitSystem, getWeightUnit, convertWeight } = useUnit();
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [bodyFat, setBodyFat] = useState('');
  const [measurements, setMeasurements] = useState({
    chest: '', waist: '', hips: '', neck: '', leftArm: '', rightArm: '',
    leftThigh: '', rightThigh: '', shoulders: '', forearms: '', calves: ''
  });

  // Load data from localStorage
  useEffect(() => {
    const savedHeight = localStorage.getItem('userHeight');
    const savedAge = localStorage.getItem('userAge');
    const savedGender = localStorage.getItem('userGender');
    if (savedHeight) setHeight(savedHeight);
    if (savedAge) setAge(savedAge);
    if (savedGender) setGender(savedGender as 'male' | 'female');
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (height) localStorage.setItem('userHeight', height);
    if (age) localStorage.setItem('userAge', age);
    localStorage.setItem('userGender', gender);
  }, [height, age, gender]);

  const calculateBodyFat = () => {
    if (!weights.length || !height || !age) return null;

    const latestWeight = weights[weights.length - 1];
    const weightKg = convertWeight(latestWeight.weight, latestWeight.unit, 'kg');
    const heightCm = unitSystem === 'metric' ? parseFloat(height) : parseFloat(height) * 2.54;
    const ageNum = parseInt(age);

    // Navy method using neck and waist measurements
    if (measurements.neck && measurements.waist) {
      const neck = parseFloat(measurements.neck);
      const waist = parseFloat(measurements.waist);
      const hips = measurements.hips ? parseFloat(measurements.hips) : 0;

      let bodyFatPercentage: number;
      if (gender === 'male') {
        bodyFatPercentage = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(heightCm)) - 450;
      } else {
        bodyFatPercentage = 495 / (1.29579 - 0.35004 * Math.log10(waist + hips - neck) + 0.22100 * Math.log10(heightCm)) - 450;
      }
      
      return Math.max(3, Math.min(50, bodyFatPercentage));
    }

    // Fallback to BMI-based estimation
    const bmi = weightKg / Math.pow(heightCm / 100, 2);
    const genderFactor = gender === 'male' ? 1 : 0;
    const estimatedBodyFat = (1.20 * bmi) + (0.23 * ageNum) - (10.8 * genderFactor) - 5.4;
    
    return Math.max(3, Math.min(50, estimatedBodyFat));
  };

  const calculateMuscleMass = (bodyFatPercentage: number) => {
    if (!weights.length) return null;
    
    const latestWeight = weights[weights.length - 1];
    const weightKg = convertWeight(latestWeight.weight, latestWeight.unit, 'kg');
    const leanMass = weightKg * (1 - bodyFatPercentage / 100);
    
    // Estimate muscle mass as approximately 40-45% of lean mass
    const muscleMassPercentage = gender === 'male' ? 0.45 : 0.42;
    return leanMass * muscleMassPercentage;
  };

  const handleSaveComposition = () => {
    const calculatedBodyFat = bodyFat ? parseFloat(bodyFat) : calculateBodyFat();
    if (!calculatedBodyFat) {
      toast({
        title: "Missing data",
        description: "Please enter height, age, and measurements to calculate body composition.",
        variant: "destructive"
      });
      return;
    }

    const muscleMass = calculateMuscleMass(calculatedBodyFat);
    const measurementUnit = unitSystem === 'metric' ? 'cm' : 'inches';
    
    const composition: BodyComposition = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      bodyFatPercentage: calculatedBodyFat,
      muscleMass: muscleMass || undefined,
      measurements: {
        chest: measurements.chest ? parseFloat(measurements.chest) : undefined,
        waist: measurements.waist ? parseFloat(measurements.waist) : undefined,
        hips: measurements.hips ? parseFloat(measurements.hips) : undefined,
        neck: measurements.neck ? parseFloat(measurements.neck) : undefined,
        leftArm: measurements.leftArm ? parseFloat(measurements.leftArm) : undefined,
        rightArm: measurements.rightArm ? parseFloat(measurements.rightArm) : undefined,
        leftThigh: measurements.leftThigh ? parseFloat(measurements.leftThigh) : undefined,
        rightThigh: measurements.rightThigh ? parseFloat(measurements.rightThigh) : undefined,
        shoulders: measurements.shoulders ? parseFloat(measurements.shoulders) : undefined,
        forearms: measurements.forearms ? parseFloat(measurements.forearms) : undefined,
        calves: measurements.calves ? parseFloat(measurements.calves) : undefined,
      },
      createdAt: new Date().toISOString()
    };

    onSaveComposition(composition);
    toast({
      title: "Body composition saved!",
      description: `Body fat: ${calculatedBodyFat.toFixed(1)}%, Muscle mass: ${muscleMass?.toFixed(1)}kg`,
    });
  };

  const currentBodyFat = bodyFat ? parseFloat(bodyFat) : calculateBodyFat();
  const currentMuscleMass = currentBodyFat ? calculateMuscleMass(currentBodyFat) : null;
  const measurementUnit = unitSystem === 'metric' ? 'cm' : 'inches';

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <Calculator className="h-5 w-5" />
          Body Composition Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="height">Height ({unitSystem === 'metric' ? 'cm' : 'inches'})</Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder={unitSystem === 'metric' ? 'Enter height in cm' : 'Enter height in inches'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter age"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={gender} onValueChange={(value: 'male' | 'female') => setGender(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Manual Body Fat Input */}
        <div className="space-y-2">
          <Label htmlFor="bodyFat">Body Fat % (optional - leave empty for calculation)</Label>
          <Input
            id="bodyFat"
            type="number"
            step="0.1"
            value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
            placeholder="Enter if known, otherwise will be calculated"
          />
        </div>

        {/* Body Measurements */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700">Body Measurements ({measurementUnit})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(measurements).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="text-sm capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                <Input
                  id={key}
                  type="number"
                  step="0.1"
                  value={value}
                  onChange={(e) => setMeasurements(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder="0.0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Results Display */}
        {currentBodyFat && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-purple-800">Body Fat</h4>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {currentBodyFat.toFixed(1)}%
              </p>
              <p className="text-sm text-purple-600">
                {currentBodyFat < 10 ? 'Very Low' : 
                 currentBodyFat < 15 ? 'Low' :
                 currentBodyFat < 20 ? 'Normal' :
                 currentBodyFat < 25 ? 'Moderate' : 'High'}
              </p>
            </div>

            {currentMuscleMass && (
              <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Muscle Mass</h4>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {currentMuscleMass.toFixed(1)} kg
                </p>
                <p className="text-sm text-green-600">
                  Estimated lean muscle
                </p>
              </div>
            )}
          </div>
        )}

        <Button onClick={handleSaveComposition} className="w-full bg-purple-600 hover:bg-purple-700">
          <Zap className="mr-2 h-4 w-4" />
          Save Body Composition
        </Button>

        {/* Recent Compositions */}
        {compositions.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-700 mb-3">Recent Measurements</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {compositions.slice(-3).reverse().map((comp) => (
                <div key={comp.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="text-sm">
                    <span className="font-medium">{comp.date}</span>
                    {comp.bodyFatPercentage && (
                      <span className="ml-2 text-purple-600">BF: {comp.bodyFatPercentage.toFixed(1)}%</span>
                    )}
                    {comp.muscleMass && (
                      <span className="ml-2 text-green-600">MM: {comp.muscleMass.toFixed(1)}kg</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
