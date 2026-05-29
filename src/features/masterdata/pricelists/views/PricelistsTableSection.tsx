import { Link } from 'react-router-dom';
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
import { PricelistsTable } from '../components/PricelistsTable';
import { MasterdataSearchBar } from '../../components/MasterdataSearchBar';
import { useMasterdataListFilters } from '../../hooks/useMasterdataListFilters';
import { usePricelists } from '../hooks/usePricelists';
import { Plus } from 'lucide-react';

export function PricelistsTableSection() {
  const { page, perPage, uiFilters, queryFilters, setPage, updateFilters, resetFilters } = useMasterdataListFilters();

  const { data, isLoading, isError, isFetching } = usePricelists({ page, perPage, filters: queryFilters });
  const pricelists = data?.items ?? [];
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
              <BreadcrumbPage>Pricelists</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Pricelists</CardTitle>
            <CardDescription>Kelola data pricelist vendor per produk</CardDescription>
          </div>
            <Button asChild type="button" size="sm" className="gap-1.5">
              <Link to="/masterdata/pricelists/create">
                <Plus className="h-4 w-4" />
                Tambah
              </Link>
            </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <MasterdataSearchBar
            value={uiFilters.q}
            onChange={(q) => updateFilters({ q })}
            onReset={resetFilters}
            isLoading={isLoading || isFetching}
            placeholder="Cari vendor, produk, atau mata uang pricelist"
          />

          <PricelistsTable
            data={pricelists}
            isLoading={isLoading}
            isError={isError}
            rowStartNumber={meta?.from ?? 1}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text">
              {meta ? `Menampilkan ${meta.from}-${meta.to} dari ${meta.total} pricelists` : 'Menampilkan 0 pricelists'}
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
    </Card>
  );
}
