import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from './button';
import { toast } from 'sonner';

interface ExportButtonProps {
  onExport: () => Promise<Blob>;
  filename?: string;
  disabled?: boolean;
  size?: 'sm' | 'default';
  label?: string;
}

export function ExportButton({
  onExport,
  filename = 'export.xlsx',
  disabled = false,
  size = 'sm',
  label = 'Export Excel',
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await onExport();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Export berhasil di-download');
    } catch (error) {
      toast.error('Gagal export data. Silakan coba lagi.');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size={size}
      onClick={handleExport}
      disabled={disabled || isExporting}
      className="cursor-pointer gap-1.5 border-green-600 bg-green-50 text-green-700 shadow-sm transition-all duration-200 hover:border-green-700 hover:bg-green-100 hover:text-green-800 hover:shadow-md active:scale-95 disabled:cursor-not-allowed"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
}
