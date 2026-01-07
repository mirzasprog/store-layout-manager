-- Add lease value, labels, and sizing fields to positions
ALTER TABLE public.positions
  ADD COLUMN lease_value_km NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN position_label TEXT NOT NULL DEFAULT '',
  ADD COLUMN position_type TEXT NOT NULL DEFAULT '',
  ADD COLUMN item_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN width DOUBLE PRECISION NOT NULL DEFAULT 60,
  ADD COLUMN height DOUBLE PRECISION NOT NULL DEFAULT 60;
