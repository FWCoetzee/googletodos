-- Fix PUBLIC_DATA_EXPOSURE: Replace overly permissive profiles SELECT policy
-- Drop the public policy that exposes all user emails
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a new policy that allows users to view only their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);