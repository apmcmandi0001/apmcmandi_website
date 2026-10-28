import './Wordmark.css'

// =============================================================================
// "digimandi" written in the brand style: "digi" light, "mand" bold, and a
// leaf as the dot of the last "ı". Same as the app's front page and logo.
//   <Wordmark />          on light backgrounds (header)
//   <Wordmark onDark />   on dark backgrounds (footer)
// Font: Poppins (loaded in index.html).
// =============================================================================
export default function Wordmark({ onDark = false, className = '' }) {
  return (
    <span className={`dm-word${onDark ? ' dm-word--dark' : ''} ${className}`} role="img" aria-label="DigiMandi">
      <span className="dm-digi" aria-hidden="true">
        digi
      </span>
      <span className="dm-mandi" aria-hidden="true">
        mand
        <span className="dm-i">
          ı
          <svg className="dm-dot" viewBox="0 0 24 24">
            <path d="M12 22 C5 16 5 7 12 2 C19 7 19 16 12 22 Z" />
            <path d="M12 21 L12 6" className="dm-vein" />
          </svg>
        </span>
      </span>
    </span>
  )
}
