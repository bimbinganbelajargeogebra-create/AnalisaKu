import React from 'react';
import { InstitutionSettings, Student } from '../types';
import { GraduationCap, ShieldCheck, UserCheck, LogOut, FileText, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  institution: InstitutionSettings;
  currentStudent: Student | null;
  isAdmin: boolean;
  onOpenRegister: () => void;
  onOpenStudentLogin: () => void;
  onOpenAdminLogin: () => void;
  onLogoutStudent: () => void;
  onLogoutAdmin: () => void;
  onNavigateHome: () => void;
  onNavigateResult?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  institution,
  currentStudent,
  isAdmin,
  onOpenRegister,
  onOpenStudentLogin,
  onOpenAdminLogin,
  onLogoutStudent,
  onLogoutAdmin,
  onNavigateHome,
  onNavigateResult,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand */}
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-3 text-left focus:outline-hidden group cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight block group-hover:text-indigo-600 transition-colors">
                {institution.institutionName || 'Asesmen Diagnostik Siswa'}
              </span>
              <span className="text-xs text-slate-500 hidden sm:block">
                Evaluasi Potensi Akademik, Kecerdasan & Gaya Belajar
              </span>
            </div>
          </button>

          {/* Nav Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAdmin ? (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-semibold text-amber-900 hidden sm:inline">Admin Mode</span>
                <button
                  onClick={onLogoutAdmin}
                  className="text-xs text-amber-700 hover:text-amber-900 font-medium ml-2 flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            ) : currentStudent ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {onNavigateResult && (
                  <button
                    onClick={onNavigateResult}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-2 rounded-lg transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Hasil Tes Saya</span>
                  </button>
                )}
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-800 truncate max-w-[120px] sm:max-w-[160px]">
                    {currentStudent.fullName}
                  </span>
                  <button
                    onClick={onLogoutStudent}
                    title="Keluar Akun Siswa"
                    className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenStudentLogin}
                  className="px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Login Siswa
                </button>
                <button
                  onClick={onOpenRegister}
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition cursor-pointer"
                >
                  Daftar Tes
                </button>
                <button
                  onClick={onOpenAdminLogin}
                  title="Masuk sebagai Administrator"
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition ml-1 cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
