-- ============================================
-- HANBANG Platform - Supabase Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  phone TEXT,
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'approved', 'rejected')),
  kyc_submitted_at TIMESTAMPTZ,
  kyc_approved_at TIMESTAMPTZ,
  social_provider TEXT, -- 'google', 'kakao', 'email', etc.
  social_id TEXT, -- Provider-specific user ID
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- 2. PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('kpop', 'drama', 'movie', 'youtube', 'webtoon', 'webnovel', 'other')),
  target_amount BIGINT NOT NULL CHECK (target_amount > 0),
  current_amount BIGINT DEFAULT 0 CHECK (current_amount >= 0),
  yield_rate DECIMAL(5, 2) NOT NULL, -- 예: 12.50%
  thumbnail_url TEXT,
  video_url TEXT, -- YouTube embed URL
  status TEXT DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'closed', 'completed', 'cancelled')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  min_investment BIGINT DEFAULT 10000 CHECK (min_investment > 0), -- 최소 투자 금액
  max_investment BIGINT, -- 최대 투자 금액 (NULL이면 제한 없음)
  total_shares INTEGER NOT NULL CHECK (total_shares > 0), -- 총 발행 주식 수
  sold_shares INTEGER DEFAULT 0 CHECK (sold_shares >= 0),
  creator_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Everyone can view projects
CREATE POLICY "Anyone can view projects"
  ON public.projects FOR SELECT
  USING (true);

-- Only authenticated users can create projects (for admin)
CREATE POLICY "Authenticated users can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 3. INVESTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL CHECK (amount > 0),
  shares INTEGER NOT NULL CHECK (shares > 0), -- 구매한 주식 수
  price_per_share BIGINT NOT NULL CHECK (price_per_share > 0), -- 주당 가격
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  payment_method TEXT DEFAULT 'krw' CHECK (payment_method IN ('krw', 'crypto')),
  transaction_id TEXT, -- 결제 거래 ID
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Users can view their own investments
CREATE POLICY "Users can view own investments"
  ON public.investments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own investments
CREATE POLICY "Users can create own investments"
  ON public.investments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. TRANSACTIONS TABLE (거래 내역)
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'investment', 'dividend', 'refund')),
  amount BIGINT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  description TEXT,
  reference_id UUID, -- investment_id, etc.
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 5. WALLETS TABLE (지갑/예수금)
-- ============================================
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  balance_krw BIGINT DEFAULT 0 CHECK (balance_krw >= 0),
  balance_kcp BIGINT DEFAULT 0 CHECK (balance_kcp >= 0), -- KCP 토큰
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Users can view their own wallet
CREATE POLICY "Users can view own wallet"
  ON public.wallets FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own wallet (via triggers only)
CREATE POLICY "Users can update own wallet"
  ON public.wallets FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('investment', 'dividend', 'project', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  link_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 7. KYC VERIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.kyc_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  real_name TEXT,
  birth_date DATE,
  phone TEXT,
  address TEXT,
  id_card_front_url TEXT,
  id_card_back_url TEXT,
  selfie_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own KYC data
CREATE POLICY "Users can view own KYC"
  ON public.kyc_verifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own KYC data
CREATE POLICY "Users can insert own KYC"
  ON public.kyc_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON public.investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_project_id ON public.investments(project_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON public.investments(status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function: Create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url, email)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create wallet for new user
  INSERT INTO public.wallets (user_id, balance_krw, balance_kcp)
  VALUES (NEW.id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-create user profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function: Update project current_amount when investment is completed
CREATE OR REPLACE FUNCTION public.handle_investment_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update project current_amount
    UPDATE public.projects
    SET 
      current_amount = current_amount + NEW.amount,
      sold_shares = sold_shares + NEW.shares,
      updated_at = NOW()
    WHERE id = NEW.project_id;

    -- Create transaction record
    INSERT INTO public.transactions (user_id, type, amount, status, reference_id, completed_at)
    VALUES (NEW.user_id, 'investment', -NEW.amount, 'completed', NEW.id, NOW());

    -- Deduct from wallet
    UPDATE public.wallets
    SET balance_krw = balance_krw - NEW.amount
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Handle investment completion
CREATE TRIGGER on_investment_completed
  AFTER UPDATE ON public.investments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_investment_completed();

-- ============================================
-- INITIAL DATA (Optional)
-- ============================================

-- Insert default admin user (if needed)
-- This should be done manually after creating the admin user in auth.users

