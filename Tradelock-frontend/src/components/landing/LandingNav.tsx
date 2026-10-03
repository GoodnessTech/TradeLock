import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { LogoLockup } from '@/components/ui/Logo';
import { WalletButton } from '@/components/ui/WalletButton';
import { cn } from '@/lib/cn';

const NAV = [
  { label: 'Properties', href: '/properties', isRoute: true },
  { label: 'Console', href: '/#product' },
  { label: 'How it works', href: '/#how' },
  { label: 'For Buyers', href: '/#buyers' },
  { label: 'For Sellers', href: '/#sellers' },
  { label: 'Security', href: '/#security' },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'border-b border-line/70 bg-paper/85 backdrop-blur-xl' : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-center" aria-label="TradeLock home">
          <LogoLockup />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) =>
            item.isRoute ? (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium text-ink transition-colors hover:text-ink-600"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-muted transition-colors hover:text-ink"
              >
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          <WalletButton />
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-line bg-paper lg:hidden animate-fade-in">
          <nav className="flex flex-col px-5 py-3">
            {NAV.map((item) =>
              item.isRoute ? (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-sm font-medium text-ink border-b border-line-soft last:border-0"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-sm text-ink border-b border-line-soft last:border-0"
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
