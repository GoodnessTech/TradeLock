import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { DEMO_PROPERTIES, filterProperties } from '@/lib/data/properties';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyFilters } from '@/components/properties/PropertyFilters';
import type { PropertyFilterState } from '@/lib/types/property';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';

const INITIAL_FILTERS: PropertyFilterState = {
  search: '',
  location: 'ALL',
  propertyType: 'ALL',
  priceRange: 'ALL',
  bedrooms: 'ALL',
  bathrooms: 'ALL',
  verifiedPropertyOnly: false,
  verifiedSellerOnly: false,
  escrowAvailableOnly: false,
  inspectionAvailableOnly: false,
};

interface PropertiesPageProps {
  inAppLayout?: boolean;
}

export default function PropertiesPage({ inAppLayout = false }: PropertiesPageProps) {
  const [filters, setFilters] = useState<PropertyFilterState>(INITIAL_FILTERS);

  const handleFilterChange = (patch: Partial<PropertyFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
  };

  const filteredProperties = useMemo(() => {
    return filterProperties(DEMO_PROPERTIES, filters);
  }, [filters]);

  const content = (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Discovery Hero Header */}
      <div className="mb-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success-ghost text-success">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <p className="eyebrow text-success-600">Real Estate Onchain Escrow</p>
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Properties
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              Discover audited real estate assets with cryptographic title verification and
              programmable escrow settlement on BOT Chain Mainnet.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/app/trades/new"
              className="btn-outline text-xs px-4 py-2"
            >
              Start Custom PO
            </Link>
          </div>
        </div>

        {/* Metric Badges Banner */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Audited Assets</p>
            <p className="mt-1 text-2xl font-bold tnum text-ink">{DEMO_PROPERTIES.length}</p>
            <p className="mt-0.5 text-[11px] text-success-600 flex items-center gap-1 font-medium">
              <CheckCircle2 className="h-3 w-3" /> 100% C of O Audited
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Escrow Volume</p>
            <p className="mt-1 text-2xl font-bold tnum text-ink">$2.25M</p>
            <p className="mt-0.5 text-[11px] text-muted">Total Asset Valuation</p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Settlement Protocol</p>
            <p className="mt-1 text-lg font-bold text-ink">BOT Chain</p>
            <p className="mt-0.5 font-mono text-[11px] text-muted">Chain ID 677</p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Title Assurance</p>
            <p className="mt-1 text-2xl font-bold text-ink">Zero Blind Trust</p>
            <p className="mt-0.5 text-[11px] text-accent-700 font-medium">Buyer-Authorized Release</p>
          </div>
        </div>
      </div>

      {/* Discovery Filters Bar */}
      <div className="mb-8">
        <PropertyFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleReset}
          totalCount={DEMO_PROPERTIES.length}
          filteredCount={filteredProperties.length}
        />
      </div>

      {/* Property Cards Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              basePath={inAppLayout ? '/app/properties' : '/properties'}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-line bg-surface p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted/40" />
          <h3 className="mt-4 text-lg font-semibold text-ink">No Properties Match Your Filter</h3>
          <p className="mt-1 text-sm text-muted">
            Try adjusting your search criteria or reset filters to see all available properties.
          </p>
          <button onClick={handleReset} className="btn-primary mt-6">
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );

  if (inAppLayout) {
    return content;
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <LandingNav />
      <main className="flex-1 pt-24 pb-20 sm:pt-28">
        {content}
      </main>
      <LandingFooter />
    </div>
  );
}
