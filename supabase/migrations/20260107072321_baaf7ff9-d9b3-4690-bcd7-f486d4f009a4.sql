-- Create storage bucket for floor plans
INSERT INTO storage.buckets (id, name, public)
VALUES ('floor-plans', 'floor-plans', true);

-- Create policies for floor plan uploads
CREATE POLICY "Floor plans are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'floor-plans');

CREATE POLICY "Anyone can upload floor plans" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'floor-plans');

CREATE POLICY "Anyone can update floor plans" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'floor-plans');

CREATE POLICY "Anyone can delete floor plans" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'floor-plans');