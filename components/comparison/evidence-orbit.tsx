import { Network, ShieldCheck } from "lucide-react";

export function EvidenceOrbit({leftId,rightId}:{leftId:string;rightId:string}) {
  return (
    <div className="lupa-hero-violet relative isolate flex h-full min-h-[310px] flex-col overflow-hidden rounded-[26px] p-6 text-white sm:min-h-[340px] sm:p-7">
      <div className="pointer-events-none absolute inset-0 opacity-40 lupa-paper-grid" aria-hidden="true"/>
      <div className="relative z-10 flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[11px] font-semibold tracking-[.025em] backdrop-blur-md">
          <Network size={15} aria-hidden="true"/> RESEARCH STUDIO
        </span>
        <ShieldCheck size={20} className="text-[#d4f7fb]" aria-hidden="true"/>
      </div>

      <svg className="absolute inset-x-0 top-[33px] h-[270px] w-full sm:top-[23px] sm:h-[296px]"
        viewBox="0 0 480 295" role="img"
        aria-label={"Representação conceitual das referências "+leftId+" e "+rightId+" conectadas pela interpretação de evidências, não por cálculo combinado."}>
        <defs>
          <radialGradient id="lupa-orb-fill" cx="40%" cy="35%" r="78%">
            <stop offset="0%" stopColor="#e3fcff" stopOpacity=".92"/>
            <stop offset="24%" stopColor="#6dd8f3" stopOpacity=".66"/>
            <stop offset="58%" stopColor="#5b79f7" stopOpacity=".35"/>
            <stop offset="100%" stopColor="#142c8c" stopOpacity=".15"/>
          </radialGradient>
          <linearGradient id="lupa-arc-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#83e9e1" stopOpacity=".2"/>
            <stop offset=".52" stopColor="#a5d8ff" stopOpacity=".9"/>
            <stop offset="1" stopColor="#a5a6ff" stopOpacity=".2"/>
          </linearGradient>
          <filter id="lupa-soft-shadow" x="-90%" y="-90%" width="280%" height="280%">
            <feGaussianBlur stdDeviation="11"/>
          </filter>
          <filter id="lupa-orb-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4"/>
          </filter>
        </defs>
        <ellipse cx="240" cy="162" rx="144" ry="73" fill="none" stroke="#a8e6ff" strokeOpacity=".23" strokeWidth="1.5" transform="rotate(-27 240 162)"/>
        <ellipse cx="240" cy="162" rx="142" ry="69" fill="none" stroke="#a8e6ff" strokeOpacity=".21" strokeWidth="1.2" transform="rotate(47 240 162)"/>
        <circle cx="240" cy="158" r="94" fill="#4fbaf5" opacity=".30" filter="url(#lupa-soft-shadow)"/>
        <circle cx="240" cy="158" r="87" fill="url(#lupa-orb-fill)" stroke="#bce9ff" strokeOpacity=".32" strokeWidth="2"/>
        <g className="lupa-orbit-ring">
          <ellipse cx="240" cy="158" rx="112" ry="37" fill="none" stroke="url(#lupa-arc-stroke)" strokeWidth="2.8" transform="rotate(-39 240 158)"/>
        </g>
        <g className="lupa-orbit-ring lupa-orbit-ring-reverse">
          <ellipse cx="240" cy="158" rx="118" ry="42" fill="none" stroke="#b6d9ff" strokeOpacity=".40" strokeWidth="1.6" transform="rotate(42 240 158)"/>
        </g>
        <circle cx="240" cy="158" r="48" fill="#e1fcff" opacity=".10" filter="url(#lupa-orb-glow)"/>
        <circle cx="240" cy="158" r="41" fill="#132f81" fillOpacity=".55" stroke="#d2f8ff" strokeOpacity=".5"/>
        <path d="M220 158h12l5-14 9 28 6-14h12" fill="none" stroke="#e6fdff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M128 164C151 135 168 123 197 117M283 197C307 208 323 217 344 228" fill="none" stroke="#cdf7ff" strokeOpacity=".60" strokeWidth="1.7" strokeDasharray="4 7"/>
        <g>
          <circle cx="113" cy="168" r="31" fill="#eaf2ff" fillOpacity=".98"/>
          <text x="113" y="173" textAnchor="middle" fontSize="17" fontWeight="800" fill="#2355c4">A</text>
          <rect x="77" y="202" width="73" height="25" rx="12" fill="#dce8ff"/>
          <text x="113" y="219" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1c49a8">{leftId}</text>
        </g>
        <g>
          <circle cx="365" cy="214" r="31" fill="#e9fff9" fillOpacity=".98"/>
          <text x="365" y="219" textAnchor="middle" fontSize="17" fontWeight="800" fill="#08766d">B</text>
          <rect x="329" y="248" width="73" height="25" rx="12" fill="#d8faf1"/>
          <text x="365" y="265" textAnchor="middle" fontSize="12" fontWeight="800" fill="#0b645a">{rightId}</text>
        </g>
        <circle cx="170" cy="74" r="5" fill="#93f5ee"/>
        <circle cx="338" cy="99" r="4" fill="#d5d9ff"/>
        <circle cx="313" cy="243" r="3" fill="#d8fafa"/>
      </svg>
      <div className="relative z-10 mt-auto flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[.1em] text-[#d5eaff]">CONEXÕES NÃO SÃO CAUSALIDADE</p>
          <p className="mt-1 text-base font-bold tracking-[-.025em] sm:text-lg">Cada evidência no seu contexto.</p>
        </div>
        <span className="hidden shrink-0 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-[#eff6ff] sm:block">
          {leftId} / {rightId}
        </span>
      </div>
    </div>
  );
}
