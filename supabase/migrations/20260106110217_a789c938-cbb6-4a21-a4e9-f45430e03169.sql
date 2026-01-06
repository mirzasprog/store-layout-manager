-- Create stores table
CREATE TABLE public.stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  floor_plan_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create department enum type
CREATE TYPE public.department_type AS ENUM (
  'voce-povrce',
  'svjeza',
  'neprehrana1',
  'neprehrana2',
  'delikates',
  'gastro',
  'slobodna'
);

-- Create positions table
CREATE TABLE public.positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  position_number TEXT NOT NULL,
  trader TEXT NOT NULL DEFAULT '',
  lease_end_date DATE,
  department public.department_type NOT NULL DEFAULT 'slobodna',
  is_free BOOLEAN NOT NULL DEFAULT true,
  x DOUBLE PRECISION NOT NULL DEFAULT 0,
  y DOUBLE PRECISION NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for this app)
CREATE POLICY "Allow public read access to stores"
ON public.stores
FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access to stores"
ON public.stores
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update access to stores"
ON public.stores
FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete access to stores"
ON public.stores
FOR DELETE
USING (true);

CREATE POLICY "Allow public read access to positions"
ON public.positions
FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access to positions"
ON public.positions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update access to positions"
ON public.positions
FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete access to positions"
ON public.positions
FOR DELETE
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_stores_updated_at
BEFORE UPDATE ON public.stores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_positions_updated_at
BEFORE UPDATE ON public.positions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial store
INSERT INTO public.stores (name) VALUES ('Prodavnica 301');