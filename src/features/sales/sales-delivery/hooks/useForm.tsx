import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  createSalesDeliveryFormSchema, 
  type CreateSalesDeliveryFormInput,
  salesDeliveryItemRefSchema,
  type SalesDeliveryItem
} from '../schemas/salesDelivery.schemas';


export const useSalesDeliveryForm = (defaultValues?: Partial<CreateSalesDeliveryFormInput>) => {
  return useForm<CreateSalesDeliveryFormInput>({
    resolver: zodResolver(createSalesDeliveryFormSchema) as Resolver<CreateSalesDeliveryFormInput>,
    defaultValues: {
      head: {
        delivery_number: '',
        customer_id: '',
        sales_order_id: '',
        status: 'draft',
        delivery_date: new Date().toISOString().split('T')[0],
        ...defaultValues?.head,
      },
      items: defaultValues?.items || [],
    },
    mode: 'onChange', // Validasi dilakukan setiap ada perubahan input
  });
};

export const useSalesDeliveryItemForm = (defaultValues?: Partial<SalesDeliveryItem>) => {
  return useForm<SalesDeliveryItem>({
    resolver: zodResolver(salesDeliveryItemRefSchema),
    defaultValues: {
      id: '',
      sales_delivery_item_id: '',
      qty_delivered: 0,
      tax_rate: 0,
      ...defaultValues,
    },
    mode: 'onChange',
  });
};
