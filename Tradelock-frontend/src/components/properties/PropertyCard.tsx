import { Link } from 'react-router-dom';
import { ArrowRight, Bed, Bath, Maximize2, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';
import type { Property } from '@/lib/types/property';
import { formatCurrency, formatNumber } from '@/lib/format';

interface PropertyCardProps {
  property: Property;
  basePath?: string;
}

export function PropertyCard({ property, basePath = '/properties' }: PropertyCardProps) {
  const detailUrl = `${basePath}/${property.id}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-ink/20 hover:shadow-lift">
      {/* Property Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink/5">
        <img
          src={property.featuredImage}
          alt={property.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Verification Status Pill */}
        <div className="absolute left-3.5 top-3.5 flex flex-wrap items-center gap-1.5">
          {property.verification.isPropertyVerified && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-surface/95 px-3 py-1 text-xs font-semibold text-success-600 shadow-sm backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              <span>TradeLock Verified</span>
            </span>
          )}
          {property.isDemo && (
            <span className="inline-flex items-center rounded-full border border-line bg-paper/90 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted backdrop-blur-md">
              Demo Asset
            </span>
          )}
        </div>

        {/* Property Type Badge */}
        <div className="absolute right-3.5 top-3.5">
          <span className="rounded-full bg-ink/80 px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-paper backdrop-blur-md">
            {property.propertyType}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Title and Location */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-accent-700" />
            <span className="truncate">{property.location}</span>
          </div>

          <h3 className="mt-2 text-lg font-bold tracking-tight text-ink group-hover:text-ink-600">
            <Link to={detailUrl} className="focus:outline-none">
              {property.title}
            </Link>
          </h3>

          {property.tagline && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
              {property.tagline}
            </p>
          )}
        </div>

        {/* Price Tag */}
        <div className="mt-4 flex items-baseline justify-between border-t border-line-soft pt-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Escrow Price</p>
            <div className="flex items-baseline gap-1.5">
              <span className="tnum text-xl font-bold tracking-tight text-ink">
                {formatCurrency(property.price)}
              </span>
              <span className="font-mono text-xs font-medium text-muted">
                {property.tokenSymbol}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Price / sqm</p>
            <p className="font-mono text-xs font-medium text-ink tnum">
              ${Math.round(property.price / property.sizeSqm).toLocaleString()}/m²
            </p>
          </div>
        </div>

        {/* Property Specs (Beds · Baths · sqm) */}
        <div className="mt-3.5 flex items-center justify-between rounded-xl bg-paper px-3.5 py-2.5 text-xs text-ink/80">
          <span className="flex items-center gap-1.5 font-medium">
            <Bed className="h-4 w-4 text-muted" />
            <span>{property.bedrooms} Beds</span>
          </span>
          <span className="text-line-strong">·</span>
          <span className="flex items-center gap-1.5 font-medium">
            <Bath className="h-4 w-4 text-muted" />
            <span>{property.bathrooms} Baths</span>
          </span>
          <span className="text-line-strong">·</span>
          <span className="flex items-center gap-1.5 font-medium">
            <Maximize2 className="h-3.5 w-3.5 text-muted" />
            <span>{formatNumber(property.sizeSqm)} sqm</span>
          </span>
        </div>

        {/* Verification Checklist Pills */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted">
          <span className="flex items-center gap-1 text-ink-500">
            <CheckCircle2 className="h-3 w-3 text-success" />
            Deed Audited
          </span>
          <span className="text-line-strong">·</span>
          <span className="flex items-center gap-1 text-ink-500">
            <CheckCircle2 className="h-3 w-3 text-success" />
            Seller Verified
          </span>
          <span className="text-line-strong">·</span>
          <span className="flex items-center gap-1 text-ink-500">
            <CheckCircle2 className="h-3 w-3 text-accent-700" />
            Escrow Ready
          </span>
        </div>

        {/* Action Button */}
        <div className="mt-5 pt-3">
          <Link
            to={detailUrl}
            className="btn-outline w-full justify-between group-hover:border-ink group-hover:bg-ink group-hover:text-paper"
          >
            <span>View Property</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
