import React from 'react';
import { EducationLevel } from '../types';

interface FiguralDiagramProps {
  questionId: number;
  optionLabel?: string; // If undefined, renders the prompt sequence or mirror object
  level?: EducationLevel;
  className?: string;
}

export const FiguralDiagram: React.FC<FiguralDiagramProps> = ({
  questionId,
  optionLabel,
  level = 'SMA',
  className = '',
}) => {
  // SMP Level Questions 31 - 40
  if (level === 'SMP') {
    if (!optionLabel) {
      // Prompt
      if (questionId >= 31 && questionId <= 33) {
        // Pencerminan: Show original shape on the left with a mirror line
        return (
          <div className={`p-4 bg-white rounded-xl border border-slate-200 shadow-xs inline-flex items-center gap-6 ${className}`}>
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-bold text-slate-500 mb-1">Bidang Asli</span>
              <div className="w-20 h-20 bg-slate-50 border-2 border-slate-300 rounded-lg flex items-center justify-center p-2">
                {renderSmpGraphic(questionId, 'prompt')}
              </div>
            </div>
            <div className="h-16 border-r-2 border-dashed border-indigo-400 flex items-center justify-center relative">
              <span className="absolute -top-3 text-[10px] font-mono text-indigo-600 bg-white px-1">Cermin</span>
            </div>
            <div className="text-xs text-slate-500 font-medium max-w-[140px]">
              Tentukan hasil bayangan cermin di pilihan A, B, C, atau D
            </div>
          </div>
        );
      } else if (questionId >= 34 && questionId <= 36) {
        // Mana yang berbeda? Prompt just invites user to examine options
        return (
          <div className={`p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 ${className}`}>
            Perhatikan keempat pilihan gambar berikut dan pilih satu gambar yang polanya <span className="font-bold text-indigo-700">berbeda</span> dari lainnya:
          </div>
        );
      } else {
        // 37 - 40: Pattern sequence (3 steps + ?)
        return (
          <div className={`p-4 bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto ${className}`}>
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Pola Urutan Soal #{questionId}</p>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 bg-slate-50 border-2 border-slate-300 rounded-lg flex items-center justify-center p-1.5">
                    {renderSmpGraphic(questionId, `step_${step}`)}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">Langkah {step}</span>
                </div>
              ))}
              <div className="text-slate-400 font-bold text-lg">➔</div>
              <div className="flex flex-col items-center">
                <div className="w-18 h-18 sm:w-20 sm:h-20 bg-indigo-50 border-2 border-dashed border-indigo-400 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xl">
                  ?
                </div>
                <span className="text-[10px] font-semibold text-indigo-600 mt-1">Pilihan</span>
              </div>
            </div>
          </div>
        );
      }
    }

    // Render SMP Option A - D
    return (
      <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-white border border-slate-300 rounded-lg flex items-center justify-center p-2 group-hover:border-indigo-500 ${className}`}>
        {renderSmpGraphic(questionId, `opt_${optionLabel}`)}
      </div>
    );
  }

  // SMA Level Questions 31 - 40
  if (!optionLabel) {
    return (
      <div className={`p-4 bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto ${className}`}>
        <p className="text-xs font-semibold text-slate-500 mb-3 tracking-wider uppercase">Deret Pola Soal #{questionId}</p>
        <div className="flex items-center gap-3">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 border-2 border-slate-300 rounded-lg flex items-center justify-center p-2 hover:border-indigo-400 transition">
                {renderSmaGraphic(questionId, `step_${step}`)}
              </div>
              <span className="text-[11px] font-medium text-slate-500 mt-1">Langkah {step}</span>
            </div>
          ))}
          <div className="text-slate-400 font-bold text-xl px-1">➔</div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-50/70 border-2 border-dashed border-indigo-400 rounded-lg flex items-center justify-center p-2 text-indigo-600 font-bold text-2xl">
              ?
            </div>
            <span className="text-[11px] font-semibold text-indigo-600 mt-1">Pilihan</span>
          </div>
        </div>
      </div>
    );
  }

  // Render SMA Option A - E
  return (
    <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-white border border-slate-300 rounded-lg flex items-center justify-center p-2 group-hover:border-indigo-500 ${className}`}>
      {renderSmaGraphic(questionId, `opt_${optionLabel}`)}
    </div>
  );
};

