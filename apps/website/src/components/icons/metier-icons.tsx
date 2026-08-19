interface IconProps {
  className?: string;
}

export function IconMaison({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M3.5 11 12 4l8.5 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 9.5V19a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 20v-5.5h5V20" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="15" y="6" width="2.2" height="3" rx="0.4" fill="currentColor" />
    </svg>
  );
}

export function IconPlomberie({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 5v3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M3 5h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M8.5 8.5H15a3.5 3.5 0 0 1 3.5 3.5v2.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 14.5v2a1 1 0 0 1-1 1h-1.2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 14v3.2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path
        d="M12 20.3a2.3 2.3 0 0 1-2.3-2.3c0-1.3 2.3-3.4 2.3-3.4s2.3 2.1 2.3 3.4a2.3 2.3 0 0 1-2.3 2.3Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconElectricite({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12.5 3 5 13.5h5.5L10 21l7.5-10.5H12l0.5-7.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function IconMenage({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M16.5 3.5 9.8 10.2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path
        d="M9.8 10.2 4 16a1.4 1.4 0 0 0 0 2l1 1a1.4 1.4 0 0 0 2 0l5.8-5.8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 15.5 4.3 19.8M8.3 17.8 7 21.3M9.8 14.2l.6 4.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M19 5.5l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8.8-1.7Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconInformatique({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 20h8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M12 16v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M7.5 8.5 10 11l-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 13.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconTransport({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 15.5 5.3 10a1.5 1.5 0 0 1 1.4-1h10.6a1.5 1.5 0 0 1 1.4 1l1.3 5.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="3" y="15.5" width="18" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="7.5" cy="19.3" r="1.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.5" cy="19.3" r="1.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}