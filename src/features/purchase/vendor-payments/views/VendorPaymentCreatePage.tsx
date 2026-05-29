import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { PaymentForm } from '../components/PaymentForm';

export function VendorPaymentCreatePage() {
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/purchase">Purchase</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/purchase/vendor-payments">Vendor Payments</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button asChild type="button" variant="ghost" size="sm" className="gap-1.5">
              <Link to="/purchase/vendor-payments">
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Link>
            </Button>
            <div className="space-y-1">
              <CardTitle>Buat Pembayaran Vendor</CardTitle>
              <CardDescription>Buat pembayaran baru untuk vendor</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <PaymentForm />
        </CardContent>
      </Card>
    </div>
  );
}