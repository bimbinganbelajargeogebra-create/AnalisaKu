import { TestResult } from '../types';

/**
 * Renders an anatomical lateral-view brain with 4 colored lobes and leader lines
 * to a high-resolution PNG Data URL for embedding into jsPDF and PDF reports.
 */
export function generateBrainLobeImageDataUrl(brainAnalysis: TestResult['brainAnalysis']): string {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  // High resolution for 300dpi crisp PDF rendering
  canvas.width = 900;
  canvas.height = 540;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background transparent or white
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const frontalPct = brainAnalysis?.frontalLobe ? brainAnalysis.frontalLobe.toFixed(2) : '0.00';
  const parietalPct = brainAnalysis?.parietalLobe ? brainAnalysis.parietalLobe.toFixed(2) : '0.00';
  const occipitalPct = brainAnalysis?.occipitalLobe ? brainAnalysis.occipitalLobe.toFixed(2) : '0.00';
  const temporalPct = brainAnalysis?.temporalLobe ? brainAnalysis.temporalLobe.toFixed(2) : '0.00';

  // Base coordinate offsets
  const ox = 40;
  const oy = 25;
  const scale = 1.8;

  ctx.save();
  ctx.translate(ox, oy);

  // 1. Brainstem (Pons & Medulla)
  ctx.beginPath();
  ctx.moveTo(175 * scale, 200 * scale);
  ctx.bezierCurveTo(172 * scale, 225 * scale, 178 * scale, 255 * scale, 185 * scale, 275 * scale);
  ctx.bezierCurveTo(198 * scale, 275 * scale, 205 * scale, 273 * scale, 205 * scale, 270 * scale);
  ctx.bezierCurveTo(200 * scale, 245 * scale, 198 * scale, 220 * scale, 196 * scale, 198 * scale);
  ctx.closePath();
  ctx.fillStyle = '#94a3b8';
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2.5 * scale;
  ctx.stroke();

  // Brainstem folds
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.moveTo(178 * scale, 225 * scale);
  ctx.quadraticCurveTo(188 * scale, 230 * scale, 198 * scale, 226 * scale);
  ctx.stroke();

  // 2. Cerebellum (Otak Kecil)
  ctx.beginPath();
  ctx.moveTo(215 * scale, 185 * scale);
  ctx.bezierCurveTo(235 * scale, 188 * scale, 265 * scale, 195 * scale, 272 * scale, 215 * scale);
  ctx.bezierCurveTo(275 * scale, 235 * scale, 258 * scale, 255 * scale, 235 * scale, 258 * scale);
  ctx.bezierCurveTo(210 * scale, 260 * scale, 190 * scale, 245 * scale, 186 * scale, 225 * scale);
  ctx.bezierCurveTo(185 * scale, 210 * scale, 195 * scale, 190 * scale, 215 * scale, 185 * scale);
  ctx.closePath();
  ctx.fillStyle = '#fb923c';
  ctx.fill();
  ctx.strokeStyle = '#ea580c';
  ctx.lineWidth = 2.5 * scale;
  ctx.stroke();

  // Cerebellum folia lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = 1.6 * scale;
  [
    [205, 205, 235, 200, 255, 210],
    [198, 220, 230, 215, 260, 225],
    [200, 235, 225, 230, 250, 240],
    [210, 248, 230, 245, 240, 250],
  ].forEach(([x1, y1, qx, qy, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1 * scale, y1 * scale);
    ctx.quadraticCurveTo(qx * scale, qy * scale, x2 * scale, y2 * scale);
    ctx.stroke();
  });

  // 3. FRONTAL LOBE (Anterior / Merah Muda - Rose)
  ctx.beginPath();
  ctx.moveTo(85 * scale, 150 * scale);
  ctx.bezierCurveTo(60 * scale, 135 * scale, 50 * scale, 110 * scale, 58 * scale, 85 * scale);
  ctx.bezierCurveTo(65 * scale, 60 * scale, 85 * scale, 35 * scale, 125 * scale, 25 * scale);
  ctx.bezierCurveTo(165 * scale, 16 * scale, 195 * scale, 28 * scale, 215 * scale, 45 * scale);
  ctx.bezierCurveTo(210 * scale, 75 * scale, 195 * scale, 105 * scale, 185 * scale, 135 * scale);
  ctx.bezierCurveTo(155 * scale, 142 * scale, 125 * scale, 148 * scale, 85 * scale, 150 * scale);
  ctx.closePath();
  ctx.fillStyle = '#f43f5e';
  ctx.fill();
  ctx.strokeStyle = '#e11d48';
  ctx.lineWidth = 2.5 * scale;
  ctx.stroke();

  // Frontal Gyri
  ctx.strokeStyle = 'rgba(255, 228, 230, 0.85)';
  ctx.lineWidth = 2.0 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(75 * scale, 70 * scale);
  ctx.quadraticCurveTo(110 * scale, 65 * scale, 140 * scale, 75 * scale);
  ctx.quadraticCurveTo(170 * scale, 80 * scale, 185 * scale, 60 * scale);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(85 * scale, 105 * scale);
  ctx.quadraticCurveTo(120 * scale, 95 * scale, 155 * scale, 105 * scale);
  ctx.quadraticCurveTo(175 * scale, 100 * scale, 185 * scale, 115 * scale);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(105 * scale, 128 * scale);
  ctx.quadraticCurveTo(135 * scale, 120 * scale, 160 * scale, 130 * scale);
  ctx.stroke();

  // 4. PARIETAL LOBE (Superior Posterior / Kuning - Amber)
  ctx.beginPath();
  ctx.moveTo(215 * scale, 45 * scale);
  ctx.bezierCurveTo(240 * scale, 48 * scale, 268 * scale, 60 * scale, 285 * scale, 80 * scale);
  ctx.bezierCurveTo(298 * scale, 95 * scale, 305 * scale, 115 * scale, 302 * scale, 135 * scale);
  ctx.bezierCurveTo(285 * scale, 138 * scale, 255 * scale, 142 * scale, 235 * scale, 145 * scale);
  ctx.bezierCurveTo(205 * scale, 142 * scale, 195 * scale, 125 * scale, 185 * scale, 135 * scale);
  ctx.bezierCurveTo(195 * scale, 105 * scale, 210 * scale, 75 * scale, 215 * scale, 45 * scale);
  ctx.closePath();
  ctx.fillStyle = '#eab308';
  ctx.fill();
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 2.5 * scale;
  ctx.stroke();

  // Parietal Gyri
  ctx.strokeStyle = 'rgba(254, 249, 195, 0.85)';
  ctx.beginPath();
  ctx.moveTo(225 * scale, 65 * scale);
  ctx.quadraticCurveTo(255 * scale, 75 * scale, 285 * scale, 95 * scale);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(215 * scale, 95 * scale);
  ctx.quadraticCurveTo(245 * scale, 100 * scale, 275 * scale, 115 * scale);
  ctx.stroke();

  // 5. OCCIPITAL LOBE (Posterior / Hijau - Emerald)
  ctx.beginPath();
  ctx.moveTo(302 * scale, 135 * scale);
  ctx.bezierCurveTo(318 * scale, 150 * scale, 318 * scale, 175 * scale, 305 * scale, 195 * scale);
  ctx.bezierCurveTo(295 * scale, 208 * scale, 275 * scale, 215 * scale, 255 * scale, 210 * scale);
  ctx.bezierCurveTo(248 * scale, 185 * scale, 240 * scale, 165 * scale, 235 * scale, 145 * scale);
  ctx.bezierCurveTo(255 * scale, 142 * scale, 285 * scale, 138 * scale, 302 * scale, 135 * scale);
  ctx.closePath();
  ctx.fillStyle = '#10b981';
  ctx.fill();
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 2.5 * scale;
  ctx.stroke();

  // Occipital Gyri
  ctx.strokeStyle = 'rgba(209, 250, 229, 0.85)';
  ctx.beginPath();
  ctx.moveTo(255 * scale, 160 * scale);
  ctx.quadraticCurveTo(280 * scale, 165 * scale, 305 * scale, 155 * scale);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(250 * scale, 180 * scale);
  ctx.quadraticCurveTo(275 * scale, 185 * scale, 295 * scale, 178 * scale);
  ctx.stroke();

  // 6. TEMPORAL LOBE (Inferior Lateral / Ungu - Violet)
  ctx.beginPath();
  ctx.moveTo(85 * scale, 150 * scale);
  ctx.bezierCurveTo(125 * scale, 148 * scale, 155 * scale, 142 * scale, 185 * scale, 135 * scale);
  ctx.bezierCurveTo(195 * scale, 125 * scale, 205 * scale, 142 * scale, 235 * scale, 145 * scale);
  ctx.bezierCurveTo(240 * scale, 165 * scale, 248 * scale, 185 * scale, 220 * scale, 188 * scale);
  ctx.bezierCurveTo(190 * scale, 192 * scale, 165 * scale, 190 * scale, 145 * scale, 188 * scale);
  ctx.bezierCurveTo(115 * scale, 185 * scale, 95 * scale, 175 * scale, 85 * scale, 150 * scale);
  ctx.closePath();
  ctx.fillStyle = '#8b5cf6';
  ctx.fill();
  ctx.strokeStyle = '#7c3aed';
  ctx.lineWidth = 2.5 * scale;
  ctx.stroke();

  // Temporal Gyri
  ctx.strokeStyle = 'rgba(237, 233, 254, 0.85)';
  ctx.beginPath();
  ctx.moveTo(105 * scale, 158 * scale);
  ctx.quadraticCurveTo(145 * scale, 155 * scale, 185 * scale, 150 * scale);
  ctx.quadraticCurveTo(215 * scale, 155 * scale, 228 * scale, 165 * scale);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(120 * scale, 172 * scale);
  ctx.quadraticCurveTo(160 * scale, 168 * scale, 195 * scale, 165 * scale);
  ctx.stroke();

  // 7. LEADER LINES AND CALLOUT LABELS
  const drawLeader = (x1: number, y1: number, x2: number, y2: number, x3: number, strokeColor: string) => {
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(x1 * scale, y1 * scale);
    ctx.lineTo(x2 * scale, y2 * scale);
    ctx.lineTo(x3 * scale, y2 * scale);
    ctx.stroke();

    // Circle anchor on lobe
    ctx.setLineDash([]);
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(x1 * scale, y1 * scale, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const textStartX = 325 * scale;

  // Frontal Leader
  drawLeader(135, 70, 260, 42, 320, '#e11d48');
  // Parietal Leader
  drawLeader(245, 85, 290, 78, 320, '#ca8a04');
  // Occipital Leader
  drawLeader(275, 170, 305, 120, 320, '#059669');
  // Temporal Leader
  drawLeader(155, 165, 220, 162, 320, '#7c3aed');

  // Text Rendering (Callouts with percentages)
  ctx.textBaseline = 'middle';

  // Frontal
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillStyle = '#be123c';
  ctx.fillText('Frontal lobe', textStartX, 42 * scale);
  ctx.font = 'bold 21px Courier, monospace';
  ctx.fillStyle = '#881337';
  ctx.fillText(`(${frontalPct}%)`, textStartX + 145, 42 * scale);

  // Parietal
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillStyle = '#a16207';
  ctx.fillText('Parietal lobe', textStartX, 78 * scale);
  ctx.font = 'bold 21px Courier, monospace';
  ctx.fillStyle = '#713f12';
  ctx.fillText(`(${parietalPct}%)`, textStartX + 145, 78 * scale);

  // Occipital
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillStyle = '#047857';
  ctx.fillText('Occipital lobe', textStartX, 120 * scale);
  ctx.font = 'bold 21px Courier, monospace';
  ctx.fillStyle = '#064e3b';
  ctx.fillText(`(${occipitalPct}%)`, textStartX + 155, 120 * scale);

  // Temporal
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillStyle = '#6d28d9';
  ctx.fillText('Temporal lobe', textStartX, 162 * scale);
  ctx.font = 'bold 21px Courier, monospace';
  ctx.fillStyle = '#4c1d95';
  ctx.fillText(`(${temporalPct}%)`, textStartX + 158, 162 * scale);

  ctx.restore();

  return canvas.toDataURL('image/png');
}

/**
 * Renders the top-down view of Left Brain (Ki) and Right Brain (Ka)
 * to a high-resolution PNG Data URL for Page 2 of the PDF report.
 */
export function generateHemispheresImageDataUrl(leftPct: number, rightPct: number): string {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = 300;
  const cy = 150;
  const s = 1.6;

  ctx.save();

  // Shadow
  ctx.fillStyle = 'rgba(226, 232, 240, 0.8)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 105, 120, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Left Hemisphere (Ki) - Blue
  ctx.beginPath();
  ctx.moveTo(cx - 5, cy - 100);
  ctx.bezierCurveTo(cx - 55 * s, cy - 100, cx - 110 * s, cy - 60, cx - 115 * s, cy);
  ctx.bezierCurveTo(cx - 120 * s, cy + 60, cx - 65 * s, cy + 100, cx - 5, cy + 105);
  ctx.closePath();
  ctx.fillStyle = '#3b82f6';
  ctx.fill();
  ctx.strokeStyle = '#1d4ed8';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Left Gyri
  ctx.strokeStyle = '#93c5fd';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 90, cy - 40);
  ctx.quadraticCurveTo(cx - 50, cy - 50, cx - 25, cy - 30);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - 105, cy + 10);
  ctx.quadraticCurveTo(cx - 60, cy, cx - 20, cy + 20);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - 85, cy + 60);
  ctx.quadraticCurveTo(cx - 50, cy + 50, cx - 25, cy + 70);
  ctx.stroke();

  // Right Hemisphere (Ka) - Green
  ctx.beginPath();
  ctx.moveTo(cx + 5, cy - 100);
  ctx.bezierCurveTo(cx + 55 * s, cy - 100, cx + 110 * s, cy - 60, cx + 115 * s, cy);
  ctx.bezierCurveTo(cx + 120 * s, cy + 60, cx + 65 * s, cy + 100, cx + 5, cy + 105);
  ctx.closePath();
  ctx.fillStyle = '#10b981';
  ctx.fill();
  ctx.strokeStyle = '#047857';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Right Gyri
  ctx.strokeStyle = '#a7f3d0';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx + 90, cy - 40);
  ctx.quadraticCurveTo(cx + 50, cy - 50, cx + 25, cy - 30);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + 105, cy + 10);
  ctx.quadraticCurveTo(cx + 60, cy, cx + 20, cy + 20);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + 85, cy + 60);
  ctx.quadraticCurveTo(cx + 50, cy + 50, cx + 25, cy + 70);
  ctx.stroke();

  // Central Fissure
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 110);
  ctx.lineTo(cx, cy + 115);
  ctx.stroke();

  // Ki and Ka badges
  ctx.fillStyle = '#1e3a8a';
  ctx.beginPath();
  ctx.roundRect(cx - 75, cy - 18, 36, 36, 8);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Ki', cx - 57, cy);

  ctx.fillStyle = '#065f46';
  ctx.beginPath();
  ctx.roundRect(cx + 40, cy - 18, 36, 36, 8);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Ka', cx + 58, cy);

  ctx.restore();

  return canvas.toDataURL('image/png');
}
