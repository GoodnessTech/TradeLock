import { useState } from 'react';
import { X, FileText, Calendar, CheckCircle2, ShieldCheck, Download, Clock } from 'lucide-react';
import type { Property } from '@/lib/types/property';

interface RequestDetailsModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export function RequestDetailsModal({ property, isOpen, onClose }: RequestDetailsModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-lift animate-scale-in">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-muted hover:bg-paper hover:text-ink"
        >
          <X className="h-5 w-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft text-ink">
                <FileText className="h-4 w-4 text-accent-700" />
              </span>
              <p className="eyebrow text-muted">Legal & Cadastral Pack</p>
            </div>

            <h3 className="mt-3 text-xl font-bold text-ink">Request Property Details</h3>
            <p className="mt-1 text-sm text-muted">
              Get official deed audit records, cadastral coordinates, and structural survey files for{' '}
              <strong className="text-ink">{property.title}</strong>.
            </p>

            <div className="mt-4 rounded-xl border border-line-soft bg-paper p-3.5 text-xs text-muted space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono uppercase text-[10px]">Cadastral Survey</span>
                <span className="font-semibold text-ink">{property.verification.cadastralSurveyNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono uppercase text-[10px]">Title Deed Status</span>
                <span className="font-semibold text-ink">{property.verification.titleDeedType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono uppercase text-[10px]">Verified Developer</span>
                <span className="font-semibold text-ink">{property.seller.name}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adebayo Adeleke"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Corporate / Personal Email</label>
                <input
                  type="email"
                  required
                  placeholder="buyer@institution.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Request Information Pack
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-ghost text-success">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-ink">Pack Dispatched</h3>
            <p className="mt-2 text-sm text-muted max-w-sm mx-auto">
              The verified cadastral pack and title search report for {property.title} have been dispatched to{' '}
              <strong className="text-ink">{email}</strong>.
            </p>
            <div className="mt-6 flex justify-center">
              <button onClick={onClose} className="btn-primary">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ScheduleInspectionModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export function ScheduleInspectionModal({ property, isOpen, onClose }: ScheduleInspectionModalProps) {
  const [scheduled, setScheduled] = useState(false);
  const [inspectionType, setInspectionType] = useState<'ON_SITE' | 'VIRTUAL'>('ON_SITE');
  const [selectedDate, setSelectedDate] = useState('');
  const [contact, setContact] = useState('');

  if (!isOpen) return null;

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduled(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-lift animate-scale-in">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-muted hover:bg-paper hover:text-ink"
        >
          <X className="h-5 w-5" />
        </button>

        {!scheduled ? (
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-success-ghost text-success">
                <Calendar className="h-4 w-4" />
              </span>
              <p className="eyebrow text-muted">Certified Inspection</p>
            </div>

            <h3 className="mt-3 text-xl font-bold text-ink">Schedule Property Inspection</h3>
            <p className="mt-1 text-sm text-muted">
              Book a verified structural inspection or live video survey conducted by{' '}
              <strong className="text-ink">{property.verification.inspectionAgency}</strong>.
            </p>

            <form onSubmit={handleSchedule} className="mt-5 space-y-4">
              <div>
                <label className="label">Inspection Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setInspectionType('ON_SITE')}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      inspectionType === 'ON_SITE'
                        ? 'border-ink bg-ink text-paper'
                        : 'border-line bg-paper text-ink hover:border-ink/30'
                    }`}
                  >
                    <p className="text-sm font-semibold">Physical Site Visit</p>
                    <p className={`text-xs mt-0.5 ${inspectionType === 'ON_SITE' ? 'text-paper/70' : 'text-muted'}`}>
                      In-person engineer walkthrough
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectionType('VIRTUAL')}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      inspectionType === 'VIRTUAL'
                        ? 'border-ink bg-ink text-paper'
                        : 'border-line bg-paper text-ink hover:border-ink/30'
                    }`}
                  >
                    <p className="text-sm font-semibold">Live Video Survey</p>
                    <p className={`text-xs mt-0.5 ${inspectionType === 'VIRTUAL' ? 'text-paper/70' : 'text-muted'}`}>
                      HD interactive remote session
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Preferred Date</label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Contact Email or Phone</label>
                <input
                  type="text"
                  required
                  placeholder="Email or WhatsApp Number"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="input"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-ghost text-success">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-ink">Inspection Reserved</h3>
            <p className="mt-2 text-sm text-muted max-w-sm mx-auto">
              Your inspection request for <strong className="text-ink">{property.title}</strong> has been logged.
              A certified surveyor coordinator will contact you at <strong className="text-ink">{contact}</strong>.
            </p>
            <div className="mt-6 flex justify-center">
              <button onClick={onClose} className="btn-primary">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
