import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  FilePlus2,
  Lock,
  Brain,
  AlertTriangle,
  Settings,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { LogoLockup } from '@/components/ui/Logo';
import { WalletButton } from '@/components/ui/WalletButton';
import { NetworkBanner } from '@/components/ui/NetworkBanner';
import { BOT_CHAIN } from '@/lib/botchain';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/trades', label: 'Trades', icon: ArrowLeftRight },
  { to: '/app/trades/new', label: 'Purchase Orders', icon: FilePlus2 },
  { to: '/app/trades', label: 'Escrow', icon: Lock, matchSearch: 'fund' },
  { to: '/app/trades', label: 'AI Reviews', icon: Brain, matchSearch: 'review' },
  { to: '/app/disputes', label: 'Disputes', icon: AlertTriangle },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-paper">
      <NetworkBanner />

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-surface lg:flex">
          <div className="flex h-16 items-center border-b border-line px-5">
            <Link to="/">
              <LogoLockup />
            </Link>
          </div>
          <nav className="flex-1 overflow-y-auto p-3">
            <p className="eyebrow mb-2 px-3 pt-2">Console</p>
            <ul className="space-y-0.5">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                        isActive ? 'bg-ink text-paper' : 'text-muted hover:bg-ink/5 hover:text-ink',
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t border-line p-4">
            <div className="rounded-xl bg-paper p-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Network</p>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-ink">{BOT_CHAIN.name}</span>
                <span className="font-mono text-[10px] tnum text-muted">{BOT_CHAIN.chainId}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile sidebar */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in" onClick={() => setMobileNavOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-72 border-r border-line bg-surface animate-slide-in">
              <div className="flex h-16 items-center justify-between border-b border-line px-5">
                <Link to="/" onClick={() => setMobileNavOpen(false)}>
                  <LogoLockup />
                </Link>
                <button onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="p-3">
                <ul className="space-y-0.5">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.label}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-lg px-3 py-3 text-sm',
                            isActive ? 'bg-ink text-paper' : 'text-muted hover:bg-ink/5',
                          )
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          </div>
        )}

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-paper/90 px-4 backdrop-blur-xl sm:px-6">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link to="/" className="lg:hidden">
                <LogoLockup mark="h-6 w-6" />
              </Link>
              <div className="hidden items-center gap-1.5 text-sm text-muted sm:flex">
                <Link to="/app" className="hover:text-ink">Console</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-ink">{getPageName(location.pathname)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 sm:flex">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-success" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  {BOT_CHAIN.network} · {BOT_CHAIN.chainId}
                </span>
              </span>
              <WalletButton variant="app" />
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

function getPageName(path: string): string {
  if (path === '/app') return 'Overview';
  if (path.includes('/new')) return 'New Trade';
  if (path.includes('/evidence')) return 'Evidence';
  if (path.includes('/review')) return 'AI Review';
  if (path.includes('/release')) return 'Release';
  if (path.includes('/disputes')) return 'Disputes';
  if (path.includes('/settings')) return 'Settings';
  if (path.includes('/trades')) return 'Trades';
  return 'Console';
}
