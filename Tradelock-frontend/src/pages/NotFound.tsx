import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-5 text-center">
      <p className="font-mono text-[11px] uppercase tracking-eyebrow text-muted">Error 404</p>
      <h1 className="mt-4 text-display font-bold tracking-tighter2 text-ink">Page not found.</h1>
      <p className="mt-4 max-w-sm text-muted">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link to="/" className="btn-primary mt-8">
        <ArrowLeft className="h-4 w-4" />
        Back to TradeLock
      </Link>
    </div>
  );
}
