import { CheckCircle2, Clock, Package, XCircle } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';

interface Sample {
  id: string;
  product: string;
  customer: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision';
  notes: string;
  revisionCount: number;
}

const samples: Sample[] = [
  {
    id: 'SMP-001',
    product: 'Hoodie Fleece Custom',
    customer: 'PT. Maju Jaya Retail',
    submittedDate: '2024-01-15',
    status: 'approved',
    notes: 'Approved untuk mass production. Logo embroidery sudah sesuai.',
    revisionCount: 1,
  },
  {
    id: 'SMP-002',
    product: 'Polo Shirt Cotton Pique',
    customer: 'CV. Berkah Abadi',
    submittedDate: '2024-01-18',
    status: 'revision',
    notes: 'Ukuran lengan perlu diperpanjang 2cm. Warna biru agak gelap dari referensi.',
    revisionCount: 2,
  },
  {
    id: 'SMP-003',
    product: 'Jaket Bomber Varsity',
    customer: 'PT. Indo Fashion Group',
    submittedDate: '2024-01-20',
    status: 'pending',
    notes: 'Menunggu approval dari buyer.',
    revisionCount: 0,
  },
  {
    id: 'SMP-004',
    product: 'Crewneck Sweatshirt',
    customer: 'Toko Distro Bandung',
    submittedDate: '2024-01-22',
    status: 'rejected',
    notes: 'Kualitas kain tidak sesuai ekspektasi. Perlu ganti supplier.',
    revisionCount: 0,
  },
];

const statusConfig = {
  pending: { label: 'Pending', variant: 'warning' as const, icon: Clock },
  approved: { label: 'Approved', variant: 'success' as const, icon: CheckCircle2 },
  rejected: { label: 'Rejected', variant: 'danger' as const, icon: XCircle },
  revision: { label: 'Revision', variant: 'info' as const, icon: Package },
};

export function SampleApprovalPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Sample Approval</CardTitle>
              <CardDescription>
                Pencatatan dan verifikasi sampel dari klien sebelum mass production.
              </CardDescription>
            </div>
            <Badge variant="default">R&D Module</Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {samples.map((sample) => {
          const StatusIcon = statusConfig[sample.status].icon;
          return (
            <Card key={sample.id} className="hover:border-accent/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{sample.product}</CardTitle>
                      <CardDescription className="text-xs">{sample.id} • {sample.customer}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={statusConfig[sample.status].variant} className="gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig[sample.status].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text">Submitted</span>
                  <span className="font-medium text-text-h">{sample.submittedDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text">Revision Count</span>
                  <span className="font-medium text-text-h">{sample.revisionCount}x</span>
                </div>
                <p className="text-sm text-text bg-surface-2/50 rounded-lg p-3">{sample.notes}</p>
                <div className="flex gap-2 pt-2">
                  <Button variant="secondary" size="sm" className="flex-1">View Details</Button>
                  {sample.status === 'pending' && (
                    <>
                      <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700">Approve</Button>
                      <Button size="sm" variant="destructive" className="flex-1">Reject</Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
