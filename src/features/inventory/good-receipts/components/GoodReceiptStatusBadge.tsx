import { Badge } from '../../../../components/ui/badge';
import type { GoodReceiptStatus } from '../types/goodReceipt.types';

interface GoodReceiptStatusBadgeProps {
  status: GoodReceiptStatus | string;
}

export function GoodReceiptStatusBadge({ status }: GoodReceiptStatusBadgeProps) {
  if (status === 'approved') return <Badge variant="info">Approved</Badge>;
  if (status === 'received') return <Badge variant="success">Received</Badge>;
  if (status === 'cancelled') return <Badge variant="danger">Cancelled</Badge>;
  if (status === 'draft') return <Badge variant="secondary">Draft</Badge>;
  return <Badge variant="default">{status || '-'}</Badge>;
}
