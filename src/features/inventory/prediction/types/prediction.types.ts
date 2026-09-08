export interface ModelMetrics {
  mae: number;
  rmse: number;
  test_size: number;
  n_estimators: number;
  feature_columns: string[];
}

export interface PredictionResult {
  product_id: string;
  predicted_demand_total: number;
  safety_stock: number;
  reorder_point: number;
  current_stock: number;
  reorder_recommended: boolean;
  suggested_order_quantity: number;
}
