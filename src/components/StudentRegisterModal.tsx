import React, { useState } from 'react';
import { EducationLevel, Student } from '../types';
import { registerStudent } from '../services/dbService';
import { X, User, Calendar, MapPin, School, BookOpen, Phone, Lock, ArrowRight, AlertCircle, Layers } from 'lucide-react';

interface StudentRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (student: Student) => void;
  onSwitchToLogin: () => void;
}

export const StudentRegisterModal: React.FC<StudentRegisterModalProps> = ({
  isOpen,
  onClose,
  onRegistered,
  onSwitchToLogin,
}) => {
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('SMA');
  const [fullName, setFullName] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [schoolOrigin, setSchoolOrigin] = useState('');
  const [grade, setGrade] = useState('X (Sepuluh)');
  const [studentPhone, setStudentPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLevelChange = (newLevel: EducationLevel) => {
    setEducationLevel(newLevel);
    if (newLevel === 'SD') {
      setGrade('Kelas 5 SD (Kelas V)');
    } else if (newLevel === 'SMP') {
      setGrade('7 SMP (Kelas VII)');
    } else {
      setGrade('X (Sepuluh)');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !fullName.trim() ||
      !birthPlace.trim() ||
      !birthDate ||
      !schoolOrigin.trim() ||
      !studentPhone.trim() ||
      !parentPhone.trim() ||
      !username.trim() ||
      !password.trim()
    ) {
      setError('Mohon lengkapi seluruh kolom identitas yang wajib diisi.');
      return;
    }

    if (username.length < 4) {
      setError('Username minimal terdiri dari 4 karakter.');
      return;
    }

    if (password.length < 4) {
      setError('Password minimal terdiri dari 4 karakter.');
      return;
    }

    setLoading(true);
    try {
      const student = await registerStudent({
        fullName: fullName.trim(),
        birthPlace: birthPlace.trim(),
        birthDate,
        educationLevel,
        schoolOrigin: schoolOrigin.trim(),
        grade,
        studentPhone: studentPhone.trim(),
        parentPhone: parentPhone.trim(),
        username: username.trim().toLowerCase(),
        password: password.trim(),
      });

      onRegistered(student);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mendaftarkan data siswa. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-linear-to-r from-indigo-50/50 to-white">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Formulir Identitas Peserta Tes</h3>
            <p className="text-xs text-slate-500">Pilih jenjang pendidikan dan lengkapi data diri Anda</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Jenjang Pendidikan Selection */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Jenjang Pendidikan Peserta <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Pilihan jenjang ini akan secara otomatis menyesuaikan paket soal (SD, SMP, atau SMA) yang tampil saat tes.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleLevelChange('SD')}
                className={`p-3 rounded-xl border-2 flex items-center gap-3 transition cursor-pointer text-left ${
                  educationLevel === 'SD'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    educationLevel === 'SD' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                  }`}
                >
                  {educationLevel === 'SD' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <span className="block text-xs sm:text-sm font-bold">Jenjang SD / MI</span>
                  <span className="text-[10px] text-slate-500 font-normal">Soal terstandar tingkat SD</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleLevelChange('SMP')}
                className={`p-3 rounded-xl border-2 flex items-center gap-3 transition cursor-pointer text-left ${
                  educationLevel === 'SMP'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    educationLevel === 'SMP' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                  }`}
                >
                  {educationLevel === 'SMP' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <span className="block text-xs sm:text-sm font-bold">Jenjang SMP / MTs</span>
                  <span className="text-[10px] text-slate-500 font-normal">Soal terstandar tingkat SMP</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleLevelChange('SMA')}
                className={`p-3 rounded-xl border-2 flex items-center gap-3 transition cursor-pointer text-left ${
                  educationLevel === 'SMA'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    educationLevel === 'SMA' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                  }`}
                >
                  {educationLevel === 'SMA' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <span className="block text-xs sm:text-sm font-bold">Jenjang SMA / MA</span>
                  <span className="text-[10px] text-slate-500 font-normal">Soal terstandar tingkat SMA</span>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Siswa <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Alika Choirotunnisa"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                />
              </div>
            </div>

            {/* Tempat & Tanggal Lahir */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tempat Lahir <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Surabaya"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Lahir <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Asal Sekolah & Kelas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asal Sekolah <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder={
                      educationLevel === 'SD'
                        ? 'Contoh: SDN Menteng 01'
                        : educationLevel === 'SMP'
                        ? 'Contoh: SMP Budi Mulia'
                        : 'Contoh: SMAN 1 Jakarta'
                    }
                    value={schoolOrigin}
                    onChange={(e) => setSchoolOrigin(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kelas <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden bg-white"
                  >
                    {educationLevel === 'SD' ? (
                      <>
                        <option value="Kelas 4 SD (Kelas IV)">Kelas 4 SD (Kelas IV)</option>
                        <option value="Kelas 5 SD (Kelas V)">Kelas 5 SD (Kelas V)</option>
                        <option value="Kelas 6 SD (Kelas VI)">Kelas 6 SD (Kelas VI)</option>
                        <option value="Kelas 1-3 SD">Kelas 1-3 SD</option>
                      </>
                    ) : educationLevel === 'SMP' ? (
                      <>
                        <option value="7 SMP (Kelas VII)">7 SMP (Kelas VII)</option>
                        <option value="8 SMP (Kelas VIII)">8 SMP (Kelas VIII)</option>
                        <option value="9 SMP (Kelas IX)">9 SMP (Kelas IX)</option>
                      </>
                    ) : (
                      <>
                        <option value="X (Sepuluh)">Kelas X (Sepuluh)</option>
                        <option value="XI (Sebelas)">Kelas XI (Sebelas)</option>
                        <option value="XII (Dua Belas)">Kelas XII (Dua Belas)</option>
                        <option value="Alumni / Persiapan PTN">Alumni / GAP Year</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* No HP Siswa & Orang Tua */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. HP / WhatsApp Siswa <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 08123456789"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. HP / WhatsApp Orang Tua <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 08139876543"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Akun Kredensial */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Akun Kredensial Akses Hasil & Tes
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username Siswa <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Username tanpa spasi"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="Minimal 4 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              Sudah punya akun? Masuk di sini
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Menyimpan...' : 'Simpan & Lanjut ke Tes'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
