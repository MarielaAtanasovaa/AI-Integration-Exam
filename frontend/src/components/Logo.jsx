// NovaDom Realty mark — a location pin whose head is a house roof, with a teal
// "window" dot. Minimalist prop-tech style. Blue #2563eb + teal #10b981.
export default function Logo({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="NovaDom Realty"
    >
      {/* pin / map-marker body */}
      <path
        d="M24 3C15.16 3 8 10.16 8 19c0 10.5 13.06 23.2 15.02 25.04a1.42 1.42 0 0 0 1.96 0C26.94 42.2 40 29.5 40 19 40 10.16 32.84 3 24 3Z"
        fill="#2563eb"
      />
      {/* house roof + walls (negative space) */}
      <path
        d="M24 10.5 13.5 19.2a1 1 0 0 0-.36.77V19.97h2.4v8.2a1 1 0 0 0 1 1h15.32a1 1 0 0 0 1-1v-8.2h2.4v-.0a1 1 0 0 0-.36-.77L24 10.5Z"
        fill="#ffffff"
      />
      {/* teal window / location dot */}
      <circle cx="24" cy="22.5" r="3.1" fill="#10b981" />
    </svg>
  )
}
