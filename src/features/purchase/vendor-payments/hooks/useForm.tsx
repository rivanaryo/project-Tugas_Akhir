import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VendorPaymentSchema, type VendorPaymentFormValues } from '../schemas/VendorPayment.schemas';

export const usePaymentForm = (defaultValues?: Partial<VendorPaymentFormValues>) => {
    return useForm<VendorPaymentFormValues>({
        resolver: zodResolver(VendorPaymentSchema),
        defaultValues: {
            vendor_id: '',
            payment_number: '',
            vendor_invoice_number: '',
            payment_type: 'transfer',
            status: 'unpaid',
            payment_date: '',
            total_paid: '',
            account_id: '',
            ...defaultValues,
        },
        mode: 'onChange',
    });

};

