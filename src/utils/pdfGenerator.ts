import { jsPDF } from 'jspdf';
import { InstitutionSettings, TestResult } from '../types';
import {
  generateBrainLobeImageDataUrl,
  generateHemispheresImageDataUrl,
} from './brainDrawHelper';

export function generateDiagnosticPdf(result: TestResult, institution: InstitutionSettings): jsPDF {
  const isSmp = result.educationLevel === 'SMP';
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // -------------------------------------------------------------
  // PAGE 1 (Identical structure for SMP & SMA)
  // -------------------------------------------------------------
  drawHeader(doc, 1, institution, isSmp ? 'SMP / MTs' : 'SMA / MA');

  // Student Identity Box
  let y = 26;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  doc.text('Nomor Registrasi :', margin + 6, y + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.text(result.regNumber || '-', margin + 38, y + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Nama Siswa :', margin + 6, y + 10.5);
  doc.setFont('helvetica', 'normal');
  doc.text(result.fullName || '-', margin + 38, y + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Jenjang / Kelas :', margin + 6, y + 15.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${result.educationLevel || 'SMA'} - ${result.grade || ''}`, margin + 38, y + 15.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Asal Sekolah :', margin + 98, y + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.text(result.schoolOrigin || '-', margin + 125, y + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Tanggal Tes :', margin + 98, y + 10.5);
  doc.setFont('helvetica', 'normal');
  const testDate = result.evaluatedAt ? new Date(result.evaluatedAt).toLocaleDateString('id-ID') : '-';
  doc.text(testDate, margin + 125, y + 10.5);

  // Intelegensia Umum (IQ)
  y += 25;
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, y, contentWidth, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Intelegensia Umum (IQ)', margin + 3, y + 3.6);

  y += 5;
  const iqCategories = [
    { label: 'Di bawah rata-rata', range: '(<85)', min: 0, max: 84 },
    { label: 'Normal Bawah', range: '(85-99)', min: 85, max: 99 },
    { label: 'Normal', range: '(100-110)', min: 100, max: 110 },
    { label: 'Normal Atas', range: '(111-120)', min: 111, max: 120 },
    { label: 'Superior', range: '(121-139)', min: 121, max: 139 },
    { label: 'Di Atas Superior', range: '(140-170)', min: 140, max: 170 },
    { label: 'Jenius', range: '(>170)', min: 171, max: 200 },
  ];

  const colWidth = contentWidth / iqCategories.length;
  doc.setFontSize(6);
  doc.setTextColor(15, 23, 42);

  iqCategories.forEach((cat, idx) => {
    const colX = margin + idx * colWidth;
    const isSelected = result.iqScore >= cat.min && result.iqScore <= cat.max;

    doc.setFillColor(isSelected ? 238 : 241, isSelected ? 242 : 245, isSelected ? 255 : 249);
    doc.setDrawColor(203, 213, 225);
    doc.rect(colX, y, colWidth, 8, 'FD');

    doc.setFont('helvetica', isSelected ? 'bold' : 'normal');
    const splitLabel = doc.splitTextToSize(cat.label, colWidth - 2);
    doc.text(splitLabel, colX + colWidth / 2, y + 2.8, { align: 'center' });
    doc.text(cat.range, colX + colWidth / 2, y + 6.8, { align: 'center' });

    doc.setFillColor(isSelected ? 30 : 255, isSelected ? 58 : 255, isSelected ? 138 : 255);
    doc.rect(colX, y + 8, colWidth, 5.5, 'FD');
    if (isSelected) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(String(result.iqScore), colX + colWidth / 2, y + 12, { align: 'center' });
    }
  });

  // Distribusi Kecerdasan Majemuk
  y += 16;
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, y, contentWidth, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Distribusi Kecerdasan Majemuk', margin + 3, y + 3.6);

  y += 6.5;
  const miList = [
    { key: 'logikaMatematika', label: 'Logika Matematika', val: result.multipleIntelligences.logikaMatematika },
    { key: 'bahasa', label: 'Bahasa', val: result.multipleIntelligences.bahasa },
    { key: 'intrapersonal', label: 'Intrapersonal', val: result.multipleIntelligences.intrapersonal },
    { key: 'interpersonal', label: 'Interpersonal', val: result.multipleIntelligences.interpersonal },
    { key: 'kinestetis', label: 'Kinestetis', val: result.multipleIntelligences.kinestetis },
    { key: 'visualRuang', label: 'Visual Ruang', val: result.multipleIntelligences.visualRuang },
    { key: 'musikal', label: 'Musikal', val: result.multipleIntelligences.musikal },
    { key: 'naturalis', label: 'Naturalis', val: result.multipleIntelligences.naturalis },
  ];

  const miDescriptions: Record<string, string> = {
    logikaMatematika: 'Kemampuan untuk mengenali bentuk atau pola, memahami simbol abstrak angka dan geometri, serta penalaran deduktif & induktif dalam penyelesaian masalah.',
    bahasa: 'Kemampuan memproduksi bahasa lisan maupun tulisan, kepekaan penggunaan kata, artikulasi ide secara persuasif, dan rasa percaya diri mengekspresikan pemikiran.',
    intrapersonal: 'Kemampuan memahami perasaan, ide, dan tujuan pribadi, refleksi diri yang mendalam, serta penguasaan arah langkah hidup secara mandiri.',
    interpersonal: 'Kemampuan memahami orang lain, membaca dinamika kelompok, berkomunikasi efektif, serta membangun kerja sama dan empati tinggi.',
    kinestetis: 'Kemampuan menggunakan keterampilan motorik kasar dan halus secara tangkas untuk mengekspresikan gagasan dan respons fisik terkoordinasi.',
    visualRuang: 'Kemampuan membayangkan bentuk, ruang, orientasi visual, serta memvisualisasikan ide secara abstrak maupun konkret.',
    musikal: 'Kemampuan menentukan nada, ritme, kepekaan akustik terhadap suara lingkungan sekitar, instrumen musik, dan harmoni.',
    naturalis: 'Kemampuan memahami alam sekitar, kepekaan klasifikasi flora dan fauna, serta keterikatan mendalam dengan fenomena lingkungan.',
  };

  const barStartX = margin + 34;
  const barMaxWidth = 104;

  miList.forEach((mi) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(30, 41, 59);
    doc.text(mi.label, margin + 2, y + 2.6);

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(barStartX, y, barMaxWidth, 3.2, 0.8, 0.8, 'F');

    const fillW = Math.max(3, (mi.val / 100) * barMaxWidth);
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(barStartX, y, fillW, 3.2, 0.8, 0.8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${mi.val.toFixed(2)}%`, barStartX + barMaxWidth + 3.5, y + 2.5);

    y += 3.8;
  });

  y += 1.5;
  const colW = (contentWidth - 6) / 2;
  miList.forEach((mi, idx) => {
    const isCol2 = idx % 2 === 1;
    const curX = isCol2 ? margin + colW + 6 : margin;
    const curY = y + Math.floor(idx / 2) * 8.2;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(30, 58, 138);
    doc.text(mi.label, curX, curY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.4);
    doc.setTextColor(71, 85, 105);
    const splitDesc = doc.splitTextToSize(miDescriptions[mi.key] || '', colW);
    doc.text(splitDesc.slice(0, 2), curX, curY + 2.6);
  });

  // Brain Analysis Section (With Anatomical Brain Lobe Image)
  y = 143;
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, y, contentWidth, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Brain Analysis & Gaya Belajar Dominan', margin + 3, y + 3.6);

  y += 7.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(30, 41, 59);
  doc.text(
    `(a) Laporan ini menunjukkan bagian dominan, mengajak lebih memahami ciri-ciri intrinsik dan gaya belajar yang disukai ${result.fullName} :`,
    margin,
    y
  );

  y += 3;
  // Left: Rendered Anatomical Brain Lobe Image with Leader Lines & Percentages
  try {
    const brainImgData = generateBrainLobeImageDataUrl(result.brainAnalysis);
    if (brainImgData) {
      doc.addImage(brainImgData, 'PNG', margin + 1, y, 78, 47);
    }
  } catch (err) {
    console.warn('Could not render brain lobe canvas in PDF:', err);
  }

  // Right: 4 Lobes Descriptive Text Table
  const lobeX = margin + 82;
  const lobeW = contentWidth - 82;
  const lobeData = [
    {
      name: 'FRONTAL LOBE :',
      pct: `${result.brainAnalysis.frontalLobe.toFixed(2)}%`,
      desc: 'Juga dikenal sebagai korteks motorik, bagian otak yang bertanggung jawab untuk penalaran, perencanaan, berbicara, gerakan, emosi, pemecahan masalah, dan indera penciuman. keterampilan sosial dan moralitas.',
    },
    {
      name: 'PARIETAL LOBE :',
      pct: `${result.brainAnalysis.parietalLobe.toFixed(2)}%`,
      desc: 'Juga dikenal sebagai korteks somatosensori, bagian otak yang bertanggung jawab atas bagaimana kita merasakan rangsangan yang berbeda seperti sentuhan, tekanan, suhu, dan rasa sakit.',
    },
    {
      name: 'OCCIPITAL LOBE :',
      pct: `${result.brainAnalysis.occipitalLobe.toFixed(2)}%`,
      desc: 'Juga dikenal sebagai korteks visual, bagian otak yang terlibat dalam mengamati, mengimajinasikan, dan menafsirkan informasi visual.',
    },
    {
      name: 'TEMPORAL LOBE :',
      pct: `${result.brainAnalysis.temporalLobe.toFixed(2)}%`,
      desc: 'Juga dikenal sebagai korteks pendengaran, bagian otak yang bertanggung jawab untuk merasakan dan mengenali interpretasi rangsangan pendengaran dan bahasa yang didengar.',
    },
  ];

  let curLobeY = y + 1;
  lobeData.forEach((lobe) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(30, 58, 138);
    doc.text(lobe.name, lobeX, curLobeY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.6);
    doc.setTextColor(51, 65, 85);
    const splitLobe = doc.splitTextToSize(lobe.desc, lobeW);
    doc.text(splitLobe, lobeX, curLobeY + 2.8);

    curLobeY += 2.8 + splitLobe.length * 2.5 + 1.2;
  });

  // Kesimpulan Box Page 1
  y = 202;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 24, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(30, 41, 59);
  doc.text('Kesimpulan :', margin + 4, y + 4.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.4);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `(1) Rating Frontal Lobe : (a) Objective Driven Model : ${result.brainAnalysis.objectiveDriven.toFixed(2)}%  (b) Concept Driven Model : ${result.brainAnalysis.conceptDriven.toFixed(2)}%`,
    margin + 4,
    y + 8.5
  );
  doc.text(`(2) ${result.brainAnalysis.decisionOrientation}`, margin + 4, y + 12.8);
  doc.text(`(3) ${result.brainAnalysis.determinationTrait}`, margin + 4, y + 17.1);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(
    `(4) ${result.fullName} adalah pembelajar ${result.brainAnalysis.primaryLearnerType.toUpperCase()} (${
      result.brainAnalysis.primaryLearnerType === 'Tactile'
        ? 'Kemampuan Belajar menggunakan Rasa Sentuh & Tindakan Fisik'
        : result.brainAnalysis.primaryLearnerType === 'Visual'
        ? 'Kemampuan Belajar menggunakan Pengamatan Visual & Gambar'
        : 'Kemampuan Belajar menggunakan Pendengaran & Audio'
    })`,
    margin + 4,
    y + 21.4
  );

  drawFooter(doc, 1, isSmp ? 2 : 3);

  // -------------------------------------------------------------
  // PAGE 2 (Adapted for SMP vs SMA)
  // -------------------------------------------------------------
  doc.addPage();
  drawHeader(doc, 2, institution, isSmp ? 'SMP / MTs' : 'SMA / MA');

  y = 26;
  // Trend Dominasi Otak Kiri vs Kanan
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, y, contentWidth, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Kecenderungan Psikologis Dominasi Belahan Otak', margin + 3, y + 3.6);

  y += 7.5;
  const leftPct = result.psychologyTrends.leftBrainDominance;
  const rightPct = result.psychologyTrends.rightBrainDominance;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`trend dominasi otak kiri (${leftPct.toFixed(2)}%)`, margin + 8, y);
  doc.text(`trend dominasi otak kanan (${rightPct.toFixed(2)}%)`, margin + contentWidth - 68, y);

  // Center Hemispheres Drawing
  try {
    const hemiImg = generateHemispheresImageDataUrl(leftPct, rightPct);
    if (hemiImg) {
      doc.addImage(hemiImg, 'PNG', margin + contentWidth / 2 - 19, y - 4, 38, 19);
    }
  } catch (err) {
    console.warn('Could not render hemisphere canvas:', err);
  }

  y += 18;
  const boxW = (contentWidth - 6) / 2;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, boxW, 18, 'FD');
  doc.rect(margin + boxW + 6, y, boxW, 18, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(71, 85, 105);
  const leftTraits = [
    '• Berfikir secara sadar (consciousness)',
    '• Bernalar menurut logika & fakta',
    '• Berfikir dengan kata-kata & simbol',
    '• Memilah-milah & menganalisis terstruktur',
    '• Berfikir secara runtut & sistematis',
  ];
  leftTraits.forEach((t, i) => doc.text(t, margin + 3, y + 3.5 + i * 3.2));

  const rightTraits = [
    '• Ketaksadaran (sub-consciousness)',
    '• Kreatif, intuitif, melibatkan emosi',
    '• Berfikir dalam bentuk gambar & imajinasi',
    '• Melihat keseluruhan & sintesis ide',
    '• Spontan, bebas, senang bekerja kolaboratif',
  ];
  rightTraits.forEach((t, i) => doc.text(t, margin + boxW + 9, y + 3.5 + i * 3.2));

  // Karakteristik Kepribadian (9 Points)
  y += 21;
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, y, contentWidth, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Karakteristik Kepribadian Utama', margin + 3, y + 3.6);

  y += 6.5;
  result.psychologyTrends.personalityTraits.forEach((trait, i) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(30, 58, 138);
    doc.text(`(${i + 1})`, margin + 2, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(51, 65, 85);
    const splitTrait = doc.splitTextToSize(trait, contentWidth - 10);
    doc.text(splitTrait, margin + 8, y);
    y += splitTrait.length * 2.8 + 0.8;
  });

  // Saran Pengembangan
  y += 2;
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, y, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('Saran Pengembangan Diri', margin + 3, y + 4);

  y += 7.5;
  const devList = [
    { num: '(1)', text: result.psychologyTrends.developmentRecommendations.priority1 },
    { num: '(2)', text: result.psychologyTrends.developmentRecommendations.priority2 },
    { num: '(3)', text: result.psychologyTrends.developmentRecommendations.priority3 },
  ];
  devList.forEach((d) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(30, 58, 138);
    doc.text(d.num, margin + 2, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(51, 65, 85);
    const splitDev = doc.splitTextToSize(d.text, contentWidth - 10);
    doc.text(splitDev, margin + 8, y);
    y += splitDev.length * 3.1 + 1.2;
  });

  // Gaya Belajar & Posisi Duduk
  y += 2;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 22, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Modalitas Belajar : Parietal Lobe - Tactile (${result.brainAnalysis.parietalLobe.toFixed(2)}%) | Occipital Lobe - Visual (${result.brainAnalysis.occipitalLobe.toFixed(2)}%) | Temporal Lobe - Auditory (${result.brainAnalysis.temporalLobe.toFixed(2)}%)`,
    margin + 3,
    y + 4.5
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(71, 85, 105);
  const adviceSplit = doc.splitTextToSize(result.psychologyTrends.learningModalityDetails.advice, contentWidth - 6);
  doc.text(adviceSplit.slice(0, 2), margin + 3, y + 8.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(`Saran Posisi Duduk dalam Ruang Belajar : ${result.psychologyTrends.recommendedSeating}`, margin + 3, y + 18);

  // Saran Pengembangan Prestasi
  y += 25;
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, y, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('Saran Pengembangan Prestasi & Penjurusan', margin + 3, y + 4);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(30, 41, 59);
  doc.text('(1) Saran lomba yang diikuti adalah bidang :', margin + 2, y);
  doc.setFont('helvetica', 'normal');
  doc.text(result.psychologyTrends.competitionRecommendation, margin + 55, y);

  y += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.text('(2) Saran penjurusan untuk jenjang lebih tinggi :', margin + 2, y);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${result.psychologyTrends.highSchoolMajor.stream} dengan PDS : ${result.psychologyTrends.highSchoolMajor.pdsScore.toFixed(2)}%`,
    margin + 62,
    y
  );

  // If SMP -> Add bottom notes on Page 2 and seal
  if (isSmp) {
    y += 9;
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(180, 83, 9);
    doc.text('Catatan :', margin + 4, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(146, 64, 14);
    doc.text(
      'Hasil tes diagnostik bisa berubah tergantung kemampuan testee belajar dan berinteraksi dengan lingkungannya.',
      margin + 4,
      y + 8.5
    );

    drawFooter(doc, 2, 2);
    return doc;
  }

  drawFooter(doc, 2, 3);

  // -------------------------------------------------------------
  // PAGE 3 (For SMA - University Programs)
  // -------------------------------------------------------------
  doc.addPage();
  drawHeader(doc, 3, institution, 'SMA / MA');

  y = 30;
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, y, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('Saran Pilihan Program Studi di Perguruan Tinggi', margin + 3, y + 4);

  y += 8.5;
  const univ = result.psychologyTrends.universityPrograms || {
    priority1: [],
    priority2: [],
    priority3: [],
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 58, 138);
  doc.text('(1) Prioritas Utama, disarankan untuk memilih Program Studi :', margin + 2, y);

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(51, 65, 85);
  const p1Text = univ.priority1.join(', ') + '.';
  const p1Split = doc.splitTextToSize(p1Text, contentWidth - 4);
  doc.text(p1Split, margin + 4, y);

  y += p1Split.length * 3.2 + 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 58, 138);
  doc.text('(2) Prioritas Berikutnya, disarankan untuk memilih Program Studi :', margin + 2, y);

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(51, 65, 85);
  const p2Text = univ.priority2.join(', ') + '.';
  const p2Split = doc.splitTextToSize(p2Text, contentWidth - 4);
  doc.text(p2Split, margin + 4, y);

  y += p2Split.length * 3.2 + 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 58, 138);
  doc.text('(3) Prioritas Terakhir, alternatif bidang interdisipliner :', margin + 2, y);

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(51, 65, 85);
  const p3Text = univ.priority3.join(', ') + '.';
  const p3Split = doc.splitTextToSize(p3Text, contentWidth - 4);
  doc.text(p3Split, margin + 4, y);

  // Catatan
  y = 210;
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(180, 83, 9);
  doc.text('Catatan Penting :', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(146, 64, 14);
  doc.text(
    'Hasil tes diagnostik ini bersifat dinamis dan dapat berkembang sesuai motivasi belajar, pelatihan terbimbing, serta interaksi lingkungan siswa.',
    margin + 4,
    y + 9.5
  );

  // Lembar Pengesahan
  y += 24;
  const sigX = margin + contentWidth - 65;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Diterbitkan secara sah oleh :`, sigX, y);
  doc.setFont('helvetica', 'bold');
  doc.text(institution.institutionName, sigX, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Tim Ahli Asesmen & Diagnostik', sigX, y + 9);

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.6);
  doc.roundedRect(sigX - 2, y + 12, 58, 14, 2, 2, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(37, 99, 235);
  doc.text('TERVERIFIKASI & TERCATAT RESMI', sigX + 2, y + 18);
  doc.setFontSize(5.5);
  doc.text(`ID SISTEM : ${result.regNumber}`, sigX + 2, y + 23);

  drawFooter(doc, 3, 3);

  return doc;
}

function drawHeader(doc: jsPDF, pageNum: number, institution: InstitutionSettings, levelLabel: string) {
  const margin = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;

  doc.setFillColor(30, 58, 138);
  doc.rect(margin, 8, contentWidth, 14, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`LAPORAN HASIL TES DIAGNOSTIK (${levelLabel})`, margin + 6, 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(224, 231, 255);
  doc.text(institution.institutionName, pageWidth - margin - 6, 17, { align: 'right' });
}

function drawFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const margin = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text(`${pageNum} | Hasil Tes Diagnostik Siswa`, margin, pageHeight - 7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`@copyright Pak GuruAI`, pageWidth / 2, pageHeight - 7.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Dokumen Resmi (Hal ${pageNum} dari ${totalPages})`, pageWidth - margin, pageHeight - 7.5, { align: 'right' });
}
