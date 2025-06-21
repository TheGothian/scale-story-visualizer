
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface SymmetryData {
  muscle: string;
  difference: number;
  asymmetryPercent: number;
  left: number;
  right: number;
}

interface SymmetryAnalysisProps {
  symmetryAnalysis: SymmetryData[] | null;
}

export const SymmetryAnalysis: React.FC<SymmetryAnalysisProps> = ({ symmetryAnalysis }) => {
  if (!symmetryAnalysis || symmetryAnalysis.length === 0) return null;

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-indigo-700">Symmetry Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {symmetryAnalysis.map((analysis, index) => (
            <div key={index} className="p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <h4 className="font-semibold text-indigo-800">{analysis.muscle}</h4>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  analysis.asymmetryPercent < 2 ? 'bg-green-100 text-green-800' :
                  analysis.asymmetryPercent < 5 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {analysis.asymmetryPercent < 2 ? 'Excellent' :
                   analysis.asymmetryPercent < 5 ? 'Good' : 'Needs Work'}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-semibold text-blue-600">{analysis.left.toFixed(1)}</p>
                  <p className="text-xs text-gray-600">Left</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-purple-600">{analysis.difference.toFixed(1)}</p>
                  <p className="text-xs text-gray-600">Difference</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-blue-600">{analysis.right.toFixed(1)}</p>
                  <p className="text-xs text-gray-600">Right</p>
                </div>
              </div>
              
              <div className="mt-2">
                <p className="text-xs text-gray-600">
                  Asymmetry: {analysis.asymmetryPercent.toFixed(1)}%
                  {analysis.asymmetryPercent > 5 && ' - Consider unilateral training'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