// =========================================================================
// SMP SVG GRAPHICS
// =========================================================================
function renderSmpGraphic(qId: number, key: string) {
  switch (qId) {
    case 31: {
      // Pentagon with 2 black dots (Mirror reflection)
      const mirror = key === 'opt_B'; // Correct mirror
      const isAlt1 = key === 'opt_A';
      const isAlt2 = key === 'opt_C';
      const isAlt3 = key === 'opt_D';
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <g transform={mirror ? 'scale(-1, 1) translate(-100, 0)' : ''}>
            <polygon points="25,20 70,20 85,55 55,85 25,60" fill="none" stroke="#0f172a" strokeWidth="4" />
            <circle cx={isAlt1 ? 40 : 45} cy={isAlt2 ? 45 : 35} r="6" fill="#0f172a" />
            <circle cx={isAlt3 ? 55 : 65} cy={isAlt1 ? 50 : 65} r="6" fill="#0f172a" />
          </g>
        </svg>
      );
    }
    case 32: {
      // Opposed double arrows (Mirror reflection)
      const isMirrored = key === 'opt_C';
      const flipY = key === 'opt_A';
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <g transform={`${isMirrored ? 'scale(-1, 1) translate(-100, 0)' : ''} ${flipY ? 'scale(1, -1) translate(0, -100)' : ''}`}>
            {/* Top arrow right */}
            <line x1="25" y1="35" x2="75" y2="35" stroke="#0f172a" strokeWidth="6" />
            <polygon points="75,25 90,35 75,45" fill="#0f172a" />
            {/* Bottom arrow left */}
            <line x1="75" y1="65" x2="25" y2="65" stroke="#0f172a" strokeWidth="6" />
            <polygon points="25,55 10,65 25,75" fill="#0f172a" />
          </g>
        </svg>
      );
    }
    case 33: {
      // Cylinder rod with 3 circles (Mirror reflection)
      const isCorrectMirror = key === 'opt_A';
      const isFlippedBoth = key === 'opt_D';
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <g transform={`${isCorrectMirror ? 'scale(-1, 1) translate(-100, 0)' : ''} ${isFlippedBoth ? 'rotate(180 50 50)' : ''}`}>
            <rect x="44" y="15" width="12" height="70" fill="none" stroke="#0f172a" strokeWidth="4" rx="3" />
            {/* Left circle */}
            <circle cx="28" cy="40" r="10" fill="#0f172a" />
            {/* Right circles */}
            <circle cx="72" cy="25" r="10" fill="#0f172a" />
            <circle cx="72" cy="65" r="10" fill="#0f172a" />
          </g>
        </svg>
      );
    }
    case 34: {
      // "Mana yang berbeda?" 4 clusters of dots
      const dotCounts: Record<string, number[]> = {
        opt_A: [3, 3, 3], // Total 9
        opt_B: [4, 4, 3], // Total 11 (Differs!)
        opt_C: [3, 3, 3], // Total 9
        opt_D: [3, 3, 3], // Total 9
      };
      const counts = dotCounts[key] || [3, 3, 3];
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="35" cy="35" r="6" fill="#0f172a" />
          <circle cx="50" cy="35" r="6" fill="#0f172a" />
          <circle cx="65" cy="35" r="6" fill="#0f172a" />
          <circle cx="35" cy="55" r="6" fill="#0f172a" />
          <circle cx="50" cy="55" r="6" fill="#0f172a" />
          <circle cx="65" cy="55" r="6" fill="#0f172a" />
          {counts[1] === 4 && <circle cx="50" cy="72" r="6" fill="#ef4444" />}
          <circle cx="35" cy="72" r="6" fill="#0f172a" />
          <circle cx="65" cy="72" r="6" fill="#0f172a" />
        </svg>
      );
    }
    case 35: {
      // "Mana yang berbeda?" 4 square frames with corner triangles
      const rot = key === 'opt_C' ? 45 : key === 'opt_B' ? 90 : key === 'opt_D' ? 180 : 0;
      const isOdd = key === 'opt_C';
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="20" y="20" width="60" height="60" fill="none" stroke="#0f172a" strokeWidth="4" />
          <g transform={`rotate(${rot} 50 50)`}>
            <polygon points="20,20 50,20 50,50" fill={isOdd ? '#ef4444' : '#0f172a'} />
            <polygon points="50,50 80,80 50,80" fill={isOdd ? '#ef4444' : '#0f172a'} />
          </g>
        </svg>
      );
    }
    case 36: {
      // "Mana yang berbeda?" Stacked shapes
      const isDiff = key === 'opt_A';
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {isDiff ? (
            <g fill="#0f172a">
              <circle cx="50" cy="25" r="7" />
              <circle cx="50" cy="50" r="10" />
              <circle cx="50" cy="75" r="13" />
            </g>
          ) : (
            <g fill="#0f172a">
              <polygon points="50,20 40,35 60,35" />
              <polygon points="50,40 32,60 68,60" />
              <polygon points="50,65 24,85 76,85" />
            </g>
          )}
        </svg>
      );
    }
    case 37: {
      // Rotating quadrant shading in circle
      const angles: Record<string, number> = {
        step_1: 0, step_2: 90, step_3: 180, step_4: 270,
        opt_A: 180, opt_B: 0, opt_C: 90, opt_D: 270,
      };
      const deg = angles[key] ?? 0;
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="38" fill="none" stroke="#0f172a" strokeWidth="4" />
          <g transform={`rotate(${deg} 50 50)`}>
            <path d="M50,50 L50,12 A38,38 0 0,1 88,50 Z" fill="#0f172a" />
          </g>
        </svg>
      );
    }
    case 38: {
      // Circle with diagonal line and rotating black half
      const angles: Record<string, number> = {
        step_1: 45, step_2: 135, step_3: 225, step_4: 315,
        opt_A: 45, opt_B: 135, opt_C: 225, opt_D: 0,
      };
      const deg = angles[key] ?? 45;
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <g transform={`rotate(${deg} 50 50)`}>
            <circle cx="50" cy="50" r="38" fill="none" stroke="#0f172a" strokeWidth="4" />
            <path d="M12,50 A38,38 0 0,1 88,50 Z" fill="#0f172a" />
            <line x1="50" y1="12" x2="50" y2="88" stroke="#0f172a" strokeWidth="4" />
          </g>
        </svg>
      );
    }
    case 39: {
      // Shifting black quarter
      const quads: Record<string, number> = {
        step_1: 0, step_2: 90, step_3: 180, step_4: 270,
        opt_A: 0, opt_B: 90, opt_C: 180, opt_D: 270,
      };
      const deg = quads[key] ?? 0;
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="15" y="15" width="70" height="70" fill="none" stroke="#0f172a" strokeWidth="4" />
          <g transform={`rotate(${deg} 50 50)`}>
            <rect x="50" y="15" width="35" height="35" fill="#0f172a" />
          </g>
        </svg>
      );
    }
    case 40: {
      // Circle with inner triangle and moving dot
      const dotAngles: Record<string, number> = {
        step_1: 0, step_2: 90, step_3: 180, step_4: 270,
        opt_A: 0, opt_B: 90, opt_C: 180, opt_D: 270,
      };
      const dDeg = dotAngles[key] ?? 0;
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="38" fill="none" stroke="#0f172a" strokeWidth="4" />
          <polygon points="50,22 74,68 26,68" fill="none" stroke="#0f172a" strokeWidth="3" />
          <g transform={`rotate(${dDeg} 50 50)`}>
            <circle cx="50" cy="22" r="5" fill="#2563eb" />
          </g>
        </svg>
      );
    }
    default:
      return null;
  }
}

