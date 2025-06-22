
-- Create weight entries table
CREATE TABLE public.weight_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  date DATE NOT NULL,
  note TEXT,
  unit TEXT NOT NULL CHECK (unit IN ('kg', 'lbs')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create body compositions table
CREATE TABLE public.body_compositions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  body_fat_percentage DECIMAL(4,2),
  muscle_mass DECIMAL(5,2),
  visceral_fat DECIMAL(4,2),
  water_percentage DECIMAL(4,2),
  bone_mass DECIMAL(4,2),
  metabolic_age INTEGER,
  measurements JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weight goals table
CREATE TABLE public.weight_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  target_weight DECIMAL(5,2) NOT NULL,
  target_date DATE NOT NULL,
  description TEXT,
  unit TEXT NOT NULL CHECK (unit IN ('kg', 'lbs')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bodybuilding goals table
CREATE TABLE public.bodybuilding_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('cutting', 'bulking', 'maintenance', 'contest-prep')),
  target_weight DECIMAL(5,2),
  target_body_fat DECIMAL(4,2),
  target_muscle_mass DECIMAL(5,2),
  weekly_weight_target DECIMAL(4,2),
  caloric_target INTEGER,
  protein_target INTEGER,
  metrics TEXT[] DEFAULT '{}',
  target_date DATE NOT NULL,
  description TEXT,
  unit TEXT NOT NULL CHECK (unit IN ('kg', 'lbs')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saved predictions table
CREATE TABLE public.saved_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  target_date DATE NOT NULL,
  predicted_weight DECIMAL(5,2) NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('kg', 'lbs')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_compositions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bodybuilding_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_predictions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for weight_entries
CREATE POLICY "Users can view their own weight entries" ON public.weight_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own weight entries" ON public.weight_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own weight entries" ON public.weight_entries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own weight entries" ON public.weight_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for body_compositions
CREATE POLICY "Users can view their own body compositions" ON public.body_compositions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own body compositions" ON public.body_compositions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own body compositions" ON public.body_compositions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own body compositions" ON public.body_compositions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for weight_goals
CREATE POLICY "Users can view their own weight goals" ON public.weight_goals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own weight goals" ON public.weight_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own weight goals" ON public.weight_goals
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own weight goals" ON public.weight_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for bodybuilding_goals
CREATE POLICY "Users can view their own bodybuilding goals" ON public.bodybuilding_goals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bodybuilding goals" ON public.bodybuilding_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bodybuilding goals" ON public.bodybuilding_goals
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bodybuilding goals" ON public.bodybuilding_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for saved_predictions
CREATE POLICY "Users can view their own saved predictions" ON public.saved_predictions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own saved predictions" ON public.saved_predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own saved predictions" ON public.saved_predictions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own saved predictions" ON public.saved_predictions
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_weight_entries_user_date ON public.weight_entries(user_id, date DESC);
CREATE INDEX idx_body_compositions_user_date ON public.body_compositions(user_id, date DESC);
CREATE INDEX idx_weight_goals_user_active ON public.weight_goals(user_id, is_active);
CREATE INDEX idx_bodybuilding_goals_user_active ON public.bodybuilding_goals(user_id, is_active);
CREATE INDEX idx_saved_predictions_user_date ON public.saved_predictions(user_id, target_date);
