export type SizeChartSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface SizeChart {
	id: string;
	product_id: string;
	product?: { id: string; product_name: string } | null;
	tech_pack_id?: string | null;
	tech_pack?: unknown | null;
	size: SizeChartSize;
	chest_width?: number | null;
	body_length?: number | null;
	sleeve_length?: number | null;
	shoulder_width?: number | null;
	created_at?: string;
	updated_at?: string;
}

export interface SizeChartsPaginationMeta {
	currentPage: number;
	lastPage: number;
	perPage: number;
	total: number;
	from: number;
	to: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

export interface PaginatedSizeCharts {
	items: SizeChart[];
	meta: SizeChartsPaginationMeta;
}
