"use no memo";

import { Link } from 'react-router';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '../../../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { GoodReceiptCreateForm } from './components/GoodReceiptCreateForm';

export function CreateGoodReceiptPage() {
  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/inventory/good-receipts">Good Receipts</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator/>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/inventory/good-receipts/create">Create</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>Create Good Receipt</CardTitle>
          <CardDescription>Buat Good Receipt dari Purchase Order dan salin item PO ke tabel secara otomatis.</CardDescription>
        </CardHeader>
        <CardContent>
          <GoodReceiptCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}
