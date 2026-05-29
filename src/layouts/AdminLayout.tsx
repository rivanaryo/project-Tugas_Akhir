import { useContext, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Command, LayoutGrid, Receipt, Search, ShoppingCart, Users2, FolderOpen, Ruler, Package, Menu, X, Truck, CreditCard, Tags } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { AuthContext } from '../features/auth/components/AuthContext';
import { cn } from '../lib/utils';

const navigationItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutGrid, description: 'Overview & KPI' },
];

const masterdataItems = [
  { label: 'Categories', to: '/masterdata/categories', icon: FolderOpen},
  { label: 'Units', to: '/masterdata/units', icon: Ruler },
  { label: 'Products', to: '/masterdata/products', icon: Package },
  { label: 'Pricelists', to: '/masterdata/pricelists', icon: Tags },
  { label: 'Vendors', to: '/masterdata/vendors', icon: Truck },
  { label: 'Customers', to: '/masterdata/customers', icon: Users2 },
  { label: 'Accounts', to: '/masterdata/accounts', icon: CreditCard },
];

const purchaseItems = [
  { label: 'Purchase Orders', to: '/purchase/purchase-orders', icon: ShoppingCart },
  { label: 'Good Receipts', to: '/purchase/good-receipts', icon: ShoppingCart },
  { label: 'Vendor Payments', to: '/purchase/vendor-payments', icon: Receipt },
];

const salesItems = [
  { label: 'Sales Orders', to: '/sales/sales-orders', icon: Receipt },
  { label: 'Sales Deliveries', to: '/sales/sales-deliveries', icon: Truck },
  { label: 'Sales Invoices', to: '/sales/sales-invoices', icon: Receipt },
];



