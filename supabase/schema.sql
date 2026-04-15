-- Create tables for ShieldAI

CREATE TABLE public.scam_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    scam_type TEXT,
    confidence_score FLOAT,
    guidance TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.scam_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_text TEXT NOT NULL,
    category TEXT,
    severity TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.scam_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_patterns ENABLE ROW LEVEL SECURITY;

-- Creating RLS Policies

-- Scam Reports Policies (Users can only read/write their own)
CREATE POLICY "Users can insert their own scam reports" ON public.scam_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own scam reports" ON public.scam_reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own scam reports" ON public.scam_reports
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scam reports" ON public.scam_reports
    FOR DELETE USING (auth.uid() = user_id);

-- Alerts Policies (Users can only read/update/delete their own)
CREATE POLICY "System can insert alerts (or trigger)" ON public.alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own alerts" ON public.alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" ON public.alerts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts" ON public.alerts
    FOR DELETE USING (auth.uid() = user_id);

-- Scam Patterns Policies (Global read for authenticated users)
CREATE POLICY "Anyone can read scam patterns" ON public.scam_patterns
    FOR SELECT USING (true);
