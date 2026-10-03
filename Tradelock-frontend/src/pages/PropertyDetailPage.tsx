import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Car,
  ShieldCheck,
  Lock,
  UserCheck,
  FileCheck2,
  Award,
  Share2,
  Heart,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { DEMO_PROPERTIES, getPropertyById } from '@/lib/data/properties';
import { TradeLockVerificationSection } from '@/components/properties/TradeLockVerificationSection';
import { RequestDetailsModal, ScheduleInspectionModal } from '@/components/properties/PropertyDetailModals';
import { formatCurrency, formatNumber } from '@/lib/format';
import { shortAddress, BOT_CHAIN } from '@/lib/botchain';

interface PropertyDetailPageProps {
  inAppLayout?: boolean;
}

export default function PropertyDetailPage({ inAppLayout = false }: PropertyDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const property = getPropertyById(id || '');

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!property) {
    return (
      <div className="mx-auto max-w-4xl py-16 text-center">
        <h2 className="text-2xl font-bold text-ink">Property Not Found</h2>
        <p className="mt-2 text-sm text-muted">The requested property listing could not be found or has been settled.</p>
        <Link to={inAppLayout ? '/app/properties' : '/properties'} className="btn-primary mt-6">
          Browse All Properties
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStartTransaction = () => {
    // Navigate to TradeLock purchase order creation with pre-filled property state
    navigate(`/app/trades/new?propertyId=${property.id}`, {
      state: { property },
    });
  };

  const allImages = property.gallery && property.gallery.length > 0 ? property.gallery : [property.featuredImage];

  return (
    <div className="mx-auto max-w-6xl pb-24">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Properties
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="btn-outline text-xs px-3.5 py-1.5"
            title="Share listing link"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-success" /> : <Share2 className="h-3.5 w-3.5" />}
            <span>{copiedLink ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Main Property Imagery (Hero Showcase) */}
      <section className="overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
        {/* Main Large Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink/5 sm:aspect-[21/9]">
          <img
            src={allImages[activeImageIndex] || property.featuredImage}
            alt={property.title}
            className="h-full w-full object-cover transition-all duration-300"
          />

          {/* Badges Overlay */}
          <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-surface/95 px-3 py-1 text-xs font-semibold text-success-600 shadow-sm backdrop-blur-md">
              <ShieldCheck className="h-4 w-4 text-success" />
              TradeLock Verified
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-ink/80 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-paper backdrop-blur-md">
              {property.propertyType}
            </span>
            {property.isDemo && (
              <span className="inline-flex items-center rounded-full border border-line bg-paper/90 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted backdrop-blur-md">
                Demo Asset
              </span>
            )}
          </div>
        </div>

        {/* Thumbnail Selector Strip */}
        {allImages.length > 1 && (
          <div className="flex gap-2 border-t border-line-soft bg-paper/50 p-3 overflow-x-auto">
            {allImages.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                  activeImageIndex === idx ? 'border-ink scale-102 ring-2 ring-ink/20' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt={`View ${idx + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Main Content Layout: Two Columns (Property Details vs Transaction Box) */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left Column: Title, Specs, Description, Features, Verification */}
        <div className="space-y-8 min-w-0">
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <MapPin className="h-4 w-4 text-accent-700" />
              <span>{property.location}</span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-4xl">
              {property.title}
            </h1>

            {property.tagline && (
              <p className="mt-2 text-base text-muted leading-relaxed">
                {property.tagline}
              </p>
            )}

            {/* Quick Specs Strip */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-line bg-surface p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Bedrooms</p>
                <div className="mt-1 flex items-center gap-2">
                  <Bed className="h-4 w-4 text-ink-500" />
                  <span className="text-lg font-bold text-ink tnum">{property.bedrooms} Beds</span>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-surface p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Bathrooms</p>
                <div className="mt-1 flex items-center gap-2">
                  <Bath className="h-4 w-4 text-ink-500" />
                  <span className="text-lg font-bold text-ink tnum">{property.bathrooms} Baths</span>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-surface p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Total Area</p>
                <div className="mt-1 flex items-center gap-2">
                  <Maximize2 className="h-4 w-4 text-ink-500" />
                  <span className="text-lg font-bold text-ink tnum">{formatNumber(property.sizeSqm)} m²</span>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-surface p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Year Built</p>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-ink-500" />
                  <span className="text-lg font-bold text-ink tnum">{property.yearBuilt || 2024}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
            <h2 className="text-lg font-bold text-ink">Property Overview</h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink/80">
              {property.description.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Key Features & Amenities */}
          <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
            <h2 className="text-lg font-bold text-ink">Features & Amenities</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {property.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-sm text-ink">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-ghost text-success">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PROMINENT SECTION: TradeLock Verification */}
          <TradeLockVerificationSection
            property={property}
            onRequestDetails={() => setDetailsModalOpen(true)}
            onScheduleInspection={() => setInspectionModalOpen(true)}
          />

          {/* Seller / Agent Verified Profile */}
          <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ink font-serif text-xl font-bold text-paper">
                  {property.seller.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-ink">{property.seller.name}</h3>
                    {property.seller.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-ghost px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-success">
                        <UserCheck className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5">{property.seller.role}</p>
                  <p className="font-mono text-xs text-ink/70 mt-1">
                    Signatory: {shortAddress(property.seller.address)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-line-soft pt-3 sm:border-0 sm:pt-0">
                <div className="text-left sm:text-right">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Completed Trades</p>
                  <p className="text-base font-bold text-ink tnum">{property.seller.dealsCompleted} Escrows</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Protected Escrow Action Box */}
        <div>
          <div className="sticky top-24 rounded-3xl border border-line bg-surface p-6 shadow-card space-y-6">
            <div>
              <p className="eyebrow text-accent-700">Protected Escrow Pricing</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="tnum text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                  {formatCurrency(property.price)}
                </span>
                <span className="font-mono text-sm font-semibold text-muted">
                  {property.tokenSymbol}
                </span>
              </div>
              <p className="mt-1 font-mono text-xs text-muted">
                ~${Math.round(property.price / property.sizeSqm).toLocaleString()} per m² · BOT Chain 677
              </p>
            </div>

            {/* Verification Guarantee Checklist */}
            <div className="rounded-2xl border border-line-soft bg-paper p-4 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-muted">Protocol Fee (0.5%–2%)</span>
                <span className="font-mono font-medium text-ink">Included</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Cadastral Title Audit</span>
                <span className="font-mono font-medium text-success">Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Deed Release Condition</span>
                <span className="font-mono font-medium text-ink">Buyer Authorized</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Smart Contract Vault</span>
                <span className="font-mono font-medium text-ink">{BOT_CHAIN.network}</span>
              </div>
            </div>

            {/* Primary Transaction Action: Start Protected Transaction */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleStartTransaction}
                className="btn-primary w-full py-3.5 text-base font-semibold shadow-lift flex items-center justify-center gap-2"
              >
                <Lock className="h-4 w-4" />
                <span>Start Protected Transaction</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-center font-mono text-[11px] text-muted">
                Funds are held in onchain escrow until you verify deeds and release.
              </p>
            </div>

            {/* Secondary Actions */}
            <div className="border-t border-line-soft pt-4 space-y-2">
              <button
                type="button"
                onClick={() => setDetailsModalOpen(true)}
                className="btn-outline w-full justify-center text-xs py-2.5"
              >
                <FileCheck2 className="h-3.5 w-3.5" />
                <span>Request Property Details</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectionModalOpen(true)}
                className="btn-ghost w-full justify-center text-xs py-2"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Schedule Inspection</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RequestDetailsModal
        property={property}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />

      <ScheduleInspectionModal
        property={property}
        isOpen={inspectionModalOpen}
        onClose={() => setInspectionModalOpen(false)}
      />
    </div>
  );
}
