import React from 'react';
import { InstitutionSettings, Student } from '../types';
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
  Shield,
  HelpCircle,
  Award,
  Users,
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
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-12 bg-linear-to-b from-blue-50/60 via-slate-50 to-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-semibold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Asesmen Potensi & Diagnostik Jenjang SD / MI, SMP / MTs & SMA / MA / SMK
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-tight">
                Kenali Potensi Akademik, Kecerdasan Majemuk & Dominasi Belajar Siswa SD, SMP & SMA
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Aplikasi asesmen komprehensif terstandar untuk memetakan Intelegensia Umum (IQ), 8 spektrum kecerdasan (Multiple Intelligences), profil aktivitas belahan otak, modalitas belajar sensori, serta rekomendasi terarah untuk penjurusan dan kelanjutan studi.
              </p>

              {/* Status Notice if test is restricted */}
              {!institution.isTestOpen && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs sm:text-sm font-medium flex items-center gap-2 justify-center lg:justify-start">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Sesi tes saat ini sedang ditutup atau dibatasi oleh administrator lembaga.</span>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                {currentStudent ? (
                  <>
                    <button
                      onClick={onStartTest}
                      className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm sm:text-base rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                    >
                      <span>Lanjutkan / Mulai Tes Sekarang</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={onCheckResult}
                      className="px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm sm:text-base rounded-xl transition cursor-pointer"
                    >
                      Lihat Hasil Evaluasi
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onStartRegistration}
                      className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer"
                    >
                      <span>Mulai Pendaftaran & Tes</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={onCheckResult}
                      className="px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm sm:text-base rounded-xl transition shadow-xs cursor-pointer"
                    >
                      Cek & Unduh Laporan PDF
                    </button>
                  </>
                )}
              </div>

              {/* Quick stats badges */}
              <div className="pt-4 grid grid-cols-3 gap-3 border-t border-slate-200 text-center lg:text-left">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">120</p>
                  <p className="text-xs text-slate-500 font-medium">Butir Soal & Inventori</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">5 Sesi</p>
                  <p className="text-xs text-slate-500 font-medium">Waktu Terstruktur</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">2 - 3 Hal</p>
                  <p className="text-xs text-slate-500 font-medium">Laporan Resmi PDF</p>
                </div>
              </div>
            </div>

            {/* Visual Hero Mockup Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Pratinjau Output Diagnostik</p>
                      <p className="text-[10px] text-slate-400">Standar Evaluasi SMA</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Sistem Otomatis
                  </span>
                </div>

                {/* Score Sample preview */}
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-slate-700">Intelegensia Umum (IQ)</span>
                      <span className="font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">114 (Normal Atas)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '68%' }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Spektrum Kecerdasan Dominan</span>
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                          <span>Intrapersonal</span>
                          <span className="font-bold">70.67%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: '70.67%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                          <span>Logika Matematika</span>
                          <span className="font-bold">62.64%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-sky-500 h-full rounded-full" style={{ width: '62.64%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                          <span>Bahasa & Linguistik</span>
                          <span className="font-bold">60.89%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: '60.89%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Brain Profile Badge */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-100">
                      <p className="text-[10px] text-indigo-700 font-semibold">Gaya Belajar Sensori</p>
                      <p className="text-xs font-bold text-indigo-900 mt-0.5">Tactile / Kinestetik</p>
                    </div>
                    <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-100">
                      <p className="text-[10px] text-blue-700 font-semibold">Saran Penjurusan</p>
                      <p className="text-xs font-bold text-blue-900 mt-0.5">MIPA / Soshum (PDS 90%)</p>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-1 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Laporan lengkap dapat diunduh langsung dalam format PDF resmi.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Apa Saja yang Diukur dalam Tes Diagnostik?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Instrumen diagnostik ini memadukan tes penalaran objektif dengan angket psikometrik untuk menghasilkan pemetaan potensi belajar yang holistik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Intelegensia Umum (IQ)</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Mengukur kemampuan berpikir logis, penalaran numerik, daya abstraksi verbal, dan pemahaman relasi masalah untuk menentukan rentang kecerdasan umum standar.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">8 Kecerdasan Majemuk</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Memetakan proporsi kecerdasan Howard Gardner: Logika-Matematika, Bahasa, Intrapersonal, Interpersonal, Kinestetis, Visual-Ruang, Musikal, dan Naturalis.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Brain Analysis & Gaya Belajar</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Menganalisa aktivitas lobus otak (Frontal, Parietal, Occipital, Temporal), dominasi otak kiri vs kanan, serta gaya belajar sensori (Tactile, Visual, Auditory).
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Rekomendasi Karir & Jurusan</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Memberikan panduan pemilihan mata pelajaran pilihan di SMA, estimasi Potensi Daya Saing (PDS), serta klaster prioritas program studi di Perguruan Tinggi.
            </p>
          </div>
        </div>
      </section>

      {/* Structure of 5 Sessions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl text-white p-8 sm:p-12">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Struktur Instrumen Asesmen</span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-1 text-white">5 Sesi Pengerjaan Soal Terstandar</h2>
            <p className="text-slate-300 text-sm sm:text-base mt-2">
              Siswa mengerjakan tes secara berurutan. Setiap sesi memiliki durasi pengerjaan masing-masing untuk menjaga validitas hasil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl space-y-2">
              <span className="text-xs font-bold text-indigo-400">SESI 1</span>
              <h4 className="text-sm font-semibold text-white">Numerik & Hitung</h4>
              <p className="text-xs text-slate-400">Soal 1 s.d. 10</p>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>15 Menit</span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl space-y-2">
              <span className="text-xs font-bold text-indigo-400">SESI 2</span>
              <h4 className="text-sm font-semibold text-white">Verbal & Pola Kata</h4>
              <p className="text-xs text-slate-400">Soal 11 s.d. 20</p>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>10 Menit</span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl space-y-2">
              <span className="text-xs font-bold text-indigo-400">SESI 3</span>
              <h4 className="text-sm font-semibold text-white">Silogisme & Analitik</h4>
              <p className="text-xs text-slate-400">Soal 21 s.d. 30</p>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>20 Menit</span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl space-y-2">
              <span className="text-xs font-bold text-indigo-400">SESI 4</span>
              <h4 className="text-sm font-semibold text-white">Spasial & Figural</h4>
              <p className="text-xs text-slate-400">Soal 31 s.d. 40</p>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>5 Menit</span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl space-y-2">
              <span className="text-xs font-bold text-indigo-400">SESI 5</span>
              <h4 className="text-sm font-semibold text-white">Inventori Kecerdasan</h4>
              <p className="text-xs text-slate-400">Soal 41 s.d. 120</p>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>20 Menit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step by Step Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Alur Pengerjaan Tes & Penerimaan Hasil
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Langkah mudah bagi siswa dari registrasi hingga pengunduhan berkas laporan PDF.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="relative p-6 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto text-sm">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Input Identitas Lengkap</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Isi data nama lengkap, tempat tanggal lahir, asal sekolah, kelas, no handphone siswa & orang tua, serta username dan password.
            </p>
          </div>

          <div className="relative p-6 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto text-sm">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Mengerjakan Tes</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Siswa menjawab soal per sesi secara teratur dan cermat sesuai arahan petunjuk dan batasan waktu pengerjaan.
            </p>
          </div>

          <div className="relative p-6 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto text-sm">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Konfirmasi Kebenaran Data</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Setelah selesai, siswa mencentang kotak integritas data sebelum mengirim jawaban ke sistem basis data Firebase.
            </p>
          </div>

          <div className="relative p-6 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto text-sm">
              4
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Analisa & Unduh PDF</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hasil dianalisa oleh algoritma psikometri dan dapat diunduh dalam format PDF resmi 3 halaman penuh.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Info of Institution */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 pt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-bold text-slate-700">{institution.institutionName}</span>
            <span className="mx-2">•</span>
            <span>{institution.address}</span>
            <span className="mx-2">•</span>
            <span>Telp: {institution.phone}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold text-slate-700">@copyright Pak GuruAI</span>
            <span className="text-slate-300">•</span>
            <button
              onClick={onAdminClick}
              className="text-slate-500 hover:text-indigo-600 font-medium cursor-pointer"
            >
              Login Pengelola (Admin)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
