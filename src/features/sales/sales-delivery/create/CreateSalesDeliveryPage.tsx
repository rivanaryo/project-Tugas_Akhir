"use no memo";

import { Link } from 'react-router';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '../../../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { SalesDeliveryCreateForm } from './components/SalesDeliveryCreateForm';

export function CreateSalesDeliveryPage() {
  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/sales/sales-deliveries">Sales Deliveries</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator/>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/sales/sales-deliveries/create">Create</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>Create Sales Delivery</CardTitle>
          <CardDescription>Buat Sales Delivery dari Sales Order dan salin item SO ke tabel secara otomatis.</CardDescription>
        </CardHeader>
        <CardContent>
          <SalesDeliveryCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}
