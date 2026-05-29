import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pricelistService } from '../services/pricelistService';
import type { CreatePricelistInput } from '../schemas/pricelist.schema';

export const useCreatePricelist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePricelistInput) => pricelistService.createPricelist(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['masterdata', 'pricelists'],
      });
    },
  });
};
