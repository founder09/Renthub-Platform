/**
 * RentHub SVG Logo
 * Professional mark: stylized "R" inside a rounded square with geometric housing accent
 */
export function RentHubMark({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none"
      xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Background rounded square */}
      <rect width="40" height="40" rx="10" fill="url(#rh-grad)" />
      {/* House / roofline mark */}
      <path d="M8 22L20 12L32 22V32H26V26C26 24.343 24.657 23 23 23H17C15.343 23 14 24.343 14 26V32H8V22Z"
        fill="white" fillOpacity="0.95" />
      <defs>
        <linearGradient id="rh-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function RentHubWordmark({ className = '' }) {
  return (
    <svg width="108" height="24" viewBox="0 0 108 24" fill="none"
      xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* "Rent" */}
      <text x="0" y="19" fontFamily="Inter, system-ui, sans-serif"
        fontSize="18" fontWeight="700" letterSpacing="-0.5" fill="currentColor">
        Rent
      </text>
      {/* "Hub" — indigo */}
      <text x="46" y="19" fontFamily="Inter, system-ui, sans-serif"
        fontSize="18" fontWeight="700" letterSpacing="-0.5" fill="#6366f1">
        Hub
      </text>
    </svg>
  )
}

export default function RentHubLogo({ size = 32, showWordmark = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <RentHubMark size={size} />
      {showWordmark && (
        <span style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 18, fontWeight: 800,
          letterSpacing: '-0.5px',
          color: 'var(--text-primary)',
          lineHeight: 1,
        }}>
          Rent<span style={{ color: '#6366f1' }}>Hub</span>
        </span>
      )}
    </div>
  )
}
