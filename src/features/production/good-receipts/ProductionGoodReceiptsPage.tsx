import { GoodReceiptsTableSection } from '../../inventory/good-receipts/views/GoodReceiptsTableSection';

export function ProductionGoodReceiptsPage() {
	return (
		<GoodReceiptsTableSection
			basePath="/production/good-receipts"
			parentLabel="Production"
			parentTo="/production"
		/>
	);
}
