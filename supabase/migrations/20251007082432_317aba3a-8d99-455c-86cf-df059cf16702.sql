-- Create role enum for the application
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'staff', 'patient');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create security definer function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Create helper function to check if user has any of multiple roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles public.app_role[])
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  );
$$;

-- Drop existing appointment policies
DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can view own appointments" ON public.appointments;

-- New RLS policies for appointments with role-based access
-- Admins can view all appointments
CREATE POLICY "Admins can view all appointments"
  ON public.appointments
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Doctors can view appointments assigned to them
CREATE POLICY "Doctors can view assigned appointments"
  ON public.appointments
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'doctor') 
    AND doctor_id IN (
      SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid()
    )
  );

-- Staff can view appointments they created (limited access)
CREATE POLICY "Staff can view own created appointments"
  ON public.appointments
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'staff') 
    AND user_id = auth.uid()
  );

-- All authenticated users can create appointments (booking system)
CREATE POLICY "Authenticated users can create appointments"
  ON public.appointments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can update any appointment
CREATE POLICY "Admins can update all appointments"
  ON public.appointments
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Doctors can update their assigned appointments
CREATE POLICY "Doctors can update assigned appointments"
  ON public.appointments
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'doctor')
    AND doctor_id IN (
      SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid()
    )
  );

-- Staff can update appointments they created
CREATE POLICY "Staff can update own created appointments"
  ON public.appointments
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'staff')
    AND user_id = auth.uid()
  );

-- Admins can delete appointments
CREATE POLICY "Admins can delete appointments"
  ON public.appointments
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Also update doctor_profiles policies to use roles
DROP POLICY IF EXISTS "Users can create own doctor profiles" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Users can update own doctor profiles" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Users can delete own doctor profiles" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Users can view own doctor profiles" ON public.doctor_profiles;

-- Allow viewing of active doctor profiles for appointment booking
CREATE POLICY "Anyone can view active doctor profiles"
  ON public.doctor_profiles
  FOR SELECT
  USING (is_active = true);

-- Only admins and doctors can create doctor profiles
CREATE POLICY "Admins and doctors can create profiles"
  ON public.doctor_profiles
  FOR INSERT
  WITH CHECK (
    public.has_any_role(auth.uid(), ARRAY['admin', 'doctor']::public.app_role[])
    AND user_id = auth.uid()
  );

-- Admins and profile owners can update
CREATE POLICY "Admins and owners can update doctor profiles"
  ON public.doctor_profiles
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR (user_id = auth.uid() AND public.has_role(auth.uid(), 'doctor'))
  );

-- Admins and profile owners can delete
CREATE POLICY "Admins and owners can delete doctor profiles"
  ON public.doctor_profiles
  FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR (user_id = auth.uid() AND public.has_role(auth.uid(), 'doctor'))
  );

-- Update patient_inquiries policies
DROP POLICY IF EXISTS "Users can create inquiries" ON public.patient_inquiries;
DROP POLICY IF EXISTS "Users can update own inquiries" ON public.patient_inquiries;
DROP POLICY IF EXISTS "Users can view own inquiries" ON public.patient_inquiries;

-- Admins can view all inquiries
CREATE POLICY "Admins can view all inquiries"
  ON public.patient_inquiries
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Staff and doctors can view inquiries in their organization
CREATE POLICY "Staff and doctors can view organization inquiries"
  ON public.patient_inquiries
  FOR SELECT
  USING (
    public.has_any_role(auth.uid(), ARRAY['staff', 'doctor']::public.app_role[])
    AND user_id = auth.uid()
  );

-- Anyone authenticated can create inquiries (public booking)
CREATE POLICY "Authenticated users can create inquiries"
  ON public.patient_inquiries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins and assigned staff can update
CREATE POLICY "Admins and staff can update inquiries"
  ON public.patient_inquiries
  FOR UPDATE
  USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'staff', 'doctor']::public.app_role[])
  );