"use no memo";

import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '../../../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { SalesInvoiceCreateForm } from './components/SalesInvoiceCreateForm';

export function CreateSalesInvoicePage() {
  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/sales/sales-invoices">Sales Invoices</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator/>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/sales/sales-invoices/create">Create</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>Create Sales Invoice</CardTitle>
          <CardDescription>Buat Sales Invoice dari Sales Order dan salin item SO ke tabel secara otomatis.</CardDescription>
        </CardHeader>
        <CardContent>
          <SalesInvoiceCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}
