-- Journal Entries and Lines for Double-Entry Bookkeeping
-- Author: Urasi POS
-- Date: 2026-01-17

-- Journal entries table (double-entry bookkeeping)
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference VARCHAR(50),
  description TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal lines (debits and credits)
CREATE TABLE IF NOT EXISTS public.journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.transaction_accounts(id),
  debit DECIMAL(15,2) DEFAULT 0 CHECK (debit >= 0),
  credit DECIMAL(15,2) DEFAULT 0 CHECK (credit >= 0),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add CHECK constraint (debit OR credit, not both, and not both zero)
ALTER TABLE public.journal_lines 
ADD CONSTRAINT journal_lines_debit_or_credit 
CHECK (
  (debit > 0 AND credit = 0) OR 
  (credit > 0 AND debit = 0)
);

-- Add column to link transactions to journal entries
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS journal_entry_id UUID REFERENCES public.journal_entries(id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON public.journal_entries(date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_by ON public.journal_entries(created_by);
CREATE INDEX IF NOT EXISTS idx_journal_lines_journal_entry ON public.journal_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account ON public.journal_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_journal_entry ON public.transactions(journal_entry_id);

-- Enable Row Level Security
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_lines ENABLE ROW LEVEL SECURITY;

-- RLS Policies for journal_entries
CREATE POLICY journal_entries_authenticated_select
ON public.journal_entries FOR SELECT
TO authenticated
USING (true);

CREATE POLICY journal_entries_authenticated_insert
ON public.journal_entries FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY journal_entries_authenticated_update
ON public.journal_entries FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY journal_entries_authenticated_delete
ON public.journal_entries FOR DELETE
TO authenticated
USING (true);

-- RLS Policies for journal_lines
CREATE POLICY journal_lines_authenticated_select
ON public.journal_lines FOR SELECT
TO authenticated
USING (true);

CREATE POLICY journal_lines_authenticated_insert
ON public.journal_lines FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY journal_lines_authenticated_update
ON public.journal_lines FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY journal_lines_authenticated_delete
ON public.journal_lines FOR DELETE
TO authenticated
USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON public.journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to validate journal entry balance
CREATE OR REPLACE FUNCTION validate_journal_entry_balance()
RETURNS TRIGGER AS $$
DECLARE
  total_debit DECIMAL(15,2);
  total_credit DECIMAL(15,2);
BEGIN
  -- Calculate totals for this journal entry
  SELECT 
    COALESCE(SUM(debit), 0),
    COALESCE(SUM(credit), 0)
  INTO total_debit, total_credit
  FROM public.journal_lines
  WHERE journal_entry_id = COALESCE(NEW.journal_entry_id, OLD.journal_entry_id);

  -- Check if balanced (allow small rounding differences)
  IF ABS(total_debit - total_credit) > 0.01 THEN
    RAISE EXCEPTION 'Journal entry must be balanced (total debits = total credits). Debits: %, Credits: %', 
      total_debit, total_credit;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate balance on insert/update/delete
CREATE TRIGGER validate_journal_line_balance_insert
  AFTER INSERT ON public.journal_lines
  FOR EACH ROW
  EXECUTE FUNCTION validate_journal_entry_balance();

CREATE TRIGGER validate_journal_line_balance_update
  AFTER UPDATE ON public.journal_lines
  FOR EACH ROW
  EXECUTE FUNCTION validate_journal_entry_balance();

CREATE TRIGGER validate_journal_line_balance_delete
  AFTER DELETE ON public.journal_lines
  FOR EACH ROW
  EXECUTE FUNCTION validate_journal_entry_balance();

-- View for general ledger
CREATE OR REPLACE VIEW public.view_general_ledger AS
SELECT 
  ta.id as account_id,
  ta.name as account_name,
  ta.code as account_code,
  ta.type as account_type,
  je.id as journal_entry_id,
  je.date as entry_date,
  je.reference,
  je.description as entry_description,
  jl.debit,
  jl.credit,
  jl.description as line_description,
  jl.created_at
FROM public.journal_lines jl
JOIN public.journal_entries je ON jl.journal_entry_id = je.id
JOIN public.transaction_accounts ta ON jl.account_id = ta.id
ORDER BY je.date, je.created_at, jl.created_at;

-- Grant permissions on view
GRANT SELECT ON public.view_general_ledger TO authenticated;
