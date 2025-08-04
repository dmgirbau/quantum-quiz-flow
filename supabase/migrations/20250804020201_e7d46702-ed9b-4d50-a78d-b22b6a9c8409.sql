-- Add pending status for user approval
ALTER TYPE app_role ADD VALUE 'pending_student';
ALTER TYPE app_role ADD VALUE 'pending_professor';

-- Add approval system fields to user_roles
ALTER TABLE public.user_roles 
ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN approved_by UUID REFERENCES auth.users(id),
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update the handle_new_user function to not assign automatic roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email
  );
  
  -- Don't assign automatic role - wait for manual assignment with approval
  RETURN NEW;
END;
$$;

-- Create function to get user role that considers approval status
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_roles.user_id = $1 AND status = 'approved' 
  LIMIT 1;
$$;

-- Create function for admins to approve users
CREATE OR REPLACE FUNCTION public.approve_user_role(target_user_id uuid, approved_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
  -- Check if current user is admin
  IF (SELECT get_user_role(auth.uid())) != 'admin' THEN
    RAISE EXCEPTION 'Only admins can approve user roles';
  END IF;
  
  -- Update or insert the user role
  INSERT INTO public.user_roles (user_id, role, status, approved_by, approved_at)
  VALUES (target_user_id, approved_role, 'approved', auth.uid(), now())
  ON CONFLICT (user_id, role) 
  DO UPDATE SET 
    status = 'approved',
    approved_by = auth.uid(),
    approved_at = now();
END;
$$;