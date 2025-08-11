-- Reassign existing data from old user to the new user across all relevant tables
-- Old user id detected in data: 642a3576-d2db-495f-8326-1d60432d8453
-- New user id requested: 89d4a749-65df-4906-aa4d-6277fe747aa1

UPDATE public.weight_entries
SET user_id = '89d4a749-65df-4906-aa4d-6277fe747aa1'
WHERE user_id = '642a3576-d2db-495f-8326-1d60432d8453';

UPDATE public.weight_goals
SET user_id = '89d4a749-65df-4906-aa4d-6277fe747aa1'
WHERE user_id = '642a3576-d2db-495f-8326-1d60432d8453';

UPDATE public.body_compositions
SET user_id = '89d4a749-65df-4906-aa4d-6277fe747aa1'
WHERE user_id = '642a3576-d2db-495f-8326-1d60432d8453';

-- Included for completeness; no rows currently match the old id but safe to run
UPDATE public.saved_predictions
SET user_id = '89d4a749-65df-4906-aa4d-6277fe747aa1'
WHERE user_id = '642a3576-d2db-495f-8326-1d60432d8453';

UPDATE public.bodybuilding_goals
SET user_id = '89d4a749-65df-4906-aa4d-6277fe747aa1'
WHERE user_id = '642a3576-d2db-495f-8326-1d60432d8453';