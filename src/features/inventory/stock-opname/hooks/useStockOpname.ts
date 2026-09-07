import { useQuery } from '@tanstack/react-query';
import { stockOpnameService } from '../services/stockOpname.service';

export const useStockOpname = (id: string | undefined) => {
  return useQuery({
    queryKey: ['inventory', 'stock-opnames', id],
    queryFn: () => stockOpnameService.fetchStockOpname(id!),
    enabled: !!id,
  });
};
