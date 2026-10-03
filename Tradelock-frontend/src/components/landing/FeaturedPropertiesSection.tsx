import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Building2 } from 'lucide-react';
import { DEMO_PROPERTIES } from '@/lib/data/properties';
import { PropertyCard } from '@/components/properties/PropertyCard';

export function FeaturedPropertiesSection() {
  const featured = DEMO_PROPERTIES.slice(0, 3);

  return (
    <section className="border-t border-line py-24 bg-surface/50">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end mb-12">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success-ghost text-success">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <p className="eyebrow text-success-600">Onchain Real Estate Discovery</p>
            </div>
            <h2 className="mt-3 text-headline font-bold tracking-tightish text-ink">
              Verified properties, protected onchain.
            </h2>
            <p className="mt-3 max-w-2xl text-base text-muted leading-relaxed">
              Every property features verified cadastral survey coordinates, audited title deeds,
              and buyer-authorized smart contract escrow release on BOT Chain.
            </p>
          </div>

          <Link
            to="/properties"
            className="btn-outline self-start md:self-auto gap-2"
          >
            <span>Explore All Properties</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Featured 3 Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((prop) => (
            <PropertyCard key={prop.id} property={prop} basePath="/properties" />
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 rounded-2xl border border-line bg-paper p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink text-paper">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Are you a property developer or institutional owner?</h3>
              <p className="text-xs text-muted mt-0.5">
                List deed-verified properties on TradeLock to unlock global escrow buyers with automated milestone settlements.
              </p>
            </div>
          </div>
          <Link to="/app/trades/new" className="btn-primary text-xs shrink-0 px-5 py-2.5">
            Submit Property Listing
          </Link>
        </div>
      </div>
    </section>
  );
}
