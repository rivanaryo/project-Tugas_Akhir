import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../../../../components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { useAccounts } from '../hooks/useAccounts';
import { AccountsTable } from '../components/AccountsTable';
import { AddAccountDialog } from '../components/AddAccountDialog';
import { EditAccountDialog } from '../components/EditAccountDialog';
import { MasterdataSearchBar } from '../../components/MasterdataSearchBar';
import { useDeleteAccount } from '../hooks/useDeleteAccount';
import { useMasterdataListFilters } from '../../hooks/useMasterdataListFilters';
import type { Account } from '../types/account.types';

export function AccountsTableSection() {
  const { page, perPage, uiFilters, queryFilters, setPage, updateFilters, resetFilters } = useMasterdataListFilters();
  const [updatingAccountId, setUpdatingAccountId] = useState<string | number | null>(null);
  const [deletingAccountId, setDeletingAccountId] = useState<string | number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEditAccount, setSelectedEditAccount] = useState<Account | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const deleteAccountMutation = useDeleteAccount();

  const { data, isLoading, isError, isFetching } = useAccounts({ page, perPage, filters: queryFilters });
  const accounts = data?.items ?? [];
  const meta = data?.meta;

  const canGoPrev = Boolean(meta?.hasPrevPage) && !isFetching;
  const canGoNext = Boolean(meta?.hasNextPage) && !isFetching;

  const handlePrevPage = () => {
    if (!canGoPrev) {
      return;
    }

    setPage(page - 1);
  };

  const handleNextPage = () => {
    if (!canGoNext || !meta) {
      return;
    }

    setPage(Math.min(meta.lastPage, page + 1));
  };

  const handleDeleteAccount = (account: Account) => {
    setSelectedAccount(account);
    setIsDeleteDialogOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setUpdatingAccountId(account.id);
    setSelectedEditAccount(account);
    setIsEditDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAccount) {
      return;
    }

    setDeletingAccountId(selectedAccount.id);

    try {
      const result = await deleteAccountMutation.mutateAsync(selectedAccount.id);
      toast.success(result.message);
      setIsDeleteDialogOpen(false);
      setSelectedAccount(null);
    } catch {
      toast.error('Gagal menghapus account. Silakan coba lagi.');
    } finally {
      setDeletingAccountId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/masterdata">Masterdata</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Accounts</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Accounts</CardTitle>
            <CardDescription>
              Kelola Data Accounts
            </CardDescription>
          </div>

          <AddAccountDialog onCreated={() => setPage(1)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <MasterdataSearchBar
            value={uiFilters.q}
            onChange={(q) => updateFilters({ q })}
            onReset={resetFilters}
            isLoading={isLoading || isFetching}
            placeholder="Cari nama account atau kode account"
          />

          <AccountsTable
            data={accounts}
            isLoading={isLoading}
            isError={isError}
            rowStartNumber={meta?.from ?? 1}
            onEditAccount={handleEditAccount}
            onDeleteAccount={handleDeleteAccount}
            updatingAccountId={updatingAccountId}
            deletingAccountId={deletingAccountId}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text">
              {meta
                ? `Menampilkan ${meta.from}-${meta.to} dari ${meta.total} accounts`
                : 'Menampilkan 0 accounts'}
            </p>

            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={handlePrevPage} disabled={!canGoPrev}>
                Sebelumnya
              </Button>
              <span className="metric-number rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-h">
                Halaman {meta?.currentPage ?? page} / {meta?.lastPage ?? 1}
              </span>
              <Button type="button" variant="secondary" size="sm" onClick={handleNextPage} disabled={!canGoNext}>
                Selanjutnya
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);

          if (!open) {
            setSelectedAccount(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Account</DialogTitle>
            <DialogDescription>
              {selectedAccount
                ? `Yakin ingin menghapus account "${selectedAccount.account_name}"?`
                : 'Yakin ingin menghapus account ini?'}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={deleteAccountMutation.isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteAccountMutation.isPending || !selectedAccount}
            >
              {deleteAccountMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditAccountDialog
        open={isEditDialogOpen}
        account={selectedEditAccount}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);

          if (!open) {
            setSelectedEditAccount(null);
            setUpdatingAccountId(null);
          }
        }}
      />
    </Card>
  );
}
