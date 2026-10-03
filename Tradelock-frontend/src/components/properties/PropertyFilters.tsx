import { Search, X, SlidersHorizontal, ShieldCheck, Check, RotateCcw } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import type { PropertyFilterState } from '@/lib/types/property';
import { cn } from '@/lib/cn';

interface PropertyFiltersProps {
  filters: PropertyFilterState;
  onChange: (patch: Partial<PropertyFilterState>) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
}

const LOCATION_OPTIONS = [
  { value: 'ALL', label: 'All Locations' },
  { value: 'Lagos', label: 'Lagos, Nigeria' },
  { value: 'Abuja', label: 'Abuja, Nigeria' },
  { value: 'Nairobi', label: 'Nairobi, Kenya' },
  { value: 'Kigali', label: 'Kigali, Rwanda' },
  { value: 'Accra', label: 'Accra, Ghana' },
];

const PROPERTY_TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Property Types' },
  { value: 'Residential', label: 'Residential' },
  { value: 'Penthouse', label: 'Penthouse' },
  { value: 'Villa', label: 'Luxury Villa' },
  { value: 'Terrace', label: 'Terrace Townhouse' },
];

const PRICE_RANGE_OPTIONS = [
  { value: 'ALL', label: 'Any Price Range' },
  { value: 'UNDER_200K', label: 'Under $200,000' },
  { value: '200K_400K', label: '$200,000 – $400,000' },
  { value: '400K_600K', label: '$400,000 – $600,000' },
  { value: 'OVER_600K', label: 'Above $600,000' },
];

const BEDROOM_OPTIONS = [
  { value: 'ALL', label: 'Any Bedrooms' },
  { value: '3', label: '3+ Bedrooms' },
  { value: '4', label: '4+ Bedrooms' },
  { value: '5', label: '5+ Bedrooms' },
];

const BATHROOM_OPTIONS = [
  { value: 'ALL', label: 'Any Bathrooms' },
  { value: '3', label: '3+ Bathrooms' },
  { value: '4', label: '4+ Bathrooms' },
  { value: '5', label: '5+ Bathrooms' },
];

export function PropertyFilters({
  filters,
  onChange,
  onReset,
  totalCount,
  filteredCount,
}: PropertyFiltersProps) {
  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.location !== 'ALL' ||
    filters.propertyType !== 'ALL' ||
    filters.priceRange !== 'ALL' ||
    filters.bedrooms !== 'ALL' ||
    filters.bathrooms !== 'ALL' ||
    filters.verifiedPropertyOnly ||
    filters.verifiedSellerOnly ||
    filters.escrowAvailableOnly ||
    filters.inspectionAvailableOnly;

  return (
    <div className="space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-soft">
      {/* Search and Primary Filters Row */}
      <div className="flex flex-col gap-3 lg:flex-row">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search verified properties by name, district, or landmark..."
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="input pl-10 pr-9"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:flex lg:w-auto">
          <Select
            value={filters.location}
            onChange={(v) => onChange({ location: v })}
            options={LOCATION_OPTIONS}
            className="w-full lg:w-44"
          />
          <Select
            value={filters.propertyType}
            onChange={(v) => onChange({ propertyType: v })}
            options={PROPERTY_TYPE_OPTIONS}
            className="w-full lg:w-44"
          />
          <Select
            value={filters.priceRange}
            onChange={(v) => onChange({ priceRange: v })}
            options={PRICE_RANGE_OPTIONS}
            className="w-full sm:col-span-1 lg:w-48"
          />
        </div>
      </div>

      {/* Secondary Specs Row (Beds / Baths & TradeLock Filters) */}
      <div className="flex flex-col gap-4 border-t border-line-soft pt-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Quick Specs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Specs:
          </span>
          <Select
            value={filters.bedrooms}
            onChange={(v) => onChange({ bedrooms: v })}
            options={BEDROOM_OPTIONS}
            className="w-36"
          />
          <Select
            value={filters.bathrooms}
            onChange={(v) => onChange({ bathrooms: v })}
            options={BATHROOM_OPTIONS}
            className="w-36"
          />
        </div>

        {/* TradeLock Trust Badges / Verification Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted mr-1">
            <ShieldCheck className="h-3.5 w-3.5 text-accent-700" />
            Verification:
          </span>

          <button
            type="button"
            onClick={() => onChange({ verifiedPropertyOnly: !filters.verifiedPropertyOnly })}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              filters.verifiedPropertyOnly
                ? 'border-ink bg-ink text-paper'
                : 'border-line bg-paper text-ink hover:border-ink/30',
            )}
          >
            {filters.verifiedPropertyOnly && <Check className="h-3 w-3" />}
            Verified Property
          </button>

          <button
            type="button"
            onClick={() => onChange({ verifiedSellerOnly: !filters.verifiedSellerOnly })}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              filters.verifiedSellerOnly
                ? 'border-ink bg-ink text-paper'
                : 'border-line bg-paper text-ink hover:border-ink/30',
            )}
          >
            {filters.verifiedSellerOnly && <Check className="h-3 w-3" />}
            Verified Seller
          </button>

          <button
            type="button"
            onClick={() => onChange({ escrowAvailableOnly: !filters.escrowAvailableOnly })}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              filters.escrowAvailableOnly
                ? 'border-ink bg-ink text-paper'
                : 'border-line bg-paper text-ink hover:border-ink/30',
            )}
          >
            {filters.escrowAvailableOnly && <Check className="h-3 w-3" />}
            Escrow Available
          </button>

          <button
            type="button"
            onClick={() => onChange({ inspectionAvailableOnly: !filters.inspectionAvailableOnly })}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              filters.inspectionAvailableOnly
                ? 'border-ink bg-ink text-paper'
                : 'border-line bg-paper text-ink hover:border-ink/30',
            )}
          >
            {filters.inspectionAvailableOnly && <Check className="h-3 w-3" />}
            Inspection Available
          </button>
        </div>
      </div>

      {/* Filter Summary and Reset Row */}
      <div className="flex items-center justify-between border-t border-line-soft pt-3 text-xs text-muted">
        <div>
          Showing <span className="font-semibold text-ink tnum">{filteredCount}</span> of{' '}
          <span className="font-semibold text-ink tnum">{totalCount}</span> properties
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-ink hover:text-danger"
          >
            <RotateCcw className="h-3 w-3" />
            Reset all filters
          </button>
        )}
      </div>
    </div>
  );
}
