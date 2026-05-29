import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const salesInvoiceFormSchema = z.object({
  head: z.record(z.string(), z.any()),
  items: z.array(z.record(z.string(), z.any())),
});

type SalesInvoiceFormInput = z.infer<typeof salesInvoiceFormSchema>;

const salesInvoiceItemSchema = z.record(z.string(), z.any());
type SalesInvoiceItemFormInput = z.infer<typeof salesInvoiceItemSchema>;

export const useSalesInvoiceForm = (defaultValues?: Partial<SalesInvoiceFormInput>) => {
  return useForm<SalesInvoiceFormInput>({
    resolver: zodResolver(salesInvoiceFormSchema),
    defaultValues: {
      head: {
        ...defaultValues?.head,
      },
      items: defaultValues?.items ?? [],
    },
    mode: 'onChange', // Validasi dilakukan setiap ada perubahan input
  });
};

export const useSalesInvoiceItemForm = (defaultValues?: Partial<SalesInvoiceItemFormInput>) => {
  return useForm<SalesInvoiceItemFormInput>({
    resolver: zodResolver(salesInvoiceItemSchema),
    defaultValues: defaultValues ?? {},
    mode: 'onChange',
  });
};
