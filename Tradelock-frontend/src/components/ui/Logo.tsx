export function Logo({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="currentColor" />
      <path d="M9 11h14v2.2H9zM9 15h14v2.2H9zM9 19h9v2.2H9z" fill="#E7A52B" />
      <circle cx="22" cy="20.1" r="2" fill="#F5F3EE" />
    </svg>
  );
}

export function LogoLockup({ className = '', mark = 'h-7 w-7 text-ink' }: { className?: string; mark?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Logo className={mark} />
      <span className="font-semibold tracking-tightish text-[15px] text-ink">TradeLock</span>
    </span>
  );
}
