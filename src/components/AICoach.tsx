import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AICoachResponse {
  advice: string;
  dataUsed: {
    hasWeightData: boolean;
    hasBodyCompData: boolean;
    hasGoals: boolean;
  };
}

export const AICoach = () => {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [dataUsed, setDataUsed] = useState<AICoachResponse['dataUsed'] | null>(null);
  const { user } = useAuth();

  const getCoachingAdvice = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to get personalized coaching advice.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Get the custom auth token from localStorage
      const token = localStorage.getItem('custom_auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const { data, error } = await supabase.functions.invoke('ai-coach', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to get coaching advice');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAdvice(data.advice);
      setDataUsed(data.dataUsed);
      
      toast({
        title: "Coaching advice generated",
        description: "Your personalized recommendations are ready!",
      });

    } catch (error) {
      console.error('Error getting coaching advice:', error);
      toast({
        title: "Error getting advice",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Fitness Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!advice ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <Zap className="h-12 w-12 text-primary mx-auto mb-2" />
              <p className="text-muted-foreground">
                Get personalized diet and calorie recommendations based on your weight and body composition data.
              </p>
            </div>
            <Button 
              onClick={getCoachingAdvice} 
              disabled={loading}
              size="lg"
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing your data...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Get Coaching Advice
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {dataUsed && (
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-sm text-muted-foreground">Data analyzed:</span>
                {dataUsed.hasWeightData && (
                  <Badge variant="secondary">Weight Data</Badge>
                )}
                {dataUsed.hasBodyCompData && (
                  <Badge variant="secondary">Body Composition</Badge>
                )}
                {dataUsed.hasGoals && (
                  <Badge variant="secondary">Goals</Badge>
                )}
              </div>
            )}
            
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {advice}
              </div>
            </div>
            
            <div className="flex gap-2 pt-4 border-t">
              <Button 
                onClick={getCoachingAdvice} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Get Updated Advice
                  </>
                )}
              </Button>
              <Button 
                onClick={() => {
                  setAdvice(null);
                  setDataUsed(null);
                }} 
                variant="ghost"
                size="sm"
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};