export function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AdminLayout must be used within AuthProvider');
  }

  const { user, logout } = authContext;
  const [isMasterdataOpen, setIsMasterdataOpen] = useState(pathname.startsWith('/masterdata'));
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(pathname.startsWith('/purchase'));
  const [isSalesOpen, setIsSalesOpen] = useState(pathname.startsWith('/sales'));  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const firstName = (user?.email ?? 'admin').split('@')[0];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-full bg-grid">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div className="flex min-h-screen w-full">
        <aside className={cn(
          'border-r border-border/70 bg-surface-1/80 backdrop-blur-xl transition-all duration-300',
          isSidebarCollapsed ? 'w-24 px-3 py-5 items-center' : 'w-73 p-6',
          'fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto lg:shrink-0',
          isSidebarOpen ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
        )}>
          <div className={cn(
            'flex flex-col transition-all duration-300',
            isSidebarCollapsed ? 'w-full items-center gap-3' : 'gap-4'
          )}>
            <div className={cn(
              'flex items-center gap-3 rounded-2xl border border-border/70 bg-white/80 shadow-default transition-all duration-300',
              isSidebarCollapsed ? 'w-10 h-10 p-0 justify-center' : 'w-full p-4'
            )}>
              <div className={cn(
                'grid place-items-center rounded-2xl bg-accent text-white shrink-0 transition-all duration-300',
                isSidebarCollapsed ? 'h-10 w-10' : 'h-12 w-12'
              )}>
                <Command className="h-5 w-5" />
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <p className="text-sm text-text">ERPMantra</p>
                  <p className="text-lg font-semibold text-text-h truncate">Admin Console</p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className={cn(
                'hidden lg:flex items-center justify-center h-10 rounded-xl border border-border/40 bg-surface-2 text-text hover:bg-surface-3 transition-colors',
                isSidebarCollapsed ? 'w-10' : 'w-full'
              )}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          <nav className={cn(
            'transition-all duration-300',
            isSidebarCollapsed ? 'mt-6 flex w-full flex-col items-center space-y-2.5' : 'mt-8 space-y-2'
          )}>
            {navigationItems.map(({ label, to, icon: Icon, description }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 overflow-hidden rounded-2xl border px-2 py-1 transition-all duration-300',
                    isSidebarCollapsed ? 'lg:h-11 lg:w-11 lg:justify-center lg:p-0' : 'lg:justify-start',
                    isActive
                      ? 'border-accent/30 bg-linear-to-r from-accent to-accent/80 text-white shadow-lg shadow-accent/20'
                      : 'border-border/40 bg-transparent text-text-h hover:border-accent/50 hover:bg-surface-2/80'
                  )
                }
                title={label}
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={cn(
                        'relative z-10 grid h-10 w-10 place-items-center rounded-xl transition-all duration-300 shrink-0',
                        isActive ? 'bg-white/20 text-white shadow-md' : 'bg-surface-2 text-accent group-hover:bg-surface-3'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    {!isSidebarCollapsed && (
                      <div className="relative z-10 min-w-0">
                        <p className={cn('text-[15px] font-semibold leading-tight', isActive ? 'text-white' : 'text-text-h')}>{label}</p>
                        <p className={cn('text-[12px]', isActive ? 'text-white/75' : 'text-text')}>{description}</p>
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
              {/* Purchase Menu */}
            <div className={cn(
              'space-y-2 transition-all duration-300',
              isSidebarCollapsed && 'w-11'
            )}>
              <button
                type="button"
                onClick={() => setIsPurchaseOpen((prev) => !prev)}
                className={cn(
                  'group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border px-2 py-1 text-left transition-all duration-300',
                  isSidebarCollapsed ? 'lg:h-11 lg:w-11 lg:justify-center lg:p-0' : 'lg:justify-start',
                  'border-border/40 bg-transparent text-text-h hover:border-accent/50 hover:bg-surface-2/80'
                )}
                title="Purchase"
              >
                <div
                  className={cn(
                  'relative z-10 grid h-10 w-10 place-items-center rounded-xl transition-all duration-300 shrink-0',
                    'bg-surface-2 text-accent group-hover:bg-surface-3'
                  )}
                >
                  <ShoppingCart className="h-5 w-5" />
                </div>
                {!isSidebarCollapsed && (
                  <>
                    <div className="relative z-10 min-w-0 flex-1">
                      <p className="text-[15px] font-semibold leading-tight text-text-h">Purchase</p>
                    </div>
                    <ChevronDown
                      className={cn(
                        'relative z-10 h-4 w-4 transition-transform duration-300 ease-out ml-auto',
                        isPurchaseOpen ? 'rotate-180' : 'rotate-0',
                        'text-text'
                      )}
                    />
                  </>
                )}
              </button>

              {isPurchaseOpen && !isSidebarCollapsed && (
                <div className="">
                  {purchaseItems.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => {
                          setIsSidebarOpen(false);
                        }}
                        className={({ isActive }) =>
                          cn(
                            'group relative flex items-center gap-3 overflow-hidden rounded-2xl border mx-10 max-w-full w-50 py-1 mt-2 transition-all duration-300 lg:justify-start',
                            isActive
                              ? 'border-accent/30 bg-linear-to-r from-accent to-accent/80 text-white shadow-lg shadow-accent/20'
                              : 'border-border/40 bg-transparent text-text-h hover:border-accent/50 hover:bg-surface-2/80'
                          )
                        }
                        title={item.label}
                      >
                        {({ isActive }) => (
                          <>
                            <div
                              className={cn(
                                'relative z-10 grid h-10 w-10 place-items-center rounded-xl transition-all duration-300 shrink-0',
                                isActive ? 'bg-white/20 text-white shadow-md' : 'bg-surface-2 text-accent group-hover:bg-surface-3'
                              )}
                            >
                              <ItemIcon className="h-5 w-5" />
                            </div>
                            <div className="relative z-10 min-w-0">
                              <p className={cn('text-[15px] font-semibold leading-tight', isActive ? 'text-white' : 'text-text-h')}>
                                {item.label}
                              </p>
                            </div>
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sales Menu */}
            <div className={cn(
              'space-y-2 transition-all duration-300',
              isSidebarCollapsed && 'w-11'
            )}>
              <button
                type="button"
                onClick={() => setIsSalesOpen((prev) => !prev)}
                className={cn(
                  'group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border px-2 py-1 text-left transition-all duration-300',
                  isSidebarCollapsed ? 'lg:h-11 lg:w-11 lg:justify-center lg:p-0' : 'lg:justify-start',
                  'border-border/40 bg-transparent text-text-h hover:border-accent/50 hover:bg-surface-2/80'
                )}
                title="Sales"
              >
                <div
                  className={cn(
                    'relative z-10 grid h-10 w-10 place-items-center rounded-xl transition-all duration-300 shrink-0',
                    'bg-surface-2 text-accent group-hover:bg-surface-3'
                  )}
                >
                  <Receipt className="h-5 w-5" />
                </div>
                {!isSidebarCollapsed && (
                  <>
                    <div className="relative z-10 min-w-0 flex-1">
                      <p className="text-[15px] font-semibold leading-tight text-text-h">Sales</p>
                    </div>
                    <ChevronDown
                      className={cn(
                        'relative z-10 h-4 w-4 transition-transform duration-300 ease-out ml-auto',
                        isSalesOpen ? 'rotate-180' : 'rotate-0',
                        'text-text'
                      )}
                    />
                  </>
                )}
              </button>

              {isSalesOpen && !isSidebarCollapsed && (
                <div className="">
                  {salesItems.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => {
                          setIsSidebarOpen(false);
                        }}
                        className={({ isActive }) =>
                          cn(
                            'group relative flex items-center gap-3 overflow-hidden rounded-2xl border mx-10 max-w-full w-50 py-1 mt-2 transition-all duration-300 lg:justify-start',
                            isActive
                              ? 'border-accent/30 bg-linear-to-r from-accent to-accent/80 text-white shadow-lg shadow-accent/20'
                              : 'border-border/40 bg-transparent text-text-h hover:border-accent/50 hover:bg-surface-2/80'
                          )
                        }
                        title={item.label}
                      >
                        {({ isActive }) => (
                          <>
                            <div
                              className={cn(
                                'relative z-10 grid h-10 w-10 place-items-center rounded-xl transition-all duration-300 shrink-0',
                                isActive ? 'bg-white/20 text-white shadow-md' : 'bg-surface-2 text-accent group-hover:bg-surface-3'
                              )}
                            >
                              <ItemIcon className="h-5 w-5" />
                            </div>
                            <div className="relative z-10 min-w-0">
                              <p className={cn('text-[15px] font-semibold leading-tight', isActive ? 'text-white' : 'text-text-h')}>
                                {item.label}
                              </p>
                            </div>
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Masterdata Menu */}
            <div className={cn(
              'space-y-2 transition-all duration-300',
              isSidebarCollapsed && 'w-11'
            )}>
              <button
                type="button"
                onClick={() => setIsMasterdataOpen((prev) => !prev)}
                className={cn(
                  'group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border px-2 py-1 text-left transition-all duration-300',
                  isSidebarCollapsed ? 'lg:h-11 lg:w-11 lg:justify-center lg:p-0' : 'lg:justify-start',
                  'border-border/40 bg-transparent text-text-h hover:border-accent/50 hover:bg-surface-2/80'
                )}
                title="Masterdata"
              >
                <div
                  className={cn(
                    'relative z-10 grid h-10 w-10 place-items-center rounded-xl transition-all duration-300 shrink-0',
                    'bg-surface-2 text-accent group-hover:bg-surface-3'
                  )}
                >
                  <Users2 className="h-5 w-5" />
                </div>
                {!isSidebarCollapsed && (
                  <>
                    <div className="relative z-10 min-w-0 flex-1">
                      <p className="text-[15px] font-semibold leading-tight text-text-h">Masterdata</p>
                    </div>
                    <ChevronDown
                      className={cn(
                        'relative z-10 h-4 w-4 transition-transform duration-300 ease-out ml-auto',
                        isMasterdataOpen ? 'rotate-180' : 'rotate-0',
                        'text-text'
                      )}
                    />
                  </>
                )}
              </button>

              {isMasterdataOpen && !isSidebarCollapsed && (
                <div className="">
                  {masterdataItems.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => {
                          setIsSidebarOpen(false);
                        }}
                        className={({ isActive }) =>
                          cn(
                            'group relative flex items-center gap-3 overflow-hidden rounded-2xl border mx-10 max-w-full w-50 py-1 mt-2 transition-all duration-300 lg:justify-start',
                            isActive
                              ? 'border-accent/30 bg-linear-to-r from-accent to-accent/80 text-white shadow-lg shadow-accent/20'
                              : 'border-border/40 bg-transparent text-text-h hover:border-accent/50 hover:bg-surface-2/80'
                          )
                        }
                        title={item.label}
                      >
                        {({ isActive }) => (
                          <>
                            <div
                              className={cn(
                                'relative z-10 grid h-10 w-10 place-items-center rounded-xl transition-all duration-300 shrink-0',
                                isActive ? 'bg-white/20 text-white shadow-md' : 'bg-surface-2 text-accent group-hover:bg-surface-3'
                              )}
                            >
                              <ItemIcon className="h-5 w-5" />
                            </div>
                            <div className="relative z-10 min-w-0">
                              <p className={cn('text-[15px] font-semibold leading-tight', isActive ? 'text-white' : 'text-text-h')}>
                                {item.label}
                              </p>
                            </div>
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col px-4 py-4 md:px-6 lg:px-8 lg:py-6">
          <header className="mb-6 rounded-[28px] border border-border/70 bg-surface-1/85 p-4 shadow-default backdrop-blur-xl">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen((prev) => !prev)}
                  className="shrink-0 rounded-xl p-2 hover:bg-surface-2 transition-colors lg:hidden"
                  aria-label="Toggle sidebar"
                >
                  {isSidebarOpen ? (
                    <X className="h-5 w-5 text-text" />
                  ) : (
                    <Menu className="h-5 w-5 text-text" />
                  )}
                </button>

                <div className="relative w-full max-w-full sm:max-w-sm lg:max-w-md xl:max-w-lg">
                  <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-text" />
                  <Input className="h-11 w-full border-border/80 bg-white pl-9 pr-4" placeholder="Search" />
                </div>
              </div>

              <div className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border/70 bg-white px-3 py-2 sm:w-auto sm:min-w-70 sm:justify-start sm:pr-2 lg:shrink-0">
                <Avatar>
                  <AvatarFallback>{firstName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 sm:max-w-48">
                  <p className="truncate text-sm font-semibold capitalize text-text-h">{firstName}</p>
                  <p className="truncate text-xs text-text">{user?.email}</p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleLogout}>Logout</Button>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
