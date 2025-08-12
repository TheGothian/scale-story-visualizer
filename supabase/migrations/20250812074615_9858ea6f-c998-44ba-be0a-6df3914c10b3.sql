
-- Secure the public.accounts table with strict RLS

-- 1) Ensure RLS is enabled
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Optional extra hardening: enforce RLS even for table owners
-- (service role still bypasses RLS, so your Edge Functions remain unaffected)
-- ALTER TABLE public.accounts FORCE ROW LEVEL SECURITY;

-- 2) Replace existing policies with strict versions
DROP POLICY IF EXISTS "Accounts: users can view own record" ON public.accounts;
DROP POLICY IF EXISTS "Accounts: users can update own record" ON public.accounts;

-- Allow a user to SELECT only their own row
CREATE POLICY "Accounts: users can view own record"
  ON public.accounts
  FOR SELECT
  USING (auth.uid() = id);

-- Allow a user to UPDATE only their own row
CREATE POLICY "Accounts: users can update own record"
  ON public.accounts
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- No INSERT/DELETE policies are created on purpose.
-- Accounts should be created and managed only via Edge Functions (service role).
