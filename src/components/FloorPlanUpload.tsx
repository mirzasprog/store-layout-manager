import { useState, useRef } from 'react';
import { Upload, Trash2, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FloorPlanUploadProps {
  storeId: string;
  currentUrl: string | null;
  onUploadComplete: (url: string | null) => void;
}

export function FloorPlanUpload({ storeId, currentUrl, onUploadComplete }: FloorPlanUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Nepodržani format. Koristite JPG, PNG, GIF, WebP ili PDF.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Datoteka je prevelika. Maksimalna veličina je 10MB.');
      return;
    }

    setUploading(true);

    try {
      // Delete old file if exists
      if (currentUrl) {
        const oldPath = currentUrl.split('/floor-plans/')[1];
        if (oldPath) {
          await supabase.storage.from('floor-plans').remove([oldPath]);
        }
      }

      // Upload new file
      const fileExt = file.name.split('.').pop();
      const fileName = `${storeId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('floor-plans')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('floor-plans')
        .getPublicUrl(fileName);

      onUploadComplete(publicUrl);
      toast.success('Nacrt uspješno učitan!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Greška pri učitavanju nacrta');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!currentUrl) return;

    setUploading(true);
    try {
      const path = currentUrl.split('/floor-plans/')[1];
      if (path) {
        const { error } = await supabase.storage.from('floor-plans').remove([path]);
        if (error) throw error;
      }
      onUploadComplete(null);
      toast.success('Nacrt uklonjen!');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Greška pri brisanju nacrta');
    } finally {
      setUploading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleUpload}
          className="hidden"
          disabled={uploading}
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : currentUrl ? (
            <ImageIcon className="w-4 h-4" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {currentUrl ? 'Zamijeni nacrt' : 'Učitaj nacrt'}
        </Button>

        {currentUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={uploading}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            Ukloni
          </Button>
        )}
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ukloni nacrt?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova radnja će trajno ukloniti nacrt prodavnice. Možete kasnije učitati novi nacrt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Ukloni
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
