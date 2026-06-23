/**
 * Animated illustration for the login/auth right-hand panel.
 *
 * Pure inline SVG + CSS keyframes — no JS, no extra dependencies. The phone
 * gently floats, chat messages stream in on a loop, the online-status dot
 * pulses, and a shopping bag with a price tag bobs alongside. Respects
 * prefers-reduced-motion so users who've opted out of motion get a static
 * scene.
 */
const LoginHeroAnimation = () => (
  <svg
    viewBox="0 0 440 480"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="A WhatsApp chat between a customer and a merchant, with a shopping bag floating alongside"
    className="w-full max-w-md mx-auto"
  >
    <defs>
      <style>{`
        @keyframes bz-float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes bz-float-slow {
          0%, 100% { transform: translateY(0) rotate(-4deg); }
          50%      { transform: translateY(-12px) rotate(4deg); }
        }
        @keyframes bz-pulse {
          0%, 100% { opacity: 1;   transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(1.15); }
        }
        @keyframes bz-msg {
          0%, 5%   { opacity: 0; transform: translateY(8px); }
          15%, 60% { opacity: 1; transform: translateY(0); }
          70%, 100%{ opacity: 0; transform: translateY(-4px); }
        }
        @keyframes bz-typing {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-2px); }
        }
        @keyframes bz-blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(10px, -10px) scale(1.05); }
        }

        .bz-phone      { animation: bz-float 5s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
        .bz-status     { animation: bz-pulse 1.6s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
        .bz-msg-1      { animation: bz-msg 6s ease-in-out infinite; opacity: 0; transform-origin: center; transform-box: fill-box; }
        .bz-msg-2      { animation: bz-msg 6s ease-in-out infinite; animation-delay: 1.5s; opacity: 0; transform-origin: center; transform-box: fill-box; }
        .bz-msg-3      { animation: bz-msg 6s ease-in-out infinite; animation-delay: 3s; opacity: 0; transform-origin: center; transform-box: fill-box; }
        .bz-typing-dot { animation: bz-typing 1s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
        .bz-typing-dot-2 { animation-delay: 0.15s; }
        .bz-typing-dot-3 { animation-delay: 0.3s; }
        .bz-bag        { animation: bz-float-slow 4s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
        .bz-blob       { animation: bz-blob 8s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }

        @media (prefers-reduced-motion: reduce) {
          .bz-phone, .bz-status, .bz-msg-1, .bz-msg-2, .bz-msg-3,
          .bz-typing-dot, .bz-bag, .bz-blob { animation: none; opacity: 1; }
        }
      `}</style>
    </defs>

    {/* Background blobs */}
    <circle className="bz-blob" cx="60" cy="80" r="50" fill="#9DD7B7" opacity="0.12" />
    <circle className="bz-blob" cx="390" cy="410" r="70" fill="#9DD7B7" opacity="0.08" style={{ animationDelay: "2s" }} />
    <circle cx="380" cy="80" r="6" fill="#9DD7B7" opacity="0.6" />
    <circle cx="50" cy="380" r="4" fill="#9DD7B7" opacity="0.6" />
    <circle cx="410" cy="240" r="3" fill="#FFFFFF" opacity="0.4" />

    {/* Phone */}
    <g className="bz-phone">
      <rect x="110" y="40" width="220" height="400" rx="32" fill="#FAFFF8" stroke="#13321F" strokeWidth="2.5" />

      {/* Notch */}
      <rect x="195" y="48" width="50" height="8" rx="4" fill="#13321F" />

      {/* Screen */}
      <rect x="125" y="68" width="190" height="354" rx="20" fill="#F0F4F0" />

      {/* Chat header */}
      <rect x="125" y="68" width="190" height="56" fill="#13321F" />
      <rect x="125" y="116" width="190" height="8" fill="#13321F" />
      <path d="M 125 68 Q 125 68 145 68 L 295 68 Q 315 68 315 68 L 315 88 L 125 88 Z" fill="#13321F" />
      <circle cx="148" cy="96" r="13" fill="#9DD7B7" />
      <text x="148" y="101" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="700" fill="#13321F" textAnchor="middle">A</text>
      <text x="170" y="94" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="600" fill="#FFFFFF">Adunni&apos;s Store</text>
      <text x="170" y="108" fontFamily="system-ui, sans-serif" fontSize="9" fill="#9DD7B7">online now</text>
      <circle className="bz-status" cx="296" cy="96" r="4" fill="#4ADE80" />

      {/* Messages */}
      <g className="bz-msg-1">
        <rect x="135" y="148" width="135" height="36" rx="10" fill="#FFFFFF" />
        <rect x="135" y="148" width="3" height="36" fill="#13321F" />
        <text x="146" y="170" fontFamily="system-ui, sans-serif" fontSize="11" fill="#13321F">Welcome to my store! 👋</text>
      </g>

      <g className="bz-msg-2">
        <rect x="170" y="200" width="135" height="36" rx="10" fill="#13321F" />
        <text x="180" y="222" fontFamily="system-ui, sans-serif" fontSize="11" fill="#FFFFFF">I&apos;d like 2 bags 🛍️</text>
        <path d="M 305 232 L 300 232 L 308 220 Z" fill="#13321F" />
      </g>

      <g className="bz-msg-3">
        <rect x="135" y="252" width="155" height="50" rx="10" fill="#FFFFFF" />
        <rect x="135" y="252" width="3" height="50" fill="#13321F" />
        <text x="146" y="271" fontFamily="system-ui, sans-serif" fontSize="11" fill="#13321F">₦12,000 total.</text>
        <text x="146" y="289" fontFamily="system-ui, sans-serif" fontSize="11" fill="#13321F">Bank transfer? 💳</text>
      </g>

      {/* Typing dots — always visible */}
      <g transform="translate(155 360)">
        <circle className="bz-typing-dot" cx="0" cy="0" r="2.5" fill="#13321F" opacity="0.5" />
        <circle className="bz-typing-dot bz-typing-dot-2" cx="9" cy="0" r="2.5" fill="#13321F" opacity="0.5" />
        <circle className="bz-typing-dot bz-typing-dot-3" cx="18" cy="0" r="2.5" fill="#13321F" opacity="0.5" />
      </g>

      {/* Input bar */}
      <rect x="135" y="385" width="155" height="24" rx="12" fill="#FFFFFF" />
      <circle cx="300" cy="397" r="11" fill="#13321F" />
      <path d="M 296 397 L 304 397 M 304 397 L 301 394 M 304 397 L 301 400" stroke="#FAFFF8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </g>

    {/* Floating shopping bag with price tag */}
    <g className="bz-bag" transform="translate(330 180)">
      <rect x="0" y="14" width="68" height="62" rx="8" fill="#FF8A65" />
      <rect x="0" y="14" width="68" height="14" fill="#FF7043" />
      <path d="M 14 14 Q 14 -4 34 -4 Q 54 -4 54 14" stroke="#13321F" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <text x="34" y="52" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="700" fill="#FFFFFF" textAnchor="middle">₦12k</text>

      {/* Price tag */}
      <g transform="translate(48 52)">
        <path d="M 0 0 L 18 0 L 24 8 L 18 16 L 0 16 Z" fill="#FFFFFF" />
        <circle cx="20" cy="8" r="2" fill="#13321F" />
        <text x="9" y="11" fontFamily="system-ui, sans-serif" fontSize="7" fontWeight="700" fill="#13321F" textAnchor="middle">x2</text>
      </g>
    </g>

    {/* Sparkle dots */}
    <circle cx="365" cy="120" r="3" fill="#FAFFF8" opacity="0.7" />
    <circle cx="80" cy="180" r="2.5" fill="#FAFFF8" opacity="0.5" />
    <circle cx="75" cy="320" r="3" fill="#FAFFF8" opacity="0.6" />
    <circle cx="395" cy="350" r="2.5" fill="#FAFFF8" opacity="0.5" />
  </svg>
);

export default LoginHeroAnimation;
