import React, { useState } from 'react';
import { InstitutionSettings, TestResult } from '../types';
import { generateDiagnosticPdf } from '../utils/pdfGenerator';
import {
  Download,
  Brain,
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Calendar,
  School,
  User,
  GraduationCap,
} from 'lucide-react';

interface StudentResultViewProps {
  result: TestResult | null;
  institution: InstitutionSettings;
  onBackHome: () => void;
  isAdminViewing?: boolean;
}

export const StudentResultView: React.FC<StudentResultViewProps> = ({
  result,
  institution,
  onBackHome,
  isAdminViewing = false,
}) => {
  const [downloading, setDownloading] = useState(false);

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Belum Ada Rekaman Hasil Tes</h3>
        <p className="text-sm text-slate-600">
          Anda belum menyelesaikan pengerjaan tes atau data hasil tes belum dikirim ke sistem.
        </p>
        <button
          onClick={onBackHome}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition cursor-pointer"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const isSmp = result.educationLevel === 'SMP';

  if (!result.isReleased && !isAdminViewing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Hasil Tes Sedang Dalam Proses Verifikasi</h3>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Terima kasih telah menyelesaikan seluruh rangkaian asesmen diagnostik ({result.educationLevel || 'SMA'}). Hasil evaluasi Anda telah masuk ke sistem dan saat ini sedang menunggu validasi / rilis resmi dari tim pengelola lembaga.
        </p>
        {institution.resultReleaseDate && (
          <div className="inline-flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-xs font-semibold">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Jadwal rilis perkiraan: {new Date(institution.resultReleaseDate).toLocaleString('id-ID')}</span>
          </div>
        )}
        <div className="pt-2">
          <button
            onClick={onBackHome}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition cursor-pointer"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const handleDownloadPdf = () => {
    setDownloading(true);
    try {
      const doc = generateDiagnosticPdf(result, institution);
      const safeName = (result.fullName || 'Siswa').replace(/\s+/g, '_');
      doc.save(`Laporan_Hasil_Diagnostik_${result.educationLevel}_${safeName}_${result.regNumber}.pdf`);
    } catch (err) {
      alert('Gagal membuat berkas PDF: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setDownloading(false);
    }
  };

  const iqCategories = [
    { label: 'Di bawah rata-rata', range: '(<85)', min: 0, max: 84 },
    { label: 'Normal Bawah', range: '(85-99)', min: 85, max: 99 },
    { label: 'Normal', range: '(100-110)', min: 100, max: 110 },
    { label: 'Normal Atas', range: '(111-120)', min: 111, max: 120 },
    { label: 'Superior', range: '(121-139)', min: 121, max: 139 },
    { label: 'Di Atas Superior', range: '(140-170)', min: 140, max: 170 },
    { label: 'Jenius', range: '(>170)', min: 171, max: 200 },
  ];

  const miList = [
    { key: 'logikaMatematika', label: 'Logika Matematika', val: result.multipleIntelligences.logikaMatematika, color: 'bg-blue-600' },
    { key: 'bahasa', label: 'Bahasa', val: result.multipleIntelligences.bahasa, color: 'bg-emerald-600' },
    { key: 'intrapersonal', label: 'Intrapersonal', val: result.multipleIntelligences.intrapersonal, color: 'bg-indigo-600' },
    { key: 'interpersonal', label: 'Interpersonal', val: result.multipleIntelligences.interpersonal, color: 'bg-sky-500' },
    { key: 'kinestetis', label: 'Kinestetis', val: result.multipleIntelligences.kinestetis, color: 'bg-amber-500' },
    { key: 'visualRuang', label: 'Visual Ruang', val: result.multipleIntelligences.visualRuang, color: 'bg-purple-600' },
    { key: 'musikal', label: 'Musikal', val: result.multipleIntelligences.musikal, color: 'bg-pink-500' },
    { key: 'naturalis', label: 'Naturalis', val: result.multipleIntelligences.naturalis, color: 'bg-teal-600' },
  ];

  const miDescriptions: Record<string, string> = {
    logikaMatematika: 'Kemampuan untuk mengenali bentuk atau pola, memahami simbol abstrak seperti angka dan bentuk geometris serta kemampuan dalam memberikan penjelasan secara deduktif dan induktif.',
    bahasa: 'Kemampuan untuk memproduksi bahasa, baik secara lisan atau tulisan serta peka dalam perbedaan dan penggunaan irama dalam kata-kata.',
    intrapersonal: 'Kemampuan untuk memahami perasaan, ide dan tujuan pribadi, refleksi diri serta mampu melihat atau mengamati diri sendiri seperti orang lain mengamati dirinya.',
    interpersonal: 'Kemampuan untuk memahami orang lain, memperhatikan perbedaan antar individu, kemampuan bekerja sama, serta kemampuan untuk mengembangkan empati.',
    kinestetis: 'Kemampuan untuk menggunakan ketrampilan motorik kasar dan halus untuk mengekspresikan emosi dan menggunakan bahasa tubuh.',
    visualRuang: 'Kemampuan untuk membayangkan bentuk sebuah benda dan mevisualisasikannya secara abstrak atau konkret.',
    musikal: 'Kemampuan dalam menentukan nada, irama dan kepekaan pada suara dari sekitar kita, baik suara manusia atau instrument musik.',
    naturalis: 'Kemampuan yang berhubungan dengan pemahaman akan alam sekitar, pengenalan flora dan fauna, serta memiliki keterikatan dengan alam dan segala fenomenanya.',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackHome}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Hasil Tes Diagnostik Siswa
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                Jenjang {result.educationLevel || 'SMA'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              ID Registrasi: <span className="font-mono font-semibold text-slate-800">{result.regNumber}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-200 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Menyiapkan PDF...' : `Unduh Laporan PDF (${isSmp ? '2 Hal' : '3 Hal'})`}</span>
          </button>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-md divide-y divide-slate-200 overflow-hidden">
        {/* ========================================================= */}
        {/* HALAMAN 1 DOKUMEN                                          */}
        {/* ========================================================= */}
        <div className="p-6 sm:p-10 space-y-8">
          <div className="border-b-2 border-blue-900 pb-3 flex justify-between items-end">
            <div>
              <span className="text-[11px] font-bold tracking-widest text-blue-900 uppercase">
                1 | HASIL TES DIAGNOSTIK
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                {institution.institutionName}
              </h2>
            </div>
            <span className="text-xs text-blue-900 font-bold px-2 py-0.5 bg-blue-50 border border-blue-200 rounded">
              Tingkat {isSmp ? 'SMP / MTs' : 'SMA / MA / SMK'}
            </span>
          </div>

          {/* Student Identitas Table Box */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 sm:p-5 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6">
              <div className="flex justify-between sm:justify-start gap-2">
                <span className="text-slate-500 font-medium w-36">Nomor Registrasi</span>
                <span className="text-slate-900 font-mono font-bold">: {result.regNumber}</span>
              </div>
              <div className="flex justify-between sm:justify-start gap-2">
                <span className="text-slate-500 font-medium w-36">Asal Sekolah</span>
                <span className="text-slate-900 font-semibold">: {result.schoolOrigin}</span>
              </div>
              <div className="flex justify-between sm:justify-start gap-2">
                <span className="text-slate-500 font-medium w-36">Nama Siswa</span>
                <span className="text-slate-900 font-bold">: {result.fullName}</span>
              </div>
              <div className="flex justify-between sm:justify-start gap-2">
                <span className="text-slate-500 font-medium w-36">Tanggal Evaluasi</span>
                <span className="text-slate-900">: {new Date(result.evaluatedAt).toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex justify-between sm:justify-start gap-2">
                <span className="text-slate-500 font-medium w-36">Jenjang / Kelas</span>
                <span className="text-slate-900">: {result.educationLevel} - {result.grade}</span>
              </div>
            </div>
          </div>

          {/* SECTION 1: Intelegensia Umum (IQ) */}
          <div className="space-y-2.5">
            <div className="bg-blue-900 text-white px-3 py-1.5 rounded-t-lg font-bold text-xs uppercase tracking-wider">
              Intelegensia Umum (IQ)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse border border-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-800">
                    {iqCategories.map((cat) => (
                      <th key={cat.label} className="border border-slate-200 p-2 font-semibold text-[11px]">
                        <div>{cat.label}</div>
                        <div className="text-slate-500 font-normal text-[10px]">{cat.range}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {iqCategories.map((cat) => {
                      const isMatch = result.iqScore >= cat.min && result.iqScore <= cat.max;
                      return (
                        <td
                          key={cat.label}
                          className={`border border-slate-200 p-2.5 font-bold ${
                            isMatch ? 'bg-blue-900 text-white text-base shadow-inner' : 'bg-white text-transparent'
                          }`}
                        >
                          {isMatch ? result.iqScore : '-'}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2: Distribusi Kecerdasan Majemuk */}
          <div className="space-y-4">
            <div className="bg-blue-900 text-white px-3 py-1.5 rounded-t-lg font-bold text-xs uppercase tracking-wider">
              Distribusi Kecerdasan Majemuk
            </div>

            <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {miList.map((mi) => (
                <div key={mi.key} className="flex items-center gap-3 text-xs">
                  <span className="w-36 font-semibold text-slate-800 shrink-0">{mi.label}</span>
                  <div className="flex-1 bg-slate-200 h-3 rounded-full overflow-hidden">
                    <div className={`${mi.color} h-full rounded-full transition-all duration-500`} style={{ width: `${mi.val}%` }} />
                  </div>
                  <span className="w-16 text-right font-mono font-bold text-slate-900 shrink-0">
                    {mi.val.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {miList.map((mi) => (
                <div key={mi.key} className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <h4 className="text-xs font-bold text-blue-900">{mi.label}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{miDescriptions[mi.key]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: Brain Analysis */}
          <div className="space-y-4">
            <div className="bg-blue-900 text-white px-3 py-1.5 rounded-t-lg font-bold text-xs uppercase tracking-wider">
              Brain Analysis
            </div>

            <p className="text-xs text-slate-700">
              (a) Laporan ini menunjukkan bagian yang dominan, mengajak lebih memahami ciri-ciri intrinsik dan gaya belajar yang lebih disukai{' '}
              <span className="font-bold text-slate-900">{result.fullName}</span> yaitu :
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-900 mb-0.5">
                    <span>FRONTAL LOBE</span>
                    <span className="text-blue-900 font-mono font-bold">({result.brainAnalysis.frontalLobe.toFixed(2)}%)</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Korteks motorik, bagian otak yang bertanggung jawab untuk penalaran, perencanaan, berbicara, gerakan, emosi, pemecahan masalah, keterampilan sosial dan moralitas.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-900 mb-0.5">
                    <span>PARIETAL LOBE</span>
                    <span className="text-blue-900 font-mono font-bold">({result.brainAnalysis.parietalLobe.toFixed(2)}%)</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Korteks somatosensori, bagian otak yang bertanggung jawab atas bagaimana kita merasakan rangsangan yang berbeda seperti sentuhan, tekanan, suhu, dan rasa sakit.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-900 mb-0.5">
                    <span>OCCIPITAL LOBE</span>
                    <span className="text-blue-900 font-mono font-bold">({result.brainAnalysis.occipitalLobe.toFixed(2)}%)</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Korteks visual, bagian otak yang terlibat dalam mengamati, mengimajinasikan, dan menafsirkan informasi visual.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-900 mb-0.5">
                    <span>TEMPORAL LOBE</span>
                    <span className="text-blue-900 font-mono font-bold">({result.brainAnalysis.temporalLobe.toFixed(2)}%)</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Korteks pendengaran, bagian otak yang bertanggung jawab untuk merasakan dan mengenali interpretasi rangsangan pendengaran dan bahasa yang didengar.
                  </p>
                </div>
              </div>
            </div>

            {/* Kesimpulan */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5 text-xs">
              <h4 className="font-bold text-blue-950 uppercase tracking-wide">Kesimpulan Analisa Belajar :</h4>
              <p className="text-slate-800">
                (1) Rating Frontal Lobe : (a) Objective Driven Model : <span className="font-bold">{result.brainAnalysis.objectiveDriven.toFixed(2)}%</span>  (b) Concept Driven Model : <span className="font-bold">{result.brainAnalysis.conceptDriven.toFixed(2)}%</span>
              </p>
              <p className="text-slate-800">(2) {result.brainAnalysis.decisionOrientation}</p>
              <p className="text-slate-800">(3) {result.brainAnalysis.determinationTrait}</p>
              <p className="font-bold text-blue-900">
                (4) {result.fullName} adalah pembelajar {result.brainAnalysis.primaryLearnerType.toUpperCase()} (Kemampuan Belajar menggunakan{' '}
                {result.brainAnalysis.primaryLearnerType === 'Tactile'
                  ? 'Rasa Sentuh, Gerakan & Eksplorasi Tindakan'
                  : result.brainAnalysis.primaryLearnerType === 'Visual'
                  ? 'Pengamatan Visual, Gambar & Diagram'
                  : 'Pendengaran, Audio & Diskusi Lisan'}
                )
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* HALAMAN 2 DOKUMEN                                          */}
        {/* ========================================================= */}
        <div className="p-6 sm:p-10 space-y-8 bg-slate-50/30">
          <div className="border-b-2 border-blue-900 pb-2">
            <span className="text-[11px] font-bold tracking-widest text-blue-900 uppercase">
              2 | HASIL TES DIAGNOSTIK - KECENDERUNGAN PSIKOLOGIS & POTENSI
            </span>
          </div>

          {/* Dominasi Otak */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-800">
              (b) Dalam diri ditemukan kecenderungan psikologis dominasi belahan otak sebagai berikut :
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-center">
                <span className="font-bold text-blue-900 block">Trend Dominasi Otak Kiri</span>
                <span className="text-lg font-extrabold text-blue-700 font-mono">
                  {result.psychologyTrends.leftBrainDominance.toFixed(2)}%
                </span>
              </div>
              <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-center">
                <span className="font-bold text-emerald-900 block">Trend Dominasi Otak Kanan</span>
                <span className="text-lg font-extrabold text-emerald-700 font-mono">
                  {result.psychologyTrends.rightBrainDominance.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] text-slate-600 pt-1">
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                <p className="font-bold text-slate-800">Ciri Dominan Otak Kiri :</p>
                <p>• Berfikir secara sadar (consciousness), bernalar menurut logika</p>
                <p>• Berfikir dengan kata-kata, memilah-milah, menganalisis runtut</p>
                <p>• Mengatur dan mengendalikan emosi, melihat perbedaan</p>
                <p>• Senang bekerja mandiri & fokus terstruktur</p>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                <p className="font-bold text-slate-800">Ciri Dominan Otak Kanan :</p>
                <p>• Ketaksadaran (sub-consciousness), kreatif, intuitif, emosional</p>
                <p>• Berfikir dalam bentuk gambar, melihat keutuhan (sintesis)</p>
                <p>• Spontan dan bebas dalam mengekspresikan emosi</p>
                <p>• Senang bekerja dalam team & kolaboratif</p>
              </div>
            </div>
          </div>

          {/* Karakteristik Kepribadian */}
          <div className="space-y-2.5">
            <div className="bg-blue-900 text-white px-3 py-1.5 rounded-t-lg font-bold text-xs uppercase tracking-wider">
              Karakteristik Kepribadian
            </div>
            <div className="space-y-1.5 bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-700">
              {result.psychologyTrends.personalityTraits.map((trait, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="font-bold text-blue-900 shrink-0">({idx + 1})</span>
                  <span>{trait}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Saran Pengembangan */}
          <div className="space-y-2.5">
            <div className="bg-blue-900 text-white px-3 py-1.5 rounded-t-lg font-bold text-xs uppercase tracking-wider">
              Saran Pengembangan
            </div>
            <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-700">
              <p>
                <span className="font-bold text-blue-900">(1)</span> {result.psychologyTrends.developmentRecommendations.priority1}
              </p>
              <p>
                <span className="font-bold text-blue-900">(2)</span> {result.psychologyTrends.developmentRecommendations.priority2}
              </p>
              <p>
                <span className="font-bold text-blue-900">(3)</span> {result.psychologyTrends.developmentRecommendations.priority3}
              </p>
            </div>
          </div>

          {/* Gaya Belajar & Posisi Duduk */}
          <div className="space-y-2.5">
            <div className="bg-blue-900 text-white px-3 py-1.5 rounded-t-lg font-bold text-xs uppercase tracking-wider">
              Gaya Belajar & Posisi Duduk
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
              <p className="font-semibold text-slate-800">
                Modalitas belajar : Parietal Lobe - Tactile ({result.brainAnalysis.parietalLobe.toFixed(2)}%) - Occipital Lobe - Visual ({result.brainAnalysis.occipitalLobe.toFixed(2)}%) - Temporal Lobe - Auditory ({result.brainAnalysis.temporalLobe.toFixed(2)}%)
              </p>
              <p className="text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-900">Maka gaya belajar yang tepat : </span>
                {result.psychologyTrends.learningModalityDetails.advice}
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-blue-900 font-bold">
                <span>Saran Posisi Duduk dalam Ruang Belajar :</span>
                <span className="underline">{result.psychologyTrends.recommendedSeating}</span>
              </div>
            </div>
          </div>

          {/* Saran Pengembangan Prestasi & Penjurusan */}
          <div className="space-y-2.5">
            <div className="bg-blue-900 text-white px-3 py-1.5 rounded-t-lg font-bold text-xs uppercase tracking-wider">
              Saran Pengembangan Prestasi & Penjurusan
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs text-slate-800">
              <p>
                <span className="font-bold text-blue-900">(1) Saran lomba yang diikuti adalah bidang : </span>
                <span className="font-semibold">{result.psychologyTrends.competitionRecommendation}</span>
              </p>
              <p>
                <span className="font-bold text-blue-900">(2) Saran penjurusan untuk jenjang lebih tinggi : </span>
                <span className="font-semibold">
                  {result.psychologyTrends.highSchoolMajor.stream} dengan PDS :{' '}
                  <span className="font-mono font-bold text-blue-800">
                    {result.psychologyTrends.highSchoolMajor.pdsScore.toFixed(2)}%
                  </span>
                </span>
              </p>
            </div>
          </div>

          {/* If SMP -> Show bottom note & seal here */}
          {isSmp && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <p className="font-bold">Catatan :</p>
              <p>
                Hasil tes diagnostik bisa berubah tergantung kemampuan testee belajar dan berinteraksi dengan lingkungannya.
              </p>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* HALAMAN 3 DOKUMEN (SMA ONLY)                               */}
        {/* ========================================================= */}
        {!isSmp && result.psychologyTrends.universityPrograms && (
          <div className="p-6 sm:p-10 space-y-8">
            <div className="border-b-2 border-blue-900 pb-2">
              <span className="text-[11px] font-bold tracking-widest text-blue-900 uppercase">
                3 | HASIL TES DIAGNOSTIK - REKOMENDASI PROGRAM STUDI PTN / PTS
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-900 text-white px-3 py-1.5 rounded-t-lg font-bold text-xs uppercase tracking-wider">
                Saran Pilihan Program Studi di Perguruan Tinggi
              </div>

              <div className="space-y-3.5 text-xs text-slate-800 leading-relaxed">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <h4 className="font-bold text-blue-900 text-sm">
                    (1) Prioritas Utama, disarankan untuk memilih Program Studi :
                  </h4>
                  <p className="text-slate-700">
                    {result.psychologyTrends.universityPrograms.priority1.join(', ')}.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <h4 className="font-bold text-blue-900 text-sm">
                    (2) Prioritas Berikutnya, disarankan untuk memilih Program Studi :
                  </h4>
                  <p className="text-slate-700">
                    {result.psychologyTrends.universityPrograms.priority2.join(', ')}.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <h4 className="font-bold text-blue-900 text-sm">
                    (3) Prioritas Terakhir, alternatif bidang studi relevan :
                  </h4>
                  <p className="text-slate-700">
                    {result.psychologyTrends.universityPrograms.priority3.join(', ')}.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <p className="font-bold">Catatan :</p>
              <p>
                Hasil tes diagnostik bisa berubah tergantung kemampuan testee belajar dan berinteraksi dengan lingkungannya.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
