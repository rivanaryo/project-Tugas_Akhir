"use no memo";

import { Link } from 'react-router-dom';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { GoodReceiptCreateForm } from '../../inventory/good-receipts/create/components/GoodReceiptCreateForm';

export function CreateProductionGoodReceiptPage() {
	return (
		<div className="space-y-4">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link to="/production">Production</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link to="/production/good-receipts">Good Receipts</Link>
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
					<CardTitle>Create Good Receipt</CardTitle>
					<CardDescription>
						Buat Good Receipt dari Purchase Order dan salin item PO ke tabel secara otomatis.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<GoodReceiptCreateForm redirectTo="/production/good-receipts" />
				</CardContent>
			</Card>
		</div>
	);
}
