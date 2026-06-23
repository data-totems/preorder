/**
 * Animated illustration for the login/auth right-hand panel.
 *
 * Pure inline SVG + CSS keyframes — no JS, no extra dependencies. Tells a
 * 6-second story per loop:
 *   1. A share-link arc draws itself from off-screen into the phone (someone
 *      shared a product).
 *   2. The first WhatsApp bubble drops in ("Welcome to my store!") with the
 *      single grey tick → double tick → read receipt turning WA-blue.
 *   3. Customer replies (right-side bubble), then merchant responds with the
 *      total + payment ask.
 *   4. A notification badge bounces onto the phone, a ₦ coin spins past, and
 *      confetti pops to celebrate the order.
 *
 * Honours `prefers-reduced-motion: reduce` — every animation collapses to a
 * static frame.
 */
const LoginHeroAnimation = () => (
  <svg
    viewBox="0 0 480 520"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="A WhatsApp chat between a customer and a merchant — order shared, replied to, and paid"
    className="w-full max-w-md mx-auto"
  >
    <defs>
      <radialGradient id="bz-bg-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#9DD7B7" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#9DD7B7" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="bz-screen" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#F5FAF5" />
        <stop offset="100%" stopColor="#E8F0E8" />
      </linearGradient>
      <linearGradient id="bz-bag" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FF8A65" />
        <stop offset="100%" stopColor="#E65A38" />
      </linearGradient>
      <linearGradient id="bz-coin" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFD86B" />
        <stop offset="100%" stopColor="#E8B240" />
      </linearGradient>
      <filter id="bz-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
        <feOffset dx="0" dy="8" result="offsetblur" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.35" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <style>{`
        @keyframes bz-float        { 0%,100% { transform: translateY(0); }       50% { transform: translateY(-8px); } }
        @keyframes bz-float-slow   { 0%,100% { transform: translateY(0)  rotate(-4deg); } 50% { transform: translateY(-14px) rotate(4deg); } }
        @keyframes bz-float-fast   { 0%,100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-10px) translateX(4px); } }
        @keyframes bz-pulse        { 0%,100% { opacity: 1;   transform: scale(1); }    50% { opacity: 0.4; transform: scale(1.3); } }
        @keyframes bz-msg          { 0%,3%   { opacity: 0; transform: translateY(10px) scale(0.95); }
                                     12%,68% { opacity: 1; transform: translateY(0) scale(1); }
                                     78%,100%{ opacity: 0; transform: translateY(-4px) scale(0.98); } }
        @keyframes bz-typing       { 0%,100% { transform: translateY(0); opacity: 0.4; } 50% { transform: translateY(-3px); opacity: 1; } }
        @keyframes bz-blob         { 0%,100% { transform: translate(0,0) scale(1); }   50% { transform: translate(12px,-12px) scale(1.08); } }
        @keyframes bz-spin         { 0%      { transform: rotateY(0deg);   }           50% { transform: rotateY(180deg); }            100% { transform: rotateY(360deg); } }
        @keyframes bz-draw         { 0%      { stroke-dashoffset: 240; opacity: 0; }   20% { opacity: 1; }
                                     60%     { stroke-dashoffset: 0;   opacity: 1; }   85% { opacity: 1; }
                                     100%    { stroke-dashoffset: 0;   opacity: 0; } }
        @keyframes bz-badge-pop    { 0%,40%  { opacity: 0; transform: scale(0); }
                                     50%     { opacity: 1; transform: scale(1.25); }
                                     60%,90% { opacity: 1; transform: scale(1); }
                                     100%    { opacity: 0; transform: scale(0.9); } }
        @keyframes bz-confetti     { 0%,55%  { opacity: 0; transform: translate(0,0) scale(0); }
                                     65%     { opacity: 1; transform: var(--bz-confetti-end) scale(1); }
                                     100%    { opacity: 0; transform: var(--bz-confetti-end) scale(0.6); } }
        @keyframes bz-tick         { 0%,40%  { fill: #9CA3AF; }
                                     60%,100%{ fill: #34B7F1; } }
        @keyframes bz-tick-second  { 0%,30%  { opacity: 0; }
                                     40%,100%{ opacity: 1; } }

        .bz-phone        { animation: bz-float       6s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
        .bz-status       { animation: bz-pulse       1.6s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
        .bz-msg-1        { animation: bz-msg         6s ease-in-out infinite; opacity: 0; transform-origin: left center; transform-box: fill-box; }
        .bz-msg-2        { animation: bz-msg         6s ease-in-out infinite; animation-delay: 1.7s; opacity: 0; transform-origin: right center; transform-box: fill-box; }
        .bz-msg-3        { animation: bz-msg         6s ease-in-out infinite; animation-delay: 3.4s; opacity: 0; transform-origin: left center; transform-box: fill-box; }
        .bz-typing-dot   { animation: bz-typing      1.1s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
        .bz-typing-dot-2 { animation-delay: 0.18s; }
        .bz-typing-dot-3 { animation-delay: 0.36s; }
        .bz-bag          { animation: bz-float-slow  4s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
        .bz-coin         { animation: bz-spin        3.5s linear infinite; transform-origin: center; transform-box: fill-box; }
        .bz-coin-wrap    { animation: bz-float-fast  3s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
        .bz-blob         { animation: bz-blob        9s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
        .bz-blob-2       { animation-delay: 2s; }
        .bz-link-arc     { stroke-dasharray: 240; animation: bz-draw 6s ease-in-out infinite; }
        .bz-badge        { animation: bz-badge-pop   6s ease-in-out infinite; animation-delay: 1.5s; opacity: 0; transform-origin: center; transform-box: fill-box; }
        .bz-confetti     { animation: bz-confetti    6s ease-in-out infinite; opacity: 0; transform-origin: center; transform-box: fill-box; }
        .bz-tick-blue    { animation: bz-tick        6s ease-in-out infinite; }
        .bz-tick-2       { animation: bz-tick-second 6s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .bz-phone, .bz-status, .bz-msg-1, .bz-msg-2, .bz-msg-3,
          .bz-typing-dot, .bz-bag, .bz-coin, .bz-coin-wrap, .bz-blob,
          .bz-link-arc, .bz-badge, .bz-confetti, .bz-tick-blue, .bz-tick-2 {
            animation: none !important;
            opacity: 1;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </defs>

    {/* Radial glow behind phone */}
    <ellipse cx="240" cy="280" rx="220" ry="220" fill="url(#bz-bg-glow)" />

    {/* Background drifting blobs */}
    <circle className="bz-blob"     cx="60"  cy="80"  r="55" fill="#9DD7B7" opacity="0.18" />
    <circle className="bz-blob bz-blob-2" cx="420" cy="440" r="75" fill="#9DD7B7" opacity="0.13" />

    {/* Sparkle dots */}
    <circle cx="380" cy="60"  r="6"   fill="#9DD7B7" opacity="0.55" />
    <circle cx="65"  cy="380" r="4"   fill="#9DD7B7" opacity="0.55" />
    <circle cx="445" cy="220" r="3.5" fill="#FAFFF8" opacity="0.6" />
    <circle cx="40"  cy="240" r="3"   fill="#FAFFF8" opacity="0.5" />

    {/* Shared-link arc — dotted curve drawing from the upper left toward the phone */}
    <path
      className="bz-link-arc"
      d="M 30 60 Q 120 30 180 110 T 240 160"
      stroke="#9DD7B7"
      strokeWidth="2.5"
      strokeDasharray="4 6"
      strokeLinecap="round"
      fill="none"
      opacity="0.8"
    />
    <circle cx="240" cy="160" r="4" fill="#9DD7B7" opacity="0.8" />

    {/* Floating shopping bag */}
    <g className="bz-bag" transform="translate(360 165)">
      <rect x="0" y="14" width="72" height="68" rx="9" fill="url(#bz-bag)" />
      <rect x="0" y="14" width="72" height="16" fill="#E65A38" />
      <path d="M 14 14 Q 14 -6 36 -6 Q 58 -6 58 14" stroke="#13321F" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <text x="36" y="56" fontFamily="system-ui, sans-serif" fontSize="15" fontWeight="800" fill="#FFFFFF" textAnchor="middle">₦12k</text>
      {/* Price tag */}
      <g transform="translate(52 56)">
        <path d="M 0 0 L 22 0 L 30 10 L 22 20 L 0 20 Z" fill="#FFFFFF" stroke="#13321F" strokeWidth="0.8" />
        <circle cx="24" cy="10" r="2.5" fill="#13321F" />
        <text x="11" y="14" fontFamily="system-ui, sans-serif" fontSize="8.5" fontWeight="800" fill="#13321F" textAnchor="middle">x2</text>
      </g>
    </g>

    {/* Spinning ₦ coin */}
    <g className="bz-coin-wrap" transform="translate(70 170)">
      <g className="bz-coin">
        <circle cx="0" cy="0" r="22" fill="url(#bz-coin)" stroke="#13321F" strokeWidth="2.5" />
        <text x="0" y="6" fontFamily="system-ui, sans-serif" fontSize="22" fontWeight="800" fill="#13321F" textAnchor="middle">₦</text>
      </g>
    </g>

    {/* Phone with drop shadow */}
    <g className="bz-phone" filter="url(#bz-shadow)">
      <rect x="130" y="50" width="220" height="420" rx="34" fill="#FAFFF8" stroke="#13321F" strokeWidth="2.5" />
      {/* Side buttons */}
      <rect x="127" y="110" width="3" height="20" rx="1" fill="#13321F" />
      <rect x="127" y="138" width="3" height="32" rx="1" fill="#13321F" />
      <rect x="127" y="178" width="3" height="32" rx="1" fill="#13321F" />
      <rect x="350" y="140" width="3" height="46" rx="1" fill="#13321F" />

      {/* Notch / dynamic island */}
      <rect x="205" y="60" width="70" height="20" rx="10" fill="#13321F" />

      {/* Screen */}
      <rect x="143" y="88" width="194" height="370" rx="22" fill="url(#bz-screen)" />

      {/* Status bar */}
      <text x="158" y="106" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="700" fill="#13321F">9:41</text>
      <g transform="translate(305 100)">
        <rect x="0" y="0" width="14" height="7" rx="1.5" fill="none" stroke="#13321F" strokeWidth="1" />
        <rect x="1" y="1" width="10" height="5" rx="0.5" fill="#13321F" />
      </g>

      {/* Chat header */}
      <rect x="143" y="113" width="194" height="58" fill="#13321F" />
      <circle cx="166" cy="142" r="14" fill="#9DD7B7" />
      <text x="166" y="147" fontFamily="system-ui, sans-serif" fontSize="13" fontWeight="800" fill="#13321F" textAnchor="middle">A</text>
      <text x="188" y="139" fontFamily="system-ui, sans-serif" fontSize="11.5" fontWeight="700" fill="#FFFFFF">Adunni&apos;s Store</text>
      <text x="188" y="154" fontFamily="system-ui, sans-serif" fontSize="9" fill="#9DD7B7">online now</text>
      <circle className="bz-status" cx="320" cy="142" r="4.5" fill="#25D366" />
      {/* WhatsApp camera + call icons */}
      <circle cx="298" cy="142" r="6" fill="none" stroke="#FAFFF8" strokeWidth="1.2" opacity="0.4" />

      {/* Chat background */}
      <rect x="143" y="171" width="194" height="240" fill="#E5DDD5" opacity="0.4" />

      {/* Date pill */}
      <rect x="206" y="180" width="68" height="14" rx="7" fill="#FAFFF8" opacity="0.95" />
      <text x="240" y="190" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="600" fill="#13321F" textAnchor="middle">TODAY</text>

      {/* Message 1: merchant greeting */}
      <g className="bz-msg-1">
        <path d="M 155 200 L 155 232 L 275 232 L 275 208 Q 275 200 267 200 L 163 200 Q 155 200 155 208 Z M 152 234 L 158 234 L 158 226 Z" fill="#FFFFFF" />
        <text x="163" y="220" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="500" fill="#13321F">Welcome to my store!</text>
        <text x="163" y="231" fontFamily="system-ui, sans-serif" fontSize="6.5" fill="#9CA3AF">9:41 AM</text>
      </g>

      {/* Message 2: customer reply */}
      <g className="bz-msg-2">
        <path d="M 200 248 L 200 282 L 320 282 L 320 256 Q 320 248 312 248 L 208 248 Q 200 248 200 256 Z M 322 284 L 316 284 L 316 276 Z" fill="#DCF8C6" />
        <text x="210" y="268" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="500" fill="#13321F">I&apos;d like 2 bags 🛍️</text>
        <text x="296" y="278" fontFamily="system-ui, sans-serif" fontSize="6.5" fill="#9CA3AF">9:42 AM</text>
        {/* Read receipts — start grey, turn WA blue */}
        <g transform="translate(308 276)">
          <path className="bz-tick-blue" d="M 0 -2 L 2 0 L 6 -4" stroke="#9CA3AF" strokeWidth="1.2" fill="none" />
          <path className="bz-tick-blue bz-tick-2" d="M 3 -2 L 5 0 L 9 -4" stroke="#9CA3AF" strokeWidth="1.2" fill="none" />
        </g>
      </g>

      {/* Message 3: merchant total + payment */}
      <g className="bz-msg-3">
        <path d="M 155 298 L 155 348 L 290 348 L 290 306 Q 290 298 282 298 L 163 298 Q 155 298 155 306 Z M 152 350 L 158 350 L 158 342 Z" fill="#FFFFFF" />
        <text x="163" y="318" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="700" fill="#13321F">Total: ₦12,000</text>
        <text x="163" y="334" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="500" fill="#13321F">Bank transfer? 💳</text>
        <text x="163" y="345" fontFamily="system-ui, sans-serif" fontSize="6.5" fill="#9CA3AF">9:43 AM</text>
      </g>

      {/* Typing dots — always present, hint of activity */}
      <g transform="translate(175 380)">
        <circle className="bz-typing-dot" cx="0" cy="0" r="2.5" fill="#13321F" />
        <circle className="bz-typing-dot bz-typing-dot-2" cx="9" cy="0" r="2.5" fill="#13321F" />
        <circle className="bz-typing-dot bz-typing-dot-3" cx="18" cy="0" r="2.5" fill="#13321F" />
      </g>

      {/* Input bar with paper-plane send button */}
      <rect x="155" y="420" width="142" height="28" rx="14" fill="#FFFFFF" stroke="#13321F" strokeWidth="0.6" opacity="0.95" />
      <text x="166" y="438" fontFamily="system-ui, sans-serif" fontSize="9.5" fill="#9CA3AF">Type a message…</text>
      <circle cx="313" cy="434" r="13" fill="#13321F" />
      <path
        d="M 307 434 L 320 430 L 318 434 L 320 438 Z M 308 434 L 318 434"
        stroke="#FAFFF8"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#FAFFF8"
      />

      {/* Home indicator */}
      <rect x="208" y="460" width="64" height="3" rx="1.5" fill="#13321F" opacity="0.4" />
    </g>

    {/* Notification badge — pops onto the phone when customer replies */}
    <g className="bz-badge" transform="translate(330 105)">
      <circle cx="0" cy="0" r="13" fill="#E53935" stroke="#FAFFF8" strokeWidth="2" />
      <text x="0" y="4" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="800" fill="#FFFFFF" textAnchor="middle">1</text>
    </g>

    {/* Confetti burst — small dots that shoot outward when the order is confirmed */}
    <g transform="translate(240 280)">
      <circle className="bz-confetti" style={{ ['--bz-confetti-end' as string]: 'translate(-60px,-50px)' } as React.CSSProperties} r="3" fill="#FFD86B" />
      <circle className="bz-confetti" style={{ ['--bz-confetti-end' as string]: 'translate(60px,-40px)' } as React.CSSProperties} r="3" fill="#9DD7B7" />
      <circle className="bz-confetti" style={{ ['--bz-confetti-end' as string]: 'translate(-50px,40px)' } as React.CSSProperties} r="2.5" fill="#FF8A65" />
      <circle className="bz-confetti" style={{ ['--bz-confetti-end' as string]: 'translate(70px,30px)' } as React.CSSProperties} r="2.5" fill="#34B7F1" />
      <circle className="bz-confetti" style={{ ['--bz-confetti-end' as string]: 'translate(-30px,-70px)' } as React.CSSProperties} r="2" fill="#FFD86B" />
      <circle className="bz-confetti" style={{ ['--bz-confetti-end' as string]: 'translate(40px,-60px)' } as React.CSSProperties} r="2" fill="#9DD7B7" />
    </g>
  </svg>
);

export default LoginHeroAnimation;
