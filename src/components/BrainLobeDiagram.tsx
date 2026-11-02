import React from 'react';
import { TestResult } from '../types';

interface BrainLobeDiagramProps {
  brainAnalysis: TestResult['brainAnalysis'];
  className?: string;
}

export const BrainLobeDiagram: React.FC<BrainLobeDiagramProps> = ({ brainAnalysis, className = '' }) => {
  const frontalPct = brainAnalysis?.frontalLobe ? brainAnalysis.frontalLobe.toFixed(2) : '0.00';
  const parietalPct = brainAnalysis?.parietalLobe ? brainAnalysis.parietalLobe.toFixed(2) : '0.00';
  const occipitalPct = brainAnalysis?.occipitalLobe ? brainAnalysis.occipitalLobe.toFixed(2) : '0.00';
  const temporalPct = brainAnalysis?.temporalLobe ? brainAnalysis.temporalLobe.toFixed(2) : '0.00';

  return (
    <div className={`relative flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-3 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs ${className}`}>
      {/* SVG Brain Illustration with anatomical lobes and leader lines */}
      <div className="w-full max-w-[340px] sm:max-w-[400px] aspect-4/3 flex items-center justify-center">
        <svg
          viewBox="0 0 460 320"
          className="w-full h-full drop-shadow-sm select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Subtle glow / drop shadows for lobes */}
            <filter id="lobeShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.08" />
            </filter>
            
            {/* Marker arrow for pointer lines */}
            <marker id="dotPoint" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6">
              <circle cx="5" cy="5" r="3.5" fill="#1e293b" />
            </marker>
          </defs>

          {/* Brain Shadow Outline */}
          <ellipse cx="195" cy="275" rx="100" ry="12" fill="#e2e8f0" opacity="0.6" />

          {/* Brainstem (Pons & Medulla) */}
          <g filter="url(#lobeShadow)">
            <path
              d="M 175,200 C 172,225 178,255 185,275 C 198,275 205,273 205,270 C 200,245 198,220 196,198 Z"
              fill="#94a3b8"
              stroke="#64748b"
              strokeWidth="2"
            />
            {/* Stem folds */}
            <path d="M 178,225 Q 188,230 198,226" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
            <path d="M 180,245 Q 190,250 200,246" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
          </g>

          {/* Cerebellum (Otak Kecil) */}
          <g filter="url(#lobeShadow)">
            <path
              d="M 215,185 C 235,188 265,195 272,215 C 275,235 258,255 235,258 C 210,260 190,245 186,225 C 185,210 195,190 215,185 Z"
              fill="#fb923c"
              stroke="#ea580c"
              strokeWidth="2.5"
            />
            {/* Cerebellar folia ripples */}
            <path d="M 205,205 Q 235,200 255,210" fill="none" stroke="#fff" strokeWidth="1.8" opacity="0.7" />
            <path d="M 198,220 Q 230,215 260,225" fill="none" stroke="#fff" strokeWidth="1.8" opacity="0.7" />
            <path d="M 200,235 Q 225,230 250,240" fill="none" stroke="#fff" strokeWidth="1.8" opacity="0.7" />
            <path d="M 210,248 Q 230,245 240,250" fill="none" stroke="#fff" strokeWidth="1.8" opacity="0.7" />
          </g>

          {/* 1. FRONTAL LOBE (Anterior / Depan) - Vibrant Rose / Pink */}
          <g filter="url(#lobeShadow)">
            <path
              d="M 85,150 
                 C 60,135 50,110 58,85 
                 C 65,60 85,35 125,25 
                 C 165,16 195,28 215,45 
                 C 210,75 195,105 185,135 
                 C 155,142 125,148 85,150 Z"
              fill="#f43f5e"
              stroke="#e11d48"
              strokeWidth="2.5"
            />
            {/* Frontal Gyri (Sulcus folds) */}
            <path d="M 75,70 Q 110,65 140,75 Q 170,80 185,60" fill="none" stroke="#ffe4e6" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
            <path d="M 85,105 Q 120,95 155,105 Q 175,100 185,115" fill="none" stroke="#ffe4e6" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
            <path d="M 105,128 Q 135,120 160,130" fill="none" stroke="#ffe4e6" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
            <path d="M 115,42 Q 135,55 160,40" fill="none" stroke="#ffe4e6" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          </g>

          {/* 2. PARIETAL LOBE (Superior Posterior / Atas Belakang) - Vibrant Amber / Yellow */}
          <g filter="url(#lobeShadow)">
            <path
              d="M 215,45 
                 C 240,48 268,60 285,80 
                 C 298,95 305,115 302,135 
                 C 285,138 255,142 235,145 
                 C 205,142 195,125 185,135 
                 C 195,105 210,75 215,45 Z"
              fill="#eab308"
              stroke="#ca8a04"
              strokeWidth="2.5"
            />
            {/* Parietal Gyri */}
            <path d="M 225,65 Q 255,75 285,95" fill="none" stroke="#fef9c3" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
            <path d="M 215,95 Q 245,100 275,115" fill="none" stroke="#fef9c3" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
            <path d="M 205,120 Q 235,118 260,130" fill="none" stroke="#fef9c3" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
          </g>

          {/* 3. OCCIPITAL LOBE (Posterior Pole / Belakang Bawah) - Vibrant Emerald / Teal */}
          <g filter="url(#lobeShadow)">
            <path
              d="M 302,135 
                 C 318,150 318,175 305,195 
                 C 295,208 275,215 255,210 
                 C 248,185 240,165 235,145 
                 C 255,142 285,138 302,135 Z"
              fill="#10b981"
              stroke="#059669"
              strokeWidth="2.5"
            />
            {/* Occipital Gyri */}
            <path d="M 255,160 Q 280,165 305,155" fill="none" stroke="#d1fae5" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
            <path d="M 250,180 Q 275,185 295,178" fill="none" stroke="#d1fae5" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
            <path d="M 252,198 Q 270,202 285,195" fill="none" stroke="#d1fae5" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
          </g>

          {/* 4. TEMPORAL LOBE (Inferior Lateral / Samping Bawah) - Vibrant Purple / Violet */}
          <g filter="url(#lobeShadow)">
            <path
              d="M 85,150 
                 C 125,148 155,142 185,135 
                 C 195,125 205,142 235,145 
                 C 240,165 248,185 220,188 
                 C 190,192 165,190 145,188 
                 C 115,185 95,175 85,150 Z"
              fill="#8b5cf6"
              stroke="#7c3aed"
              strokeWidth="2.5"
            />
            {/* Temporal Gyri */}
            <path d="M 105,158 Q 145,155 185,150 Q 215,155 228,165" fill="none" stroke="#ede9fe" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
            <path d="M 120,172 Q 160,168 195,165 Q 215,172 225,180" fill="none" stroke="#ede9fe" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
          </g>

          {/* LEADER LINES AND DIRECT POINTER CALLOUTS (Matching uploaded reference PDF) */}
          
          {/* Pointer: Frontal Lobe */}
          <path d="M 135,70 L 260,40 L 320,40" fill="none" stroke="#e11d48" strokeWidth="1.8" strokeDasharray="3 3" />
          <circle cx="135" cy="70" r="3.5" fill="#e11d48" />

          {/* Pointer: Parietal Lobe */}
          <path d="M 245,85 L 290,75 L 320,75" fill="none" stroke="#ca8a04" strokeWidth="1.8" strokeDasharray="3 3" />
          <circle cx="245" cy="85" r="3.5" fill="#ca8a04" />

          {/* Pointer: Occipital Lobe */}
          <path d="M 275,170 L 305,120 L 320,120" fill="none" stroke="#059669" strokeWidth="1.8" strokeDasharray="3 3" />
          <circle cx="275" cy="170" r="3.5" fill="#059669" />

          {/* Pointer: Temporal Lobe */}
          <path d="M 155,165 L 210,165 L 320,165" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeDasharray="3 3" />
          <circle cx="155" cy="165" r="3.5" fill="#7c3aed" />

          {/* Callout Labels on Right of Brain */}
          <g transform="translate(325, 0)">
            {/* Frontal Callout */}
            <text x="0" y="44" fontFamily="sans-serif" fontSize="13" fontWeight="bold" fill="#be123c">
              Frontal lobe
            </text>
            <text x="85" y="44" fontFamily="monospace" fontSize="13" fontWeight="bold" fill="#881337">
              ({frontalPct}%)
            </text>

            {/* Parietal Callout */}
            <text x="0" y="79" fontFamily="sans-serif" fontSize="13" fontWeight="bold" fill="#a16207">
              Parietal lobe
            </text>
            <text x="85" y="79" fontFamily="monospace" fontSize="13" fontWeight="bold" fill="#713f12">
              ({parietalPct}%)
            </text>

            {/* Occipital Callout */}
            <text x="0" y="124" fontFamily="sans-serif" fontSize="13" fontWeight="bold" fill="#047857">
              Occipital lobe
            </text>
            <text x="90" y="124" fontFamily="monospace" fontSize="13" fontWeight="bold" fill="#064e3b">
              ({occipitalPct}%)
            </text>

            {/* Temporal Callout */}
            <text x="0" y="169" fontFamily="sans-serif" fontSize="13" fontWeight="bold" fill="#6d28d9">
              Temporal lobe
            </text>
            <text x="92" y="169" fontFamily="monospace" fontSize="13" fontWeight="bold" fill="#4c1d95">
              ({temporalPct}%)
            </text>
          </g>
        </svg>
      </div>

      {/* Anatomical Lobe Descriptions - Clean Table / Cards */}
      <div className="flex-1 w-full space-y-2 text-xs">
        <div className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/70">
          <div className="flex items-center justify-between mb-0.5">
            <span className="font-bold text-rose-900">FRONTAL LOBE :</span>
            <span className="font-mono font-bold text-rose-800 bg-white px-2 py-0.5 rounded text-[11px] border border-rose-200">
              {frontalPct}%
            </span>
          </div>
          <p className="text-[11px] text-slate-700 leading-snug">
            Juga dikenal sebagai korteks motorik, bagian otak yang bertanggung jawab untuk penalaran, perencanaan, berbicara, gerakan, emosi, pemecahan masalah, indera penciuman, keterampilan sosial dan moralitas.
          </p>
        </div>

        <div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/70">
          <div className="flex items-center justify-between mb-0.5">
            <span className="font-bold text-amber-900">PARIETAL LOBE :</span>
            <span className="font-mono font-bold text-amber-800 bg-white px-2 py-0.5 rounded text-[11px] border border-amber-200">
              {parietalPct}%
            </span>
          </div>
          <p className="text-[11px] text-slate-700 leading-snug">
            Juga dikenal sebagai korteks somatosensori, bagian otak yang bertanggung jawab atas bagaimana kita merasakan rangsangan yang berbeda seperti sentuhan, tekanan, suhu, dan rasa sakit.
          </p>
        </div>

        <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70">
          <div className="flex items-center justify-between mb-0.5">
            <span className="font-bold text-emerald-900">OCCIPITAL LOBE :</span>
            <span className="font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded text-[11px] border border-emerald-200">
              {occipitalPct}%
            </span>
          </div>
          <p className="text-[11px] text-slate-700 leading-snug">
            Juga dikenal sebagai korteks visual, bagian otak yang terlibat dalam mengamati, mengimajinasikan, dan menafsirkan informasi visual.
          </p>
        </div>

        <div className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/70">
          <div className="flex items-center justify-between mb-0.5">
            <span className="font-bold text-purple-900">TEMPORAL LOBE :</span>
            <span className="font-mono font-bold text-purple-800 bg-white px-2 py-0.5 rounded text-[11px] border border-purple-200">
              {temporalPct}%
            </span>
          </div>
          <p className="text-[11px] text-slate-700 leading-snug">
            Juga dikenal sebagai korteks pendengaran, bagian otak yang bertanggung jawab untuk merasakan dan mengenali interpretasi rangsangan pendengaran dan bahasa yang didengar.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Top-down view of Left Brain (Ki) vs Right Brain (Ka)
 * Matching Page 2 of the uploaded sample document
 */
interface HemispheresDiagramProps {
  leftDominance: number;
  rightDominance: number;
  className?: string;
}

export const HemispheresDiagram: React.FC<HemispheresDiagramProps> = ({
  leftDominance,
  rightDominance,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-center gap-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs ${className}`}>
      {/* Top-down Brain Illustration */}
      <div className="w-48 h-40 relative flex items-center justify-center">
        <svg viewBox="0 0 200 160" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          {/* Shadow */}
          <ellipse cx="100" cy="145" rx="65" ry="8" fill="#e2e8f0" />

          {/* Left Hemisphere (Ki) */}
          <path
            d="M 97,20 C 70,20 40,40 35,75 C 30,110 60,135 97,138 Z"
            fill="#3b82f6"
            stroke="#1d4ed8"
            strokeWidth="2.5"
          />
          {/* Gyri lines */}
          <path d="M 50,55 Q 75,50 90,65" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
          <path d="M 45,85 Q 70,80 92,95" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
          <path d="M 55,115 Q 75,110 90,120" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />

          {/* Right Hemisphere (Ka) */}
          <path
            d="M 103,20 C 130,20 160,40 165,75 C 170,110 140,135 103,138 Z"
            fill="#10b981"
            stroke="#047857"
            strokeWidth="2.5"
          />
          {/* Gyri lines */}
          <path d="M 150,55 Q 125,50 110,65" fill="none" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" />
          <path d="M 155,85 Q 130,80 108,95" fill="none" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" />
          <path d="M 145,115 Q 125,110 110,120" fill="none" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" />

          {/* Longitudinal Fissure (Center cleft) */}
          <line x1="100" y1="16" x2="100" y2="142" stroke="#1e293b" strokeWidth="2.5" />

          {/* Labels: Ki and Ka */}
          <rect x="58" y="70" width="22" height="20" rx="4" fill="#1e3a8a" />
          <text x="69" y="84" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
            Ki
          </text>

          <rect x="120" y="70" width="22" height="20" rx="4" fill="#065f46" />
          <text x="131" y="84" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
            Ka
          </text>
        </svg>
      </div>

      {/* Percentages and bars */}
      <div className="flex-1 w-full space-y-3">
        <div>
          <div className="flex justify-between items-center text-xs font-bold text-slate-900 mb-1">
            <span className="text-blue-900">Trend Dominasi Otak Kiri (Ki)</span>
            <span className="font-mono text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {leftDominance.toFixed(2)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${leftDominance}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center text-xs font-bold text-slate-900 mb-1">
            <span className="text-emerald-900">Trend Dominasi Otak Kanan (Ka)</span>
            <span className="font-mono text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {rightDominance.toFixed(2)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${rightDominance}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};
