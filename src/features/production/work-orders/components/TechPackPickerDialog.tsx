import { useMemo, useState } from 'react';
import { Button } from '../../../../components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { techPackService } from '../../../rd/tech-pack/techPack.service';
import { useQuery } from '@tanstack/react-query';
import type { TechPack } from '../../../rd/tech-pack/techPack.types';

interface TechPackPickerDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect: (techPack: TechPack) => void;
	productId?: string | null;
}

export function TechPackPickerDialog({ open, onOpenChange, onSelect, productId }: TechPackPickerDialogProps) {
	const [q, setQ] = useState('');
	const { data: techPacks, isLoading } = useQuery({
		queryKey: ['rd', 'tech-packs', 'list'],
		queryFn: () => techPackService.list(),
		staleTime: 60_000,
		gcTime: 5 * 60_000,
	});

	const visibleTechPacks = useMemo(() => {
		let items = techPacks ?? [];
		if (productId) {
			items = items.filter((tp) => tp.product_id === productId);
		}
		const query = q.trim().toLowerCase();
		if (!query) return items;
		return items.filter((tp) =>
			String(tp.name ?? '').toLowerCase().includes(query)
		);
	}, [techPacks, q, productId]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Pilih Tech Pack</DialogTitle>
					<DialogDescription>Pilih tech pack untuk work order (opsional).</DialogDescription>
				</DialogHeader>

				<div className="relative">
					<Input
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder="Cari nama tech pack"
						className="h-10 pl-9"
						disabled={isLoading}
					/>
				</div>

				<div className="max-h-[45vh] overflow-auto rounded-xl border border-border/80">
					<table className="w-full border-collapse text-left text-sm">
						<thead className="sticky top-0 bg-surface-2">
							<tr>
								<th className="px-4 py-3">Nama Tech Pack</th>
								<th className="px-4 py-3">Produk</th>
								<th className="px-4 py-3 text-right">Aksi</th>
							</tr>
						</thead>
						<tbody>
							{isLoading ? (
								<tr>
									<td className="px-4 py-4" colSpan={3}>
										Loading tech packs...
									</td>
								</tr>
							) : visibleTechPacks.length === 0 ? (
								<tr>
									<td className="px-4 py-4" colSpan={3}>
										No tech packs found.
									</td>
								</tr>
							) : (
								visibleTechPacks.map((techPack) => (
									<tr key={techPack.id} className="border-t border-border/70">
										<td className="px-4 py-3 font-medium text-text-h">
											{techPack.name}
										</td>
										<td className="px-4 py-3 text-text">
											{techPack.product?.product_name ?? '-'}
										</td>
										<td className="px-4 py-3 text-right">
											<Button type="button" size="sm" onClick={() => onSelect(techPack)}>
												Pilih
											</Button>
										</td>
									</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					<DialogFooter>
						<Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
							Tutup
						</Button>
					</DialogFooter>
				</DialogContent>
		</Dialog>
	);
}
