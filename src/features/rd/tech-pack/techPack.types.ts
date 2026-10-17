export type TechPackStatus = 'draft' | 'review' | 'approved';
export type MarginType = 'nominal' | 'percentage';

export interface TechPackCosting {
  id?: string;
  material_cost: number;
  printing_cost: number;
  sewing_cost: number;
  additional_cost: number;
  hpp: number;
  margin_type: MarginType;
  margin: number;
  sell_price: number;
}

export interface TechPackBomItem {
  id: string;
  material_product_id: string;
  material?: { id: string; product_name: string } | null;
  usage: number;
  unit_id: string;
  unit?: { id: string; unit_code?: string; unit_name: string } | null;
  cost_per_unit: number;
  total: number;
}

export interface TechPackSizeChart {
  id?: string;
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  body_length?: number | null;
  chest_width?: number | null;
  sleeve_length?: number | null;
  shoulder_width?: number | null;
}

export interface TechPack {
  id: string;
  name: string;
  fabric?: string | null;
  gsm?: number | null;
  thread?: string | null;
  zipper?: string | null;
  accessories?: string[];
  status: TechPackStatus;
  product_id?: string | null;
  product?: { id: string; product_name: string } | null;
  bom_items_count?: number;
  bom_items?: TechPackBomItem[];
  size_charts?: TechPackSizeChart[];
  costing?: TechPackCosting | null;
  created_at?: string;
  updated_at?: string;
}

export interface TechPackPayload {
  name: string;
  fabric?: string;
  gsm?: number;
  thread?: string;
  zipper?: string;
  accessories?: string[];
  status: TechPackStatus;
  product_id?: string;
  size_charts?: Omit<TechPackSizeChart, 'id'>[];
  bom_items?: Array<Pick<TechPackBomItem, 'material_product_id' | 'usage' | 'unit_id' | 'cost_per_unit'>>;
  costing?: Pick<TechPackCosting, 'printing_cost' | 'sewing_cost' | 'additional_cost' | 'margin_type' | 'margin'>;
}