// =========================================================================
// SMA SVG GRAPHICS
// =========================================================================
function renderSmaGraphic(qId: number, key: string) {
  switch (qId) {
    case 31: {
      const angles: Record<string, number> = {
        step_1: 0, step_2: 45, step_3: 90, step_4: 135,
        opt_A: 180, opt_B: 180, opt_C: 225, opt_D: 270, opt_E: 315,
      };
      const angle = angles[key] ?? 0;
      const isAltCross = key === 'opt_B' || key === 'step_4';
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <g transform={`rotate(${angle} 50 50)`}>
            <line x1="50" y1="85" x2="50" y2="20" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
            <polygon points="50,10 38,28 62,28" fill="#1e293b" />
            <line x1="25" y1="50" x2="75" y2="50" stroke={isAltCross ? '#dc2626' : '#1e293b'} strokeWidth="4" />
            <polygon points="75,50 68,45 68,55" fill={isAltCross ? '#dc2626' : '#1e293b'} />
          </g>
        </svg>
      );
    }
    case 32: {
      const map: Record<string, { outer: string; inner: string }> = {
        step_1: { outer: 'rect', inner: 'poly' },
        step_2: { outer: 'trap', inner: 'circle' },
        step_3: { outer: 'hex', inner: 'triangle' },
        step_4: { outer: 'octa', inner: 'circle' },
        opt_A: { outer: 'dec', inner: 'square' },
        opt_B: { outer: 'dec', inner: 'triangle' },
        opt_C: { outer: 'hex', inner: 'rect' },
        opt_D: { outer: 'octa', inner: 'poly' },
        opt_E: { outer: 'trap', inner: 'circle' },
      };
      const item = map[key] || { outer: 'rect', inner: 'circle' };
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {item.outer === 'rect' && <rect x="20" y="20" width="60" height="60" fill="none" stroke="#0f172a" strokeWidth="4" />}
          {item.outer === 'trap' && <polygon points="20,25 80,25 70,80 30,80" fill="none" stroke="#0f172a" strokeWidth="4" />}
          {item.outer === 'hex' && <polygon points="50,15 82,32 82,68 50,85 18,68 18,32" fill="none" stroke="#0f172a" strokeWidth="4" />}
          {item.outer === 'octa' && <polygon points="35,15 65,15 85,35 85,65 65,85 35,85 15,65 15,35" fill="none" stroke="#0f172a" strokeWidth="4" />}
          {item.outer === 'dec' && <circle cx="50" cy="50" r="36" fill="none" stroke="#0f172a" strokeWidth="4" />}

          {item.inner === 'poly' && <polygon points="40,40 60,40 65,60 35,60" fill="#0f172a" />}
          {item.inner === 'circle' && <circle cx="50" cy="50" r="14" fill="#0f172a" />}
          {item.inner === 'triangle' && <polygon points="50,34 65,64 35,64" fill="#0f172a" />}
          {item.inner === 'square' && <rect x="38" y="38" width="24" height="24" fill="#0f172a" />}
          {item.inner === 'rect' && <rect x="36" y="42" width="28" height="16" fill="#0f172a" />}
        </svg>
      );
    }
    case 33: {
      const dotCount: Record<string, number> = {
        step_1: 1, step_2: 2, step_3: 3, step_4: 4,
        opt_A: 4, opt_B: 5, opt_C: 5, opt_D: 6, opt_E: 7,
      };
      const angleMap: Record<string, number> = {
        step_1: 0, step_2: 60, step_3: 120, step_4: 180,
        opt_A: 200, opt_B: 220, opt_C: 240, opt_D: 270, opt_E: 300,
      };
      const count = dotCount[key] ?? 3;
      const deg = angleMap[key] ?? 0;
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="15" y="15" width="70" height="70" fill="none" stroke="#0f172a" strokeWidth="3" rx="4" />
          <circle cx="50" cy="50" r="4" fill="#0f172a" />
          <g transform={`rotate(${deg} 50 50)`}>
            <line x1="50" y1="50" x2="50" y2="25" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="22" r="3" fill="#0f172a" />
          </g>
          <g>
            {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
              <circle key={i} cx={25 + i * 10} cy="76" r="3.5" fill="#2563eb" />
            ))}
          </g>
        </svg>
      );
    }
    case 34: {
      const rotMap: Record<string, number> = {
        step_1: 0, step_2: 90, step_3: 180, step_4: 270,
        opt_A: 0, opt_B: 90, opt_C: 180, opt_D: 360, opt_E: 45,
      };
      const rot = rotMap[key] ?? 0;
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="36" fill="none" stroke="#0f172a" strokeWidth="3" strokeDasharray="3 3" />
          <g transform={`rotate(${rot} 50 50)`}>
            <circle cx="50" cy="50" r="8" fill="#0f172a" />
            <polygon points="50,18 53,26 61,26 55,31 57,39 50,34 43,39 45,31 39,26 47,26" fill="#f59e0b" />
            <circle cx="80" cy="50" r="6" fill="#ef4444" />
            <polygon points="50,75 58,82 50,89 42,82" fill="#10b981" />
            <rect x="16" y="44" width="12" height="12" fill="#6366f1" />
          </g>
        </svg>
      );
    }
    case 35: {
      const levels: Record<string, number> = {
        step_1: 1, step_2: 2, step_3: 3, step_4: 4,
        opt_A: 3, opt_B: 4, opt_C: 5, opt_D: 6, opt_E: 2,
      };
      const lvl = levels[key] ?? 3;
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="15" y="15" width="70" height="70" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          {lvl >= 1 && <line x1="25" y1="75" x2="75" y2="75" stroke="#0f172a" strokeWidth="4" />}
          {lvl >= 2 && <line x1="25" y1="75" x2="25" y2="40" stroke="#0f172a" strokeWidth="4" />}
          {lvl >= 3 && <line x1="75" y1="75" x2="75" y2="40" stroke="#0f172a" strokeWidth="4" />}
          {lvl >= 4 && <line x1="25" y1="40" x2="50" y2="40" stroke="#0f172a" strokeWidth="4" />}
          {lvl >= 5 && <line x1="50" y1="40" x2="75" y2="40" stroke="#0f172a" strokeWidth="4" />}
          {lvl >= 6 && <line x1="50" y1="40" x2="50" y2="60" stroke="#2563eb" strokeWidth="4" />}
        </svg>
      );
    }
    case 36: {
      const posMap: Record<string, { x: number; y: number; r: number }> = {
        step_1: { x: 25, y: 25, r: 0 },
        step_2: { x: 75, y: 25, r: 90 },
        step_3: { x: 75, y: 75, r: 180 },
        step_4: { x: 25, y: 75, r: 270 },
        opt_A: { x: 75, y: 25, r: 90 },
        opt_B: { x: 25, y: 25, r: 0 },
        opt_C: { x: 50, y: 50, r: 45 },
        opt_D: { x: 75, y: 75, r: 180 },
        opt_E: { x: 25, y: 75, r: 270 },
      };
      const p = posMap[key] || { x: 25, y: 25, r: 0 };
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="18" y="18" width="64" height="64" fill="none" stroke="#0f172a" strokeWidth="3" />
          <g transform={`translate(${p.x}, ${p.y}) rotate(${p.r})`}>
            <path d="M-8,-8 L8,-8 L8,0 L0,0 L0,8 L-8,8 Z" fill="#2563eb" />
          </g>
        </svg>
      );
    }
    case 37: {
      const tabs: Record<string, string[]> = {
        step_1: ['top'],
        step_2: ['top', 'right'],
        step_3: ['top', 'right', 'bottom'],
        step_4: ['top', 'right', 'bottom', 'left'],
        opt_A: ['top', 'bottom'],
        opt_B: ['left', 'right'],
        opt_C: ['top', 'right', 'bottom'],
        opt_D: ['top', 'right', 'bottom', 'left', 'corner'],
        opt_E: ['none'],
      };
      const t = tabs[key] || ['top'];
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="28" y="28" width="44" height="44" fill="none" stroke="#0f172a" strokeWidth="3" />
          {t.includes('top') && <circle cx="50" cy="28" r="7" fill="#0f172a" />}
          {t.includes('right') && <circle cx="72" cy="50" r="7" fill="#0f172a" />}
          {t.includes('bottom') && <circle cx="50" cy="72" r="7" fill="#0f172a" />}
          {t.includes('left') && <circle cx="28" cy="50" r="7" fill="#0f172a" />}
          {t.includes('corner') && <circle cx="28" cy="28" r="6" fill="#3b82f6" />}
        </svg>
      );
    }
    case 38: {
      const conf: Record<string, { balls: number; lines: number }> = {
        step_1: { balls: 1, lines: 4 },
        step_2: { balls: 2, lines: 3 },
        step_3: { balls: 3, lines: 2 },
        step_4: { balls: 4, lines: 1 },
        opt_A: { balls: 5, lines: 0 },
        opt_B: { balls: 4, lines: 2 },
        opt_C: { balls: 3, lines: 3 },
        opt_D: { balls: 2, lines: 4 },
        opt_E: { balls: 5, lines: 2 },
      };
      const c = conf[key] || { balls: 1, lines: 4 };
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="35" y="15" width="30" height="70" fill="none" stroke="#0f172a" strokeWidth="3" rx="2" />
          {Array.from({ length: c.balls }).map((_, i) => (
            <circle key={i} cx="50" cy={23 + i * 9} r="3.5" fill="#0f172a" />
          ))}
          {Array.from({ length: c.lines }).map((_, i) => (
            <line key={i} x1="38" y1={80 - i * 8} x2="62" y2={80 - i * 8} stroke="#2563eb" strokeWidth="2.5" />
          ))}
        </svg>
      );
    }
    case 39: {
      const funnelMap: Record<string, { corner: 'tl' | 'tr' | 'br' | 'bl'; fillFunnel: boolean }> = {
        step_1: { corner: 'bl', fillFunnel: false },
        step_2: { corner: 'tl', fillFunnel: false },
        step_3: { corner: 'tr', fillFunnel: true },
        step_4: { corner: 'br', fillFunnel: true },
        opt_A: { corner: 'tl', fillFunnel: true },
        opt_B: { corner: 'bl', fillFunnel: true },
        opt_C: { corner: 'tl', fillFunnel: false },
        opt_D: { corner: 'tr', fillFunnel: false },
        opt_E: { corner: 'br', fillFunnel: false },
      };
      const f = funnelMap[key] || { corner: 'bl', fillFunnel: false };
      const dotCoords = {
        tl: { x: 26, y: 26 },
        tr: { x: 74, y: 26 },
        br: { x: 74, y: 74 },
        bl: { x: 26, y: 74 },
      }[f.corner];
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="20" y="15" width="60" height="70" fill="none" stroke="#0f172a" strokeWidth="3" />
          <polygon
            points="35,30 65,30 55,55 55,70 45,70 45,55"
            fill={f.fillFunnel ? '#0f172a' : 'none'}
            stroke="#0f172a"
            strokeWidth="2.5"
          />
          <circle cx={dotCoords.x} cy={dotCoords.y} r="4" fill="#2563eb" />
        </svg>
      );
    }
    case 40: {
      const shMap: Record<string, string> = {
        step_1: 'circle',
        step_2: 'square',
        step_3: 'diamond',
        step_4: 'triangle',
        opt_A: 'inverted_trap',
        opt_B: 'hexagon',
        opt_C: 'star',
        opt_D: 'oval',
        opt_E: 'pentagon',
      };
      const shape = shMap[key] || 'circle';
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {shape === 'circle' && (
            <g fill="none" stroke="#0f172a">
              <circle cx="50" cy="50" r="38" strokeWidth="8" />
              <circle cx="50" cy="50" r="16" fill="#0f172a" />
            </g>
          )}
          {shape === 'square' && (
            <g fill="none" stroke="#0f172a">
              <rect x="18" y="18" width="64" height="64" strokeWidth="8" />
              <rect x="36" y="36" width="28" height="28" fill="#0f172a" />
            </g>
          )}
          {shape === 'diamond' && (
            <g fill="none" stroke="#0f172a">
              <polygon points="50,14 86,50 50,86 14,50" strokeWidth="8" />
              <polygon points="50,34 66,50 50,66 34,50" fill="#0f172a" />
            </g>
          )}
          {shape === 'triangle' && (
            <g fill="none" stroke="#0f172a">
              <polygon points="50,16 88,80 12,80" strokeWidth="8" />
              <polygon points="50,44 68,74 32,74" fill="#0f172a" />
            </g>
          )}
          {shape === 'inverted_trap' && (
            <g fill="none" stroke="#0f172a">
              <polygon points="16,22 84,22 68,80 32,80" strokeWidth="8" />
              <polygon points="32,38 68,38 58,68 42,68" fill="#0f172a" />
            </g>
          )}
          {shape === 'hexagon' && (
            <g fill="none" stroke="#0f172a">
              <polygon points="50,16 84,32 84,68 50,84 16,68 16,32" strokeWidth="7" />
              <polygon points="50,34 66,42 66,58 50,66 34,58 34,42" fill="#0f172a" />
            </g>
          )}
          {shape === 'star' && (
            <g fill="#0f172a">
              <polygon points="50,15 60,38 85,38 64,52 72,76 50,60 28,76 36,52 15,38 40,38" />
            </g>
          )}
          {shape === 'oval' && (
            <g fill="none" stroke="#0f172a">
              <ellipse cx="50" cy="50" rx="36" ry="24" strokeWidth="8" />
              <ellipse cx="50" cy="50" rx="18" ry="12" fill="#0f172a" />
            </g>
          )}
          {shape === 'pentagon' && (
            <g fill="none" stroke="#0f172a">
              <polygon points="50,15 85,40 70,80 30,80 15,40" strokeWidth="7" />
              <polygon points="50,35 68,48 60,70 40,70 32,48" fill="#0f172a" />
            </g>
          )}
        </svg>
      );
    }
    default:
      return null;
  }
}
