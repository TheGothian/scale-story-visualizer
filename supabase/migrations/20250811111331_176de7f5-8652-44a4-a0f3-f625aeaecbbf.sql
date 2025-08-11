-- 1) Drop existing foreign keys that reference auth.users
ALTER TABLE public.body_compositions DROP CONSTRAINT IF EXISTS body_compositions_user_id_fkey;
ALTER TABLE public.weight_entries DROP CONSTRAINT IF EXISTS weight_entries_user_id_fkey;
ALTER TABLE public.weight_goals DROP CONSTRAINT IF EXISTS weight_goals_user_id_fkey;
ALTER TABLE public.saved_predictions DROP CONSTRAINT IF EXISTS saved_predictions_user_id_fkey;
ALTER TABLE public.bodybuilding_goals DROP CONSTRAINT IF EXISTS bodybuilding_goals_user_id_fkey;

-- 2) Update all user_id values to the requested account id
-- NOTE: This assumes an account with this id exists in public.accounts
UPDATE public.body_compositions SET user_id = '89d4a749-65df-4906-aa4d-6277fe747aa1';
UPDATE public.weight_entries SET user_id = '89d4a749-65df-4906-aa4d-6277fe747aa1';
UPDATE public.weight_goals SET user_id = '89d4a749-65df-4906-aa4d-6277fe747aa1';
UPDATE public.saved_predictions SET user_id = '89d4a749-65df-4906-aa4d-6277fe747aa1';
UPDATE public.bodybuilding_goals SET user_id = '89d4a749-65df-4906-aa4d-6277fe747aa1';

-- 3) Add new foreign keys pointing to public.accounts(id)
ALTER TABLE public.body_compositions
  ADD CONSTRAINT body_compositions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.accounts(id) ON DELETE CASCADE;

ALTER TABLE public.weight_entries
  ADD CONSTRAINT weight_entries_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.accounts(id) ON DELETE CASCADE;

ALTER TABLE public.weight_goals
  ADD CONSTRAINT weight_goals_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.accounts(id) ON DELETE CASCADE;

ALTER TABLE public.saved_predictions
  ADD CONSTRAINT saved_predictions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.accounts(id) ON DELETE CASCADE;

ALTER TABLE public.bodybuilding_goals
  ADD CONSTRAINT bodybuilding_goals_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.accounts(id) ON DELETE CASCADE;