-- Create persons table
CREATE TABLE public.persons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  id_number TEXT NOT NULL,
  role TEXT,
  vehicle_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create entry_logs table
CREATE TABLE public.entry_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID REFERENCES public.persons(id) ON DELETE SET NULL,
  person_name TEXT NOT NULL,
  id_number TEXT NOT NULL,
  role TEXT,
  vehicle_number TEXT,
  action_type TEXT NOT NULL CHECK (action_type IN ('entry', 'exit')),
  note TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (but allow public access for now - no auth)
ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entry_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Allow public read access on persons" 
ON public.persons FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access on persons" 
ON public.persons FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access on persons" 
ON public.persons FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access on persons" 
ON public.persons FOR DELETE 
USING (true);

CREATE POLICY "Allow public read access on entry_logs" 
ON public.entry_logs FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access on entry_logs" 
ON public.entry_logs FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access on entry_logs" 
ON public.entry_logs FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access on entry_logs" 
ON public.entry_logs FOR DELETE 
USING (true);

-- Create index for faster queries
CREATE INDEX idx_entry_logs_timestamp ON public.entry_logs(timestamp DESC);
CREATE INDEX idx_entry_logs_person_id ON public.entry_logs(person_id);
CREATE INDEX idx_persons_id_number ON public.persons(id_number);