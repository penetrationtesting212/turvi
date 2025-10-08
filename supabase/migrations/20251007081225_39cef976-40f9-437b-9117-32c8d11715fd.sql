-- Subscription Tiers Table
CREATE TABLE public.subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_monthly NUMERIC NOT NULL,
  price_yearly NUMERIC NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  max_posts_per_month INTEGER,
  max_locations INTEGER,
  has_analytics BOOLEAN DEFAULT false,
  has_whatsapp BOOLEAN DEFAULT false,
  has_multilingual BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Subscriptions Table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tier_id UUID REFERENCES public.subscription_tiers(id),
  status TEXT NOT NULL DEFAULT 'active',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Doctor Profiles Table
CREATE TABLE public.doctor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  qualifications TEXT[],
  experience_years INTEGER,
  languages TEXT[],
  consultation_fee NUMERIC,
  bio TEXT,
  profile_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Appointments Table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  doctor_id UUID REFERENCES public.doctor_profiles(id),
  patient_name TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Health Packages Table
CREATE TABLE public.health_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  tests_included TEXT[],
  validity_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Patient Inquiries Table (Lead Generation)
CREATE TABLE public.patient_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  inquiry_type TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  source TEXT,
  assigned_to UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Testimonials Table
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  patient_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT NOT NULL,
  treatment_type TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_tiers (public read)
CREATE POLICY "Anyone can view subscription tiers"
ON public.subscription_tiers FOR SELECT
USING (true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view own subscription"
ON public.user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
ON public.user_subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
ON public.user_subscriptions FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for doctor_profiles
CREATE POLICY "Users can view own doctor profiles"
ON public.doctor_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own doctor profiles"
ON public.doctor_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own doctor profiles"
ON public.doctor_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own doctor profiles"
ON public.doctor_profiles FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for appointments
CREATE POLICY "Users can view own appointments"
ON public.appointments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create appointments"
ON public.appointments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
ON public.appointments FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for health_packages
CREATE POLICY "Users can view own health packages"
ON public.health_packages FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create health packages"
ON public.health_packages FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health packages"
ON public.health_packages FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health packages"
ON public.health_packages FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for patient_inquiries
CREATE POLICY "Users can view own inquiries"
ON public.patient_inquiries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create inquiries"
ON public.patient_inquiries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inquiries"
ON public.patient_inquiries FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for testimonials
CREATE POLICY "Users can view own testimonials"
ON public.testimonials FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create testimonials"
ON public.testimonials FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own testimonials"
ON public.testimonials FOR UPDATE
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctor_profiles_updated_at
BEFORE UPDATE ON public.doctor_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_packages_updated_at
BEFORE UPDATE ON public.health_packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_inquiries_updated_at
BEFORE UPDATE ON public.patient_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default subscription tiers
INSERT INTO public.subscription_tiers (name, price_monthly, price_yearly, features, max_posts_per_month, max_locations, has_analytics, has_whatsapp, has_multilingual) VALUES
('Basic', 999, 9990, '["Single hospital location", "50 posts per month", "Basic analytics", "Email support"]', 50, 1, false, false, false),
('Professional', 2999, 29990, '["Up to 5 locations", "Unlimited posts", "Advanced analytics", "WhatsApp integration", "Multi-language support", "Priority support"]', -1, 5, true, true, true),
('Enterprise', 9999, 99990, '["Unlimited locations", "Unlimited posts", "Advanced analytics", "WhatsApp integration", "Multi-language support", "White-label option", "Dedicated account manager", "24/7 support"]', -1, -1, true, true, true);