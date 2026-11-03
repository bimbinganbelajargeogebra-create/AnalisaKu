import React, { useState } from 'react';
import { InstitutionSettings, Student, EducationLevel } from '../types';
import {
  Brain,
  Sparkles,
  BarChart3,
  Compass,
  ArrowRight,
  Clock,
  CheckCircle2,
  BookOpen,
  Eye,
  ShieldCheck,
  HelpCircle,
  Award,
  Users,
  HardDrive,
  Smile,
  GraduationCap,
  ChevronRight,
  FileText,
  Wifi,
  Lightbulb,
  Check,
} from 'lucide-react';

interface LandingPageProps {
  institution: InstitutionSettings;
  currentStudent: Student | null;
  onStartRegistration: () => void;
  onStartTest: () => void;
  onCheckResult: () => void;
  onAdminClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  institution,
  currentStudent,
  onStartRegistration,
  onStartTest,
  onCheckResult,
  onAdminClick,
}) => {
  const [selectedLevelTab, setSelectedLevelTab] = useState<EducationLevel>('SD');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const levelDetails = {
    SD: {
      title: 'Jenjang SD / MI (Kelas 4, 5, 6)',
      tagline: 'Mengenal Bakat, Daya Nalar & Karakteristik Belajar Anak Sejak Dini',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      activeTabClass: 'bg-amber-600 text-white shadow-md shadow-amber-200',
      accentBg: 'bg-amber-50/70 border-amber-200',
      icon: Smile,
      features: [
        'Bahasa soal disesuaikan ramah anak & mudah dipahami murid SD',
        'Dilengkapi diagram figural visual (menghitung kubus 3D & bentuk ruang)',
        'Membantu orang tua & guru memahami gaya belajar (visual, auditori, kinestetik)',
        'Laporan hasil 2 halaman yang ringkas, jelas, dan mudah dipahami orang tua',
      ],
      sampleQuestions: 'Hitung jumlah kubus pada tumpukan, analogi gambar benda sehari-hari, dan pola angka sederhana.',
      reportFormat: 'Laporan 2 Halaman (Fokus: IQ, Kecerdasan Dominan, Gaya Belajar Sensori & Saran Guru/Ortu)',
    },
    SMP: {
      title: 'Jenjang SMP / MTs (Kelas 7, 8, 9)',
      tagline: 'Memetakan Minat, Logika Berpikir & Kesiapan Menuju SMA / SMK',
      badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
      activeTabClass: 'bg-sky-600 text-white shadow-md shadow-sky-200',
      accentBg: 'bg-sky-50/70 border-sky-200',
      icon: BookOpen,
      features: [
        'Mengukur daya nalar silogisme, logika analitik, dan verbal komprehensif',
        'Analisis dominasi belahan otak kiri (logis) vs otak kanan (kreatif)',
        'Rekomendasi pemilihan jalur kelanjutan studi (SMA IPA/IPS/Bahasa vs SMK Kejuruan)',
        'Laporan resmi 2 halaman dilengkapi saran strategi belajar mandiri',
      ],
      sampleQuestions: 'Pola deret angka, silogisme premis logika, relasi kata analogi, dan kubus berputar.',
      reportFormat: 'Laporan 2 Halaman (Fokus: Profil IQ, Radar 8 Kecerdasan, Otak Kiri/Kanan & Rekomendasi SMA/SMK)',
    },
    SMA: {
      title: 'Jenjang SMA / MA / SMK (Kelas 10, 11, 12)',
      tagline: 'Rekomendasi Jurusan Kuliah, Potensi Daya Saing & Prospek Karir Masa Depan',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      activeTabClass: 'bg-indigo-600 text-white shadow-md shadow-indigo-200',
      accentBg: 'bg-indigo-50/70 border-indigo-200',
      icon: GraduationCap,
      features: [
        'Instrumen diagnostik terpadu 120 butir soal penalaran dan inventori psikometrik',
        'Analisis 4 lobus otak lengkap (Frontal, Parietal, Occipital, Temporal)',
        'Estimasi Potensi Daya Saing (PDS) untuk seleksi perguruan tinggi negeri / swasta',
        'Laporan lengkap 3 halaman memuat 3 klaster prioritas program studi kuliah',
      ],
      sampleQuestions: 'Penalaran analitik kompleks, deret logika bersusun, diagram spasial 3D, dan inventori minat.',
      reportFormat: 'Laporan Lengkap 3 Halaman (IQ, Lobus Otak, Gaya Belajar, Rekomendasi Jurusan Prioritas 1, 2, 3)',
    },
  };

  const currentTabInfo = levelDetails[selectedLevelTab];

  const faqs = [
    {
      q: 'Bagaimana jika koneksi internet terputus saat sedang mengerjakan tes?',
      a: 'Jangan panik! Aplikasi ini dilengkapi sistem Auto-Save ke Local Storage browser. Setiap jawaban yang kamu klik langsung tersimpan secara aman di perangkatmu. Kamu bisa tetap lanjut menjawab soal, dan sambungkan kembali internet saat akan mengirimkan hasil.',
    },
    {
      q: 'Apakah tes ini cocok dan mudah dikerjakan oleh anak SD?',
      a: 'Ya, sangat cocok! Soal untuk jenjang SD telah disesuaikan khusus dengan bahasa yang ramah, jelas, dilengkapi visual diagram gambar kubus yang menarik, serta memiliki tombol pembesar huruf (A / A+ / A++) agar anak tidak cepat lelah saat membaca.',
    },
    {
      q: 'Berapa lama durasi pengerjaan tes ini?',
      a: 'Tes terdiri dari 5 sesi terstruktur dengan total waktu sekitar 65 hingga 75 menit. Masing-masing sesi memiliki pengatur waktu otomatis dan siswa dapat melihat jumlah sisa soal yang belum dikerjakan secara transparan.',
    },
    {
      q: 'Kapan dan bagaimana siswa menerima hasil asesmen?',
      a: 'Hasil evaluasi langsung dianalisis oleh algoritma diagnostik terstandar. Siswa maupun pengelola dapat melihat hasil secara instan berupa grafik radar kecerdasan majemuk dan mengunduh berkas laporan resmi PDF berformat rapi.',
    },
    {
      q: 'Apakah tes ini bisa dibuka di HP, tablet, laptop, dan komputer PC?',
      a: 'Ya, 100% responsif! Tampilan tombol, teks soal, dan palet nomor telah dioptimalkan untuk layar sentuh di HP/tablet serta nyaman digunakan dengan keyboard/mouse di laptop atau komputer.',
    },
  ];

  return (
    <div className="space-y-16 pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-14 bg-linear-to-b from-indigo-50/70 via-blue-50/40 to-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Audience Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                  <Smile className="w-3.5 h-3.5 text-amber-700" />
                  Jenjang SD / MI
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-900 text-xs font-bold border border-sky-300">
                  <BookOpen className="w-3.5 h-3.5 text-sky-700" />
                  Jenjang SMP / MTs
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-bold border border-indigo-300">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-700" />
                  Jenjang SMA / MA / SMK
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-tight">
                Kenali Potensi Diri, Kecerdasan & Gaya Belajar Terbaikmu!
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Platform tes asesmen diagnostik terpadu yang ramah siswa, terstandar, dan akurat. Memetakan Intelegensia Umum (IQ), 8 Spektrum Kecerdasan Majemuk, Dominasi Belahan Otak, serta panduan arah studi yang tepat.
              </p>

              {/* Feature Highlights Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 font-semibold shadow-2xs">
                  <HardDrive className="w-4 h-4 text-emerald-600" />
                  <span>Auto-Save ke Perangkat (Anti-Koneksi Putus)</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-800 rounded-xl border border-indigo-200 font-semibold shadow-2xs">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Format Soal Sesuai Usia & Jenjang</span>
                </div>
              </div>

              {/* Status Notice if test is restricted */}
              {!institution.isTestOpen && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs sm:text-sm font-medium flex items-center gap-2 justify-center lg:justify-start">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Sesi tes saat ini sedang ditutup atau dibatasi oleh administrator lembaga.</span>
                </div>
              )}

              {/* CTA Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                {currentStudent ? (
                  <>
                    <button
                      onClick={onStartTest}
                      className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <span>Lanjutkan / Mulai Tes Sekarang</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={onCheckResult}
                      className="px-6 py-3.5 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-sm sm:text-base rounded-2xl transition cursor-pointer shadow-2xs"
                    >
                      Lihat Hasil Evaluasi
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onStartRegistration}
                      className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer active:scale-95"
                    >
                      <span>Mulai Pendaftaran & Tes</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={onCheckResult}
                      className="px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-sm sm:text-base rounded-2xl transition shadow-xs cursor-pointer"
                    >
                      Cek & Unduh Laporan PDF
                    </button>
                  </>
                )}
              </div>

              {/* Quick Metrics Bar */}
              <div className="pt-4 grid grid-cols-3 gap-3 border-t border-slate-200 text-center lg:text-left">
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">120</p>
                  <p className="text-xs text-slate-500 font-semibold">Butir Soal & Inventori</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">5 Sesi</p>
                  <p className="text-xs text-slate-500 font-semibold">Waktu Terstruktur</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">2 - 3 Hal</p>
                  <p className="text-xs text-slate-500 font-semibold">Laporan PDF Terstandar</p>
                </div>
              </div>
            </div>

            {/* Right: Live Interactive Card Preview */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-200 p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900">Pratinjau Hasil Diagnostik</p>
                      <p className="text-[11px] text-slate-500">Otomatisasi Akurat & Terpercaya</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    Sistem Aktif
                  </span>
                </div>

                {/* Simulated Student Result Mockup */}
                <div className="space-y-3">
                  {/* IQ Metric */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/90 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Intelegensia Umum (IQ)</span>
                      <span className="font-extrabold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                        118 (Di Atas Rata-rata)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: '74%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Rentang Standar Binet-Simon</span>
                      <span className="font-bold text-emerald-700">Potensi Unggul</span>
                    </div>
                  </div>

                  {/* Multiple Intelligence Mini Radar Snapshot */}
                  <div className="space-y-2 bg-indigo-50/40 p-3 rounded-2xl border border-indigo-100">
                    <span className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider block">
                      Kecerdasan Majemuk Dominan
                    </span>
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-700 mb-0.5 font-semibold">
                          <span>Logika Matematika</span>
                          <span className="font-bold text-indigo-700">82%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: '82%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-700 mb-0.5 font-semibold">
                          <span>Visual & Spasial</span>
                          <span className="font-bold text-sky-700">76%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-sky-500 h-full rounded-full" style={{ width: '76%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-700 mb-0.5 font-semibold">
                          <span>Bahasa & Linguistik</span>
                          <span className="font-bold text-emerald-700">71%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: '71%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badges for Brain & Learning Modality */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-100">
                      <p className="text-[10px] text-blue-700 font-bold uppercase">Gaya Belajar</p>
                      <p className="font-extrabold text-blue-950 mt-0.5">Visual-Kinestetik</p>
                    </div>
                    <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                      <p className="text-[10px] text-emerald-700 font-bold uppercase">Keseimbangan Otak</p>
                      <p className="font-extrabold text-emerald-950 mt-0.5">Otak Kiri (54%)</p>
                    </div>
                  </div>
                </div>

                {/* Footer preview note */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Format PDF Resmi 2-3 Halaman</span>
                  <span className="font-bold text-slate-700">@copyright Pak GuruAI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE LEVEL EXPLORER (SD vs SMP vs SMA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
              <Sparkles className="w-3.5 h-3.5" />
              Instrumen Khusus Sesuai Tingkat Usia & Kelas
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pilihan Asesmen Diagnostik untuk SD, SMP, dan SMA
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Setiap jenjang pendidikan memiliki karakter dan kebutuhan evaluasi yang berbeda. Pilih tab jenjang di bawah ini untuk melihat fitur yang disesuaikan:
            </p>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-1.5 bg-slate-100 rounded-2xl max-w-xl mx-auto">
            {(['SD', 'SMP', 'SMA'] as EducationLevel[]).map((lvl) => {
              const isSelected = selectedLevelTab === lvl;
              const IconComp = levelDetails[lvl].icon;
              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevelTab(lvl)}
                  className={`flex-1 min-w-[120px] py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 ${
                    isSelected
                      ? levelDetails[lvl].activeTabClass
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>Jenjang {lvl}</span>
                </button>
              );
            })}
          </div>

          {/* Level Showcase Card */}
          <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${currentTabInfo.accentBg}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${currentTabInfo.badgeColor}`}>
                    {currentTabInfo.title}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {currentTabInfo.tagline}
                </h3>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 pt-1">
                  {currentTabInfo.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={onStartRegistration}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Daftar Jenjang {selectedLevelTab} Sekarang</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right: Sample Question Box */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Karakteristik Soal & Laporan
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Jenjang {selectedLevelTab}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-600 block">Fokus Materi Soal:</span>
                    <p className="text-slate-700 mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {currentTabInfo.sampleQuestions}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600 block">Struktur Laporan:</span>
                    <p className="text-slate-700 mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {currentTabInfo.reportFormat}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Semua jawaban otomatis tersimpan aman di penyimpanan lokal perangkat Anda.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 CORE PILLARS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Pemetaan Menyeluruh</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            4 Pilar Utama yang Dianalisis
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Kombinasi uji penalaran objektif dan angket psikometri terstandar menghasilkan potret potensi belajar yang holistik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1: IQ */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Intelegensia Umum (IQ)</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Mengukur kemampuan berpikir logis, nalar numerik, relasi kata, dan daya abstraksi untuk memetakan rentang kecerdasan umum standar.
            </p>
          </div>

          {/* Pillar 2: Multiple Intelligence */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">8 Kecerdasan Majemuk</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Memetakan proporsi spektrum Howard Gardner: Logika-Matematika, Bahasa, Intrapersonal, Interpersonal, Kinestetis, Spasial, Musik, dan Naturalis.
            </p>
          </div>

          {/* Pillar 3: Brain & Learning Style */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Brain Profile & Gaya Belajar</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Menganalisis dominasi otak kiri vs kanan, aktivitas lobus otak, serta kecenderungan modalitas belajar (Tactile, Visual, atau Auditory).
            </p>
          </div>

          {/* Pillar 4: Recommendation */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Arah Studi & Karir</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Panduan pemilihan jurusan SMA/SMK, Potensi Daya Saing (PDS), serta klaster pilihan program studi di Perguruan Tinggi secara terarah.
            </p>
          </div>
        </div>
      </section>

      {/* 5 SESSIONS OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl text-white p-6 sm:p-10 space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Struktur Asesmen 5 Sesi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Pengerjaan Bertahap yang Terstruktur & Nyaman
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Siswa mengerjakan tes secara berurutan. Setiap sesi memiliki panduan instruksi dan batas waktu yang wajar agar konsentrasi tetap terjaga.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-black tracking-wider text-indigo-400 bg-indigo-950/70 px-2 py-0.5 rounded-md inline-block">
                SESI 1
              </span>
              <h4 className="text-sm font-bold text-white">Numerik & Hitung</h4>
              <p className="text-xs text-slate-400">Soal #1 s.d. #10</p>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 pt-1 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>15 Menit</span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-black tracking-wider text-indigo-400 bg-indigo-950/70 px-2 py-0.5 rounded-md inline-block">
                SESI 2
              </span>
              <h4 className="text-sm font-bold text-white">Verbal & Pola Kata</h4>
              <p className="text-xs text-slate-400">Soal #11 s.d. #20</p>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 pt-1 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>10 Menit</span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-black tracking-wider text-indigo-400 bg-indigo-950/70 px-2 py-0.5 rounded-md inline-block">
                SESI 3
              </span>
              <h4 className="text-sm font-bold text-white">Silogisme & Logika</h4>
              <p className="text-xs text-slate-400">Soal #21 s.d. #30</p>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 pt-1 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>20 Menit</span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-black tracking-wider text-indigo-400 bg-indigo-950/70 px-2 py-0.5 rounded-md inline-block">
                SESI 4
              </span>
              <h4 className="text-sm font-bold text-white">Spasial & Figural</h4>
              <p className="text-xs text-slate-400">Soal #31 s.d. #40</p>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 pt-1 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>5 Menit</span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-black tracking-wider text-indigo-400 bg-indigo-950/70 px-2 py-0.5 rounded-md inline-block">
                SESI 5
              </span>
              <h4 className="text-sm font-bold text-white">Inventori Kecerdasan</h4>
              <p className="text-xs text-slate-400">Soal #41 s.d. #120</p>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 pt-1 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>20 Menit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EASY 4 STEPS WORKFLOW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Langkah Praktis</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Alur Pengerjaan Mudah & Cepat
          </h2>
          <p className="text-sm text-slate-600">
            Panduan 4 langkah mudah dari pendaftaran hingga pengunduhan berkas laporan PDF resmi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200/90 text-center space-y-3 shadow-2xs">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center mx-auto text-base shadow-sm">
              1
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Pilih Jenjang & Isi Data</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tentukan jenjang pendidikan (SD, SMP, atau SMA), lengkapi asal sekolah, nomor telepon, dan buat akun peserta tes.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200/90 text-center space-y-3 shadow-2xs">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center mx-auto text-base shadow-sm">
              2
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Jawab Soal Berurutan</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Kerjakan soal per sesi dengan tenang. Jawaban otomatis tersimpan ke memori perangkat pada setiap klik jawaban.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200/90 text-center space-y-3 shadow-2xs">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center mx-auto text-base shadow-sm">
              3
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Konfirmasi Data & Kirim</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Periksa ringkasan jumlah soal yang terjawab, setujui pernyataan integritas data, lalu kirimkan jawaban ke sistem.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200/90 text-center space-y-3 shadow-2xs">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center mx-auto text-base shadow-sm">
              4
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Lihat Analisis & Unduh PDF</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hasil langsung tersaji dalam bentuk grafik radar kecerdasan majemuk dan dapat diunduh menjadi dokumen PDF resmi.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Informasi praktis seputar pengerjaan asesmen diagnostik bagi siswa dan orang tua.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 bg-slate-50/70 hover:bg-slate-100/70 transition cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {faq.q}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER OF INSTITUTION & COPYRIGHT */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 pt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center sm:text-left">
          <div>
            <span className="font-extrabold text-slate-800">{institution.institutionName}</span>
            <span className="hidden sm:inline mx-2">•</span>
            <span className="block sm:inline">{institution.address}</span>
            <span className="hidden sm:inline mx-2">•</span>
            <span className="block sm:inline">Telp: {institution.phone}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold text-slate-800">@copyright Pak GuruAI</span>
            <span className="text-slate-300">•</span>
            <button
              onClick={onAdminClick}
              className="text-slate-500 hover:text-indigo-600 font-semibold cursor-pointer transition"
            >
              Login Pengelola (Admin)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